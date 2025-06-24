import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatchService, MatchResponse, RoommateProfile, SwipeRequest, UserAction } from '../../services/match.service';
import { HousingService } from '../../services/housing.service';
import { MessageService, ChatMessage, Conversation } from '../../services/message.service';
import { User } from '../../models/user.model';
import { HousingListing } from '../../models/housing.model';

type TabType = 'home' | 'apartments' | 'saved' | 'matches' | 'messages' | 'profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: TabType = 'home';

  // User and UI state
  currentUser: User | null = null;
  mobileMenuOpen: boolean = false;
  loading = false;
  error: string | null = null;

  // Housing related
  featuredListings: HousingListing[] = [];
  housingResults: HousingListing[] = [];
  isSearchingHousing: boolean = false;
  hasSearchedHousing: boolean = false;

  housingSearchForm: FormGroup;

  // Matches and messaging
  potentialMatches: MatchResponse[] = [];
  userMatches: MatchResponse[] = [];
  currentMatchIndex = 0;
  isLoadingMatches = false;
  isLoadingUserMatches = false;
  showMatchModal = false;
  newMatch: MatchResponse | null = null;

  // Messages
  conversations: Conversation[] = [];
  messages: ChatMessage[] = [];
  newMessage: string = '';
  selectedConversation: Conversation | null = null;
  selectedProfile: any;
  chatMessages: { [profileId: string]: any[] } = {};
  isLoadingConversations = false;
  isLoadingMessages = false;

  // Add this property to your component class
  matchedProfiles: any[] = [];
  public isTyping: boolean = false;

  constructor(
    private authService: AuthService,
    public matchService: MatchService, // <-- Make public for template access
    private housingService: HousingService,
    private messageService: MessageService,
    private formBuilder: FormBuilder
  ) {
    this.housingSearchForm = this.formBuilder.group({
      zipCode: [''],
      maxPrice: [''],
      minPrice: [''],
      bedrooms: [''],
      bathrooms: [''],
      propertyType: [''],
      petFriendly: [false],
      furnished: [false],
      parking: [false],
      gym: [false],
      pool: [false],
      balcony: [false],
      amenities: ['']
    });
  }

  ngOnInit(): void {
    console.log('🚀 Dashboard component initializing...');
    this.loadCurrentUser();
    this.loadFeaturedListings();
    this.loadPotentialMatches();
    this.loadConversations();
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        if (user) {
          console.log('👤 Current user loaded:', user);
          this.currentUser = user;
          this.loadUserMatches();
          this.loadConversations();
        }
      },
      error: (error: any) => {
        console.error('❌ Error loading user:', error);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }

  loadFeaturedListings(): void {
    this.loading = true;
    this.housingService.getFeaturedListings().subscribe({
      next: (listings: HousingListing[]) => {
        this.featuredListings = listings;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading featured listings:', error);
        this.loading = false;
      }
    });
  }

  searchHousing(): void {
    if (this.housingSearchForm.valid) {
      this.isSearchingHousing = true;
      this.hasSearchedHousing = true;
      const filters = this.housingSearchForm.value;
      this.housingService.searchHousing(filters).subscribe({
        next: (results: HousingListing[]) => {
          this.housingResults = results;
          this.isSearchingHousing = false;
        },
        error: (error: any) => {
          console.error('Search error:', error);
          this.housingResults = [];
          this.isSearchingHousing = false;
          this.hasSearchedHousing = true;
        }
      });
    }
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false;
  }

  sortHousingResults(event: any): void {
    const sortValue = event.target.value;
    if (this.housingResults.length === 0) return;
    switch (sortValue) {
      case 'price-asc':
        this.housingResults.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.housingResults.sort((a, b) => b.price - a.price);
        break;
      case 'date-desc':
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case 'date-asc':
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateA - dateB;
        });
        break;
      case 'bedrooms-desc':
        this.housingResults.sort((a, b) => b.bedrooms - a.bedrooms);
        break;
      case 'bedrooms-asc':
        this.housingResults.sort((a, b) => a.bedrooms - b.bedrooms);
        break;
      case 'rating-desc':
        this.housingResults.sort((a, b) => {
          const ratingA = a.landlord?.rating || 0;
          const ratingB = b.landlord?.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        this.housingResults.sort((a, b) => {
          const dateA = new Date(a.datePosted || a.createdAt).getTime();
          const dateB = new Date(b.datePosted || b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
    }
  }

  // --- MATCHING SYSTEM METHODS ---

  loadPotentialMatches(): void {
    if (this.currentUser?.id) {
      console.log('🔍 Loading potential matches for user:', this.currentUser.id);
      this.isLoadingMatches = true;
      this.matchService.getPotentialMatches(this.currentUser.id).subscribe({
        next: (matches) => {
          console.log('✅ Potential matches loaded:', matches);
          this.potentialMatches = matches;
          this.currentMatchIndex = 0; // Reset index when loading new matches
          this.isLoadingMatches = false;
        },
        error: (error) => {
          console.error('❌ Error loading potential matches:', error);
          this.isLoadingMatches = false;
        }
      });
    }
  }

  // Add swipeLeft and swipeRight for template compatibility
  swipeLeft(): void {
    this.onSwipe(UserAction.Pass);
  }

  swipeRight(): void {
    this.onSwipe(UserAction.Like);
  }

  onSwipe(action: UserAction): void {
    if (this.currentUser && this.currentUser.id && this.potentialMatches.length > 0) {
      const currentMatch = this.potentialMatches[this.currentMatchIndex];
      const request: SwipeRequest = {
        profileId: currentMatch.profile.id,
        action: action
      };
      
      console.log('👆 Processing swipe:', request);
      
      this.matchService.swipe(this.currentUser.id, request).subscribe({
        next: (response) => {
          console.log('✅ Swipe processed:', response);
          if (response.isNewMatch) {
            this.newMatch = response;
            this.showMatchModal = true;
            // Refresh matches list
            this.loadUserMatches();
          }
          this.nextMatch();
        },
        error: (error) => {
          console.error('❌ Error processing swipe:', error);
          this.nextMatch();
        }
      });
    }
  }

  nextMatch(): void {
    this.currentMatchIndex++;
    if (this.currentMatchIndex >= this.potentialMatches.length) {
      this.currentMatchIndex = 0;
      // Optionally reload matches or show a message
      console.log('🔄 Reached end of potential matches, reloading...');
      this.loadPotentialMatches();
    }
  }

  getCurrentMatch(): MatchResponse | null {
    return this.potentialMatches.length > 0 && this.currentMatchIndex < this.potentialMatches.length
      ? this.potentialMatches[this.currentMatchIndex]
      : null;
  }

  loadUserMatches(): void {
    if (this.currentUser?.id) {
      console.log('💑 Loading user matches for:', this.currentUser.id);
      this.isLoadingUserMatches = true;
      this.matchService.getMatches(this.currentUser.id).subscribe({
        next: (matches: MatchResponse[]) => {
          console.log('✅ User matches loaded:', matches);
          this.userMatches = matches;
          this.matchedProfiles = matches; // Also update matchedProfiles for template
          this.isLoadingUserMatches = false;
        },
        error: (error: any) => {
          console.error('❌ Error loading matches:', error);
          this.isLoadingUserMatches = false;
        }
      });
    }
  }

  // --- END MATCHING SYSTEM METHODS ---

  // --- MESSAGING METHODS ---

  loadConversations(): void {
    if (this.currentUser?.id) {
      console.log('💬 Loading conversations for user:', this.currentUser.id);
      this.isLoadingConversations = true;
      this.messageService.getConversations(this.currentUser.id).subscribe({
        next: (conversations: Conversation[]) => {
          console.log('✅ Conversations loaded:', conversations);
          this.conversations = conversations;
          this.isLoadingConversations = false;
        },
        error: (error: any) => {
          console.error('❌ Error loading conversations:', error);
          this.isLoadingConversations = false;
        }
      });
    }
  }

  selectConversation(conversation: Conversation): void {
    console.log('💬 Selecting conversation:', conversation);
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
  }

  loadMessages(conversationId: string): void {
    console.log('📨 Loading messages for conversation:', conversationId);
    this.isLoadingMessages = true;
    this.messageService.getMessages(conversationId).subscribe({
      next: (messages: ChatMessage[]) => {
        console.log('✅ Messages loaded:', messages);
        this.messages = messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === this.currentUser?.id
        }));
        this.isLoadingMessages = false;
      },
      error: (error: any) => {
        console.error('❌ Error loading messages:', error);
        this.isLoadingMessages = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation || !this.currentUser?.id) {
      return;
    }

    const otherParticipant = this.selectedConversation.participants.find(p => p !== this.currentUser!.id);
    if (!otherParticipant) return;

    const messageData: Partial<ChatMessage> = {
      conversationId: this.selectedConversation.id,
      senderId: this.currentUser.id,
      receiverId: otherParticipant,
      content: this.newMessage.trim()
    };

    console.log('📤 Sending message:', messageData);

    this.messageService.sendMessage(messageData).subscribe({
      next: (sentMessage: ChatMessage) => {
        console.log('✅ Message sent:', sentMessage);
        this.messages.push({
          ...sentMessage,
          isOwn: true
        });
        this.newMessage = '';
        
        // Update conversation's last message
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = sentMessage;
          this.selectedConversation.lastMessageTime = sentMessage.timestamp;
        }
      },
      error: (error: any) => {
        console.error('❌ Error sending message:', error);
      }
    });
  }

  getOtherParticipantName(conversation: Conversation): string {
    if (!this.currentUser?.id) return 'Unknown';
    
    const otherParticipantId = conversation.participants.find(p => p !== this.currentUser!.id);
    if (!otherParticipantId) return 'Unknown';
    
    return conversation.participantNames[otherParticipantId] || 'Unknown User';
  }

  formatMessageTime(timestamp: Date): string {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageTime.toLocaleDateString();
    }
  }

  // --- END MESSAGING METHODS ---

  getInitials(name: string | undefined | null): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }

  // Add this method to your DashboardComponent class
  selectProfile(profile: any): void {
    this.selectedProfile = profile;
  }

  getChatMessages(profileId: string): Array<{ content: string, isOwn: boolean, timestamp: Date }> {
    return this.chatMessages[profileId] || [];
  }
}