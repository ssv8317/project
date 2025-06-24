import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HousingService } from '../../services/housing.service';
import { MatchService } from '../../services/match.service';
import { User } from '../../models/user.model';
import { HousingListing, SearchFilters } from '../../models/housing.model';
import { MatchResponse, RoommateProfile, UserAction } from '../../models/match.model';

// Chat Message Interface
export interface ChatMessage {
  id: string;
  profileId: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

// Define tab type separately for better type safety
export type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  userProfile: RoommateProfile | null = null;
  hasProfile = false;
  isCheckingProfile = true;
  
  zipForm: FormGroup;
  housingSearchForm: FormGroup;
  
  // Tab management
  public activeTab: TabType = 'home';
  public mobileMenuOpen = false;
  
  // Housing search properties
  housingResults: HousingListing[] = [];
  featuredListings: HousingListing[] = [];
  isSearchingHousing = false;
  hasSearchedHousing = false;
  
  // Roommate matching properties
  potentialMatches: MatchResponse[] = [];
  confirmedMatches: MatchResponse[] = [];
  currentMatchIndex = 0;
  isLoadingMatches = false;
  
  // Chat properties
  selectedMatch: MatchResponse | null = null;
  newMessage = '';
  chatMessages: ChatMessage[] = [];
  public isTyping = false;
  
  // Legacy properties for roommate search
  matches: any[] = [];
  isSearching = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private housingService: HousingService,
    private matchService: MatchService,
    private router: Router
  ) {
    // Legacy roommate search form
    this.zipForm = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // Housing search form
    this.housingSearchForm = this.fb.group({
      zipCode: ['', [Validators.pattern(/^\d{5}$/)]],
      maxPrice: [''],
      bedrooms: [''],
      petFriendly: [false],
      furnished: [false],
      parking: [false],
      gym: [false]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          this.checkUserProfile();
        } else {
          this.router.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.router.navigate(['/login']);
      }
    });
  }

  private checkUserProfile(): void {
    if (!this.currentUser?.id) return;

    this.isCheckingProfile = true;
    
    this.matchService.checkUserProfile(this.currentUser.id).subscribe({
      next: (response) => {
        this.hasProfile = response.hasProfile;
        this.userProfile = response.profile || null;
        this.isCheckingProfile = false;
        
        if (this.hasProfile) {
          this.loadDashboardData();
        }
      },
      error: (error) => {
        console.error('Error checking profile:', error);
        this.hasProfile = false;
        this.isCheckingProfile = false;
      }
    });
  }

  private loadDashboardData(): void {
    this.loadFeaturedListings();
    this.loadPotentialMatches();
    this.loadConfirmedMatches();
    this.initializeChatMessages();
  }

  private loadFeaturedListings(): void {
    this.housingService.getFeaturedListings().subscribe({
      next: (listings) => {
        this.featuredListings = listings;
      },
      error: (error) => {
        console.error('Error loading featured listings:', error);
      }
    });
  }

  public loadPotentialMatches(): void {
    if (!this.currentUser?.id) return;

    this.isLoadingMatches = true;
    this.matchService.getPotentialMatches(this.currentUser.id).subscribe({
      next: (matches) => {
        this.potentialMatches = matches;
        this.isLoadingMatches = false;
      },
      error: (error) => {
        console.error('Error loading potential matches:', error);
        this.isLoadingMatches = false;
      }
    });
  }

  private loadConfirmedMatches(): void {
    if (!this.currentUser?.id) return;

    this.matchService.getMatches(this.currentUser.id).subscribe({
      next: (matches) => {
        this.confirmedMatches = matches;
      },
      error: (error) => {
        console.error('Error loading confirmed matches:', error);
      }
    });
  }

  private initializeChatMessages(): void {
    // Initialize sample chat messages for confirmed matches
    this.chatMessages = this.confirmedMatches.map((match, index) => ({
      id: `${index + 1}`,
      profileId: match.id,
      text: `Hi! I saw we matched based on our preferences. Are you still looking for a roommate?`,
      isOwn: false,
      timestamp: new Date(Date.now() - (index + 1) * 3600000)
    }));
  }

  // Profile setup navigation
  goToProfileSetup(): void {
    this.router.navigate(['/profile-setup']);
  }

  // Roommate matching methods
  getCurrentMatch(): MatchResponse | null {
    return this.potentialMatches[this.currentMatchIndex] || null;
  }

  swipeLeft(): void {
    const currentMatch = this.getCurrentMatch();
    if (currentMatch && this.currentUser?.id) {
      this.matchService.swipe(this.currentUser.id, {
        targetUserId: currentMatch.profile.userId,
        action: UserAction.Pass
      }).subscribe({
        next: () => {
          this.nextMatch();
        },
        error: (error) => {
          console.error('Error swiping left:', error);
          this.nextMatch(); // Continue even if API fails
        }
      });
    }
  }

  swipeRight(): void {
    const currentMatch = this.getCurrentMatch();
    if (currentMatch && this.currentUser?.id) {
      this.matchService.swipe(this.currentUser.id, {
        targetUserId: currentMatch.profile.userId,
        action: UserAction.Like
      }).subscribe({
        next: (response) => {
          if (response.isMatched) {
            // It's a match! Add to confirmed matches
            this.confirmedMatches.unshift(response);
            this.showMatchNotification(response);
          }
          this.nextMatch();
        },
        error: (error) => {
          console.error('Error swiping right:', error);
          this.nextMatch(); // Continue even if API fails
        }
      });
    }
  }

  superLike(): void {
    const currentMatch = this.getCurrentMatch();
    if (currentMatch && this.currentUser?.id) {
      this.matchService.swipe(this.currentUser.id, {
        targetUserId: currentMatch.profile.userId,
        action: UserAction.SuperLike
      }).subscribe({
        next: (response) => {
          if (response.isMatched) {
            this.confirmedMatches.unshift(response);
            this.showMatchNotification(response);
          }
          this.nextMatch();
        },
        error: (error) => {
          console.error('Error super liking:', error);
          this.nextMatch();
        }
      });
    }
  }

  private nextMatch(): void {
    this.currentMatchIndex++;
    if (this.currentMatchIndex >= this.potentialMatches.length) {
      // Load more matches or show "no more matches" message
      this.loadPotentialMatches();
      this.currentMatchIndex = 0;
    }
  }

  private showMatchNotification(match: MatchResponse): void {
    // You can implement a toast notification or modal here
    console.log('New match!', match.profile.displayName);
  }

  // Chat methods
  selectMatch(match: MatchResponse): void {
    this.selectedMatch = match;
  }

  getChatMessages(matchId: string): ChatMessage[] {
    return this.chatMessages.filter(msg => msg.profileId === matchId);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedMatch) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      profileId: this.selectedMatch.id,
      text: this.newMessage.trim(),
      isOwn: true,
      timestamp: new Date()
    };

    this.chatMessages.push(message);
    this.newMessage = '';

    // Show typing indicator
    this.isTyping = true;

    // Simulate response after a delay
    setTimeout(() => {
      this.isTyping = false;
      
      const responses = [
        "That sounds great! I'd love to learn more.",
        "I'm definitely interested. When would be a good time to meet?",
        "Perfect! I was thinking the same thing.",
        "That apartment looks amazing! Should we schedule a viewing?",
        "I agree! Let's definitely discuss this further."
      ];
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        profileId: this.selectedMatch!.id,
        text: responses[Math.floor(Math.random() * responses.length)],
        isOwn: false,
        timestamp: new Date()
      };
      
      this.chatMessages.push(responseMessage);
    }, 1000 + Math.random() * 2000);
  }

  // Housing search methods
  searchHousing(): void {
    this.isSearchingHousing = true;
    this.hasSearchedHousing = true;

    const formValue = this.housingSearchForm.value;
    const filters: Partial<SearchFilters> = {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };

    if (formValue.parking) filters.amenities?.push('Parking');
    if (formValue.gym) filters.amenities?.push('Gym');

    this.housingService.searchHousing(filters).subscribe({
      next: (results) => {
        this.housingResults = results;
        this.isSearchingHousing = false;
      },
      error: (error) => {
        console.error('Housing search error:', error);
        this.isSearchingHousing = false;
      }
    });
  }

  onSortChange(event: any): void {
    const [sortBy, sortOrder] = event.target.value.split('-');
    const currentFilters = this.getCurrentHousingFilters();
    currentFilters.sortBy = sortBy as any;
    currentFilters.sortOrder = sortOrder as any;

    this.housingService.searchHousing(currentFilters).subscribe({
      next: (results) => {
        this.housingResults = results;
      }
    });
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false;
  }

  private getCurrentHousingFilters(): Partial<SearchFilters> {
    const formValue = this.housingSearchForm.value;
    return {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: []
    };
  }

  // Utility methods
  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Legacy roommate search methods (keeping for backward compatibility)
  searchRoommates(): void {
    if (this.zipForm.valid) {
      this.isSearching = true;
      this.errorMessage = '';
      this.hasSearched = true;

      const zipCode = this.zipForm.get('zipCode')?.value;
      console.log('Searching for roommates in ZIP:', zipCode);
      
      setTimeout(() => {
        this.matches = [];
        this.isSearching = false;
        this.errorMessage = 'Please complete your roommate profile to see matches.';
      }, 1000);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}