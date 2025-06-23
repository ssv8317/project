import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, HostListener } from '@angular/core';
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
export class DashboardComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  activeTab: TabType = 'home';

  // User and UI state
  currentUser: User | null = null;
  mobileMenuOpen: boolean = false;
  loading = false;
  error: string | null = null;
  isMobile = false;

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
  showMatchModal = false;
  newMatch: MatchResponse | null = null;

  // Enhanced messaging
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  currentMessages: ChatMessage[] = [];
  newMessage: string = '';
  searchQuery: string = '';
  unreadCount: number = 0;
  isTyping: boolean = false;
  typingTimeout: any;

  // Legacy compatibility
  selectedProfile: any;
  chatMessages: { [profileId: string]: any[] } = {};
  matchedProfiles: any[] = [];

  constructor(
    private authService: AuthService,
    public matchService: MatchService,
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

    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  ngOnInit(): void {
    console.log('🚀 Dashboard component initializing...');
    this.loadCurrentUser();
    this.loadFeaturedListings();
    this.loadConversations();
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {
        console.error('Error scrolling to bottom:', err);
      }
    }
  }

  loadCurrentUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: User | null) => {
        if (user) {
          console.log('👤 Current user loaded:', user);
          this.currentUser = user;
          this.loadUserMatches();
          this.loadPotentialMatches();
        } else {
          console.log('❌ No current user found');
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
          this.currentMatchIndex = 0;
          this.isLoadingMatches = false;
        },
        error: (error) => {
          console.error('❌ Error loading potential matches:', error);
          this.isLoadingMatches = false;
        }
      });
    }
  }

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
      this.matchService.getMatches(this.currentUser.id).subscribe({
        next: (matches: MatchResponse[]) => {
          console.log('✅ User matches loaded:', matches);
          this.userMatches = matches;
          this.matchedProfiles = matches.map(match => ({
            ...match.profile,
            matchPercentage: match.compatibilityScore
          }));
        },
        error: (error: any) => {
          console.error('❌ Error loading matches:', error);
        }
      });
    } else {
      console.log('❌ Cannot load matches - no current user ID');
    }
  }

  // --- ENHANCED MESSAGING METHODS ---

  loadConversations(): void {
    if (this.currentUser?.id) {
      this.messageService.getConversations(this.currentUser.id).subscribe({
        next: (conversations) => {
          this.conversations = conversations;
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error loading conversations:', error);
        }
      });
    }
  }

  selectConversation(conversation: Conversation): void {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    
    // Mark conversation as read
    if (conversation.unreadCount > 0) {
      conversation.unreadCount = 0;
      this.updateUnreadCount();
    }
  }

  loadMessages(conversationId: string): void {
    this.messageService.getMessages(conversationId).subscribe({
      next: (messages) => {
        this.currentMessages = messages.map(msg => ({
          ...msg,
          isOwn: msg.senderId === this.currentUser?.id
        }));
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error loading messages:', error);
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.selectedConversation || !this.currentUser?.id) {
      return;
    }

    const otherParticipant = this.selectedConversation.participants.find(p => p !== this.currentUser?.id);
    if (!otherParticipant) return;

    const messageData: Partial<ChatMessage> = {
      conversationId: this.selectedConversation.id,
      senderId: this.currentUser.id,
      receiverId: otherParticipant,
      content: this.newMessage.trim()
    };

    this.messageService.sendMessage(messageData).subscribe({
      next: (message) => {
        this.currentMessages.push({
          ...message,
          isOwn: true
        });
        this.newMessage = '';
        
        // Update conversation
        if (this.selectedConversation) {
          this.selectedConversation.lastMessage = message;
          this.selectedConversation.lastMessageTime = message.timestamp;
        }
        
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  onMessageKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onMessageInput(): void {
    // Simulate typing indicator
    this.isTyping = true;
    
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 1000);
  }

  get filteredConversations(): Conversation[] {
    if (!this.searchQuery.trim()) {
      return this.conversations;
    }
    
    return this.conversations.filter(conv => 
      this.getConversationName(conv).toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getConversationName(conversation: Conversation): string {
    const otherParticipant = conversation.participants.find(p => p !== this.currentUser?.id);
    // In a real app, you'd fetch the user name by ID
    return `User ${otherParticipant}`;
  }

  getConversationInitials(conversation: Conversation): string {
    const name = this.getConversationName(conversation);
    return this.getInitials(name);
  }

  getMessageSenderInitials(message: ChatMessage): string {
    if (message.senderId === this.currentUser?.id) {
      return this.getInitials(this.currentUser.fullName);
    }
    return this.getInitials(`User ${message.senderId}`);
  }

  isUserOnline(conversation: Conversation): boolean {
    // Simulate online status
    return Math.random() > 0.5;
  }

  formatTime(date: Date): string {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return messageDate.toLocaleDateString();
    }
  }

  formatMessageTime(date: Date): string {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  private updateUnreadCount(): void {
    this.unreadCount = this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  // --- UTILITY METHODS ---

  getInitials(name: string | undefined | null): string {
    if (!name) return '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + (parts[1][0] || '')).toUpperCase();
  }

  selectProfile(profile: any): void {
    this.selectedProfile = profile;
  }

  getChatMessages(profileId: string): Array<{ content: string, isOwn: boolean, timestamp: Date }> {
    return this.chatMessages[profileId] || [];
  }

  setActiveTab(tab: TabType): void {
    console.log('📱 Switching to tab:', tab);
    this.activeTab = tab;
    
    // Load data when switching to specific tabs
    if (tab === 'matches' && this.currentUser?.id) {
      this.loadUserMatches();
    } else if (tab === 'messages') {
      this.loadConversations();
    }
    
    // Close mobile menu when tab is selected
    this.mobileMenuOpen = false;
  }
}