import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HousingService } from '../../services/housing.service';
import { User } from '../../models/user.model';
import { HousingListing, SearchFilters } from '../../models/housing.model';

// Matched Profile Interface
export interface MatchedProfile {
  id: string;
  fullName: string;
  age: number;
  occupation: string;
  budgetRange: string;
  locationPreference: string;
  matchPercentage: number;
  sharedInterests: string[];
  profileImage?: string;
  lastActive: Date;
}

// Chat Message Interface
export interface ChatMessage {
  id: string;
  profileId: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  zipForm: FormGroup;
  housingSearchForm: FormGroup;
  
  // Tab management - fixed type to include 'matches' instead of 'messages'
  public activeTab: 'home' | 'apartments' | 'saved' | 'matches' | 'profile' = 'home';
  public mobileMenuOpen = false;
  
  // Housing search properties
  housingResults: HousingListing[] = [];
  featuredListings: HousingListing[] = [];
  isSearchingHousing = false;
  hasSearchedHousing = false;
  
  // Matched Profiles properties
  matchedProfiles: MatchedProfile[] = [];
  selectedProfile: MatchedProfile | null = null;
  newMessage = '';
  chatMessages: ChatMessage[] = [];
  
  // Legacy properties for roommate search
  matches: any[] = [];
  isSearching = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private housingService: HousingService,
    private router: Router
  ) {
    // Legacy roommate search form
    this.zipForm = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // New housing search form
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
    this.loadFeaturedListings();
    this.loadMatchedProfiles();
    this.initializeChatMessages();
  }

  private loadCurrentUser(): void {
    // Get user from localStorage first
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        console.log('User loaded from localStorage:', this.currentUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Also try from AuthService
    if (this.authService.currentUser$) {
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            console.log('User loaded from AuthService:', this.currentUser);
          }
        },
        error: (error) => {
          console.error('Error getting user from AuthService:', error);
        }
      });
    }

    // Try to get fresh user data from backend (will work when backend is ready)
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          console.log('Fresh user data loaded:', user);
        }
      },
      error: (error) => {
        console.log('Backend not ready yet for fresh user data:', error);
      }
    });
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

  private loadMatchedProfiles(): void {
    // Mock matched profiles based on user preferences
    this.matchedProfiles = [
      {
        id: '1',
        fullName: 'Sarah Johnson',
        age: 24,
        occupation: 'Graphic Designer',
        budgetRange: '$1000-1400/month',
        locationPreference: 'Downtown',
        matchPercentage: 92,
        sharedInterests: ['Clean Living', 'Night Owl', 'Pet Friendly', 'Downtown Location'],
        lastActive: new Date()
      },
      {
        id: '2',
        fullName: 'Mike Chen',
        age: 26,
        occupation: 'Software Engineer',
        budgetRange: '$1200-1600/month',
        locationPreference: 'Tech District',
        matchPercentage: 88,
        sharedInterests: ['Tech Industry', 'Clean Living', 'Gym Access', 'Quiet Environment'],
        lastActive: new Date()
      },
      {
        id: '3',
        fullName: 'Emma Davis',
        age: 23,
        occupation: 'Marketing Specialist',
        budgetRange: '$900-1300/month',
        locationPreference: 'Near Campus',
        matchPercentage: 85,
        sharedInterests: ['Young Professional', 'Social', 'Budget Conscious', 'Near Transit'],
        lastActive: new Date()
      },
      {
        id: '4',
        fullName: 'Alex Rodriguez',
        age: 25,
        occupation: 'Data Analyst',
        budgetRange: '$1100-1500/month',
        locationPreference: 'Midtown',
        matchPercentage: 82,
        sharedInterests: ['Professional', 'Clean Living', 'Fitness', 'Work-Life Balance'],
        lastActive: new Date()
      },
      {
        id: '5',
        fullName: 'Jessica Kim',
        age: 27,
        occupation: 'UX Designer',
        budgetRange: '$1300-1700/month',
        locationPreference: 'Arts District',
        matchPercentage: 79,
        sharedInterests: ['Creative Field', 'Modern Living', 'Art & Culture', 'Professional'],
        lastActive: new Date()
      }
    ];
  }

  private initializeChatMessages(): void {
    // Initialize sample chat messages for each profile
    this.chatMessages = [
      {
        id: '1',
        profileId: '1',
        text: 'Hi! I saw we matched based on our apartment preferences. Are you still looking for a roommate?',
        isOwn: false,
        timestamp: new Date(Date.now() - 3600000) // 1 hour ago
      },
      {
        id: '2',
        profileId: '1',
        text: 'Yes! I love that we both prefer downtown and are okay with pets. Have you found any good apartments yet?',
        isOwn: true,
        timestamp: new Date(Date.now() - 3000000) // 50 minutes ago
      },
      {
        id: '3',
        profileId: '2',
        text: 'Hey! Fellow software engineer here. I noticed we have similar budgets and both work in tech. Want to chat about potential apartments?',
        isOwn: false,
        timestamp: new Date(Date.now() - 7200000) // 2 hours ago
      }
    ];
  }

  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Matched Profiles methods
  selectProfile(profile: MatchedProfile): void {
    this.selectedProfile = profile;
  }

  getChatMessages(profileId: string): ChatMessage[] {
    return this.chatMessages.filter(msg => msg.profileId === profileId);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedProfile) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      profileId: this.selectedProfile.id,
      text: this.newMessage.trim(),
      isOwn: true,
      timestamp: new Date()
    };

    this.chatMessages.push(message);
    this.newMessage = '';

    // Simulate response after a delay
    setTimeout(() => {
      const responses = [
        "That sounds great! I'd love to learn more.",
        "I'm definitely interested. When would be a good time to meet?",
        "Perfect! I was thinking the same thing.",
        "That apartment looks amazing! Should we schedule a viewing?",
        "I agree! Let's definitely discuss this further."
      ];
      
      const responseMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        profileId: this.selectedProfile!.id,
        text: responses[Math.floor(Math.random() * responses.length)],
        isOwn: false,
        timestamp: new Date()
      };
      
      this.chatMessages.push(responseMessage);
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
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

    // Add amenities based on checkboxes
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

  // Legacy roommate search methods (keeping for backward compatibility)
  searchRoommates(): void {
    if (this.zipForm.valid) {
      this.isSearching = true;
      this.errorMessage = '';
      this.hasSearched = true;

      const zipCode = this.zipForm.get('zipCode')?.value;
      console.log('Searching for roommates in ZIP:', zipCode);
      
      // Simulate search
      setTimeout(() => {
        this.matches = [];
        this.isSearching = false;
        this.errorMessage = 'Roommate search functionality will be added in future updates.';
      }, 1000);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}