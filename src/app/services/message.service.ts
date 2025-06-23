import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  isOwn?: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  lastMessageTime: Date;
  unreadCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private apiUrl = '/api';

  // Enhanced mock data for professional chat demo
  private mockConversations: Conversation[] = [
    {
      id: '1',
      participants: ['1', '2'],
      lastMessageTime: new Date(Date.now() - 300000), // 5 minutes ago
      unreadCount: 2,
      lastMessage: {
        id: '3',
        conversationId: '1',
        senderId: '2',
        receiverId: '1',
        content: 'That sounds perfect! When would be a good time to meet?',
        timestamp: new Date(Date.now() - 300000),
        isRead: false
      }
    },
    {
      id: '2',
      participants: ['1', '3'],
      lastMessageTime: new Date(Date.now() - 3600000), // 1 hour ago
      unreadCount: 0,
      lastMessage: {
        id: '6',
        conversationId: '2',
        senderId: '1',
        receiverId: '3',
        content: 'Thanks for the apartment info! I\'ll check it out this weekend.',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true
      }
    },
    {
      id: '3',
      participants: ['1', '4'],
      lastMessageTime: new Date(Date.now() - 7200000), // 2 hours ago
      unreadCount: 1,
      lastMessage: {
        id: '9',
        conversationId: '3',
        senderId: '4',
        receiverId: '1',
        content: 'Hey! I saw we matched. I love your profile!',
        timestamp: new Date(Date.now() - 7200000),
        isRead: false
      }
    }
  ];

  private mockMessages: { [conversationId: string]: ChatMessage[] } = {
    '1': [
      {
        id: '1',
        conversationId: '1',
        senderId: '2',
        receiverId: '1',
        content: 'Hi! I saw we matched. I\'m really excited about potentially being roommates!',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: true
      },
      {
        id: '2',
        conversationId: '1',
        senderId: '1',
        receiverId: '2',
        content: 'Hey Sarah! Nice to meet you. I saw your profile and we seem really compatible. I love that you\'re into art and yoga!',
        timestamp: new Date(Date.now() - 6600000), // 1.5 hours ago
        isRead: true
      },
      {
        id: '3',
        conversationId: '1',
        senderId: '2',
        receiverId: '1',
        content: 'That sounds perfect! When would be a good time to meet?',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        isRead: false
      }
    ],
    '2': [
      {
        id: '4',
        conversationId: '2',
        senderId: '3',
        receiverId: '1',
        content: 'Hey! I found this great apartment downtown. 2BR, pet-friendly, and within our budget range.',
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        isRead: true
      },
      {
        id: '5',
        conversationId: '2',
        senderId: '3',
        receiverId: '1',
        content: 'The landlord is really responsive and the kitchen is amazing. Plus there\'s a gym in the building!',
        timestamp: new Date(Date.now() - 14000000), // 3.5 hours ago
        isRead: true
      },
      {
        id: '6',
        conversationId: '2',
        senderId: '1',
        receiverId: '3',
        content: 'Thanks for the apartment info! I\'ll check it out this weekend.',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: true
      }
    ],
    '3': [
      {
        id: '7',
        conversationId: '3',
        senderId: '4',
        receiverId: '1',
        content: 'Hi there! 👋',
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        isRead: true
      },
      {
        id: '8',
        conversationId: '3',
        senderId: '1',
        receiverId: '4',
        content: 'Hey Mike! Nice to meet you!',
        timestamp: new Date(Date.now() - 9000000), // 2.5 hours ago
        isRead: true
      },
      {
        id: '9',
        conversationId: '3',
        senderId: '4',
        receiverId: '1',
        content: 'Hey! I saw we matched. I love your profile!',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: false
      }
    ]
  };

  // Simulate real-time message updates
  private messageCounter = 10;

  constructor(private http: HttpClient) {
    console.log('💬 MessageService initialized with enhanced features');
    
    // Simulate receiving new messages periodically
    this.simulateIncomingMessages();
  }

  getConversations(userId: string): Observable<Conversation[]> {
    console.log('💬 Getting conversations for user:', userId);
    
    return of(this.mockConversations.filter(conv => 
      conv.participants.includes(userId)
    )).pipe(
      delay(600),
      map(conversations => {
        console.log(`✅ Found ${conversations.length} conversations`);
        return conversations.sort((a, b) => 
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
        );
      })
    );
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    console.log('📨 Getting messages for conversation:', conversationId);
    
    return of(this.mockMessages[conversationId] || []).pipe(
      delay(400),
      map(messages => {
        console.log(`✅ Found ${messages.length} messages`);
        return messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      })
    );
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    console.log('📤 Sending message:', message);
    
    return of(null).pipe(
      delay(800),
      map(() => {
        const newMessage: ChatMessage = {
          id: (this.messageCounter++).toString(),
          conversationId: message.conversationId!,
          senderId: message.senderId!,
          receiverId: message.receiverId!,
          content: message.content!,
          timestamp: new Date(),
          isRead: false
        };

        // Add to mock messages
        if (!this.mockMessages[newMessage.conversationId]) {
          this.mockMessages[newMessage.conversationId] = [];
        }
        this.mockMessages[newMessage.conversationId].push(newMessage);

        // Update conversation
        const conversation = this.mockConversations.find(c => c.id === newMessage.conversationId);
        if (conversation) {
          conversation.lastMessage = newMessage;
          conversation.lastMessageTime = newMessage.timestamp;
        }

        console.log('✅ Message sent successfully');
        
        // Simulate auto-reply after a delay
        this.simulateAutoReply(newMessage);
        
        return newMessage;
      })
    );
  }

  markAsRead(messageId: string): Observable<void> {
    console.log('✅ Marking message as read:', messageId);
    
    return of(void 0).pipe(
      delay(200),
      map(() => {
        // Find and mark message as read
        Object.values(this.mockMessages).forEach(messages => {
          const message = messages.find(m => m.id === messageId);
          if (message) {
            message.isRead = true;
          }
        });
      })
    );
  }

  // Enhanced features for professional chat

  private simulateIncomingMessages(): void {
    // Simulate receiving messages every 30-60 seconds
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance
        this.addRandomMessage();
      }
    }, 45000); // Every 45 seconds
  }

  private simulateAutoReply(originalMessage: ChatMessage): void {
    // Simulate auto-reply after 3-8 seconds
    const delay = Math.random() * 5000 + 3000;
    
    setTimeout(() => {
      const autoReplies = [
        "That sounds great! 😊",
        "I'm excited about this!",
        "Perfect! Let me know when works for you.",
        "Thanks for reaching out!",
        "Looking forward to meeting you!",
        "That works for me too!",
        "Awesome! Can't wait to chat more.",
        "Sounds like a plan! 👍"
      ];
      
      const replyContent = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      
      const autoReply: ChatMessage = {
        id: (this.messageCounter++).toString(),
        conversationId: originalMessage.conversationId,
        senderId: originalMessage.receiverId,
        receiverId: originalMessage.senderId,
        content: replyContent,
        timestamp: new Date(),
        isRead: false
      };

      // Add to messages
      if (this.mockMessages[autoReply.conversationId]) {
        this.mockMessages[autoReply.conversationId].push(autoReply);
      }

      // Update conversation
      const conversation = this.mockConversations.find(c => c.id === autoReply.conversationId);
      if (conversation) {
        conversation.lastMessage = autoReply;
        conversation.lastMessageTime = autoReply.timestamp;
        conversation.unreadCount++;
      }

      console.log('🤖 Auto-reply sent:', replyContent);
    }, delay);
  }

  private addRandomMessage(): void {
    const randomMessages = [
      "Hey! How's your day going?",
      "I found another great apartment listing!",
      "Are you free to chat this weekend?",
      "Just wanted to say hi! 👋",
      "Hope you're having a great week!",
      "Any updates on the apartment search?",
      "Looking forward to hearing from you!"
    ];

    const conversationIds = Object.keys(this.mockMessages);
    if (conversationIds.length === 0) return;

    const randomConvId = conversationIds[Math.floor(Math.random() * conversationIds.length)];
    const conversation = this.mockConversations.find(c => c.id === randomConvId);
    
    if (!conversation) return;

    const otherParticipant = conversation.participants.find(p => p !== '1'); // Assuming user '1' is current user
    if (!otherParticipant) return;

    const randomMessage: ChatMessage = {
      id: (this.messageCounter++).toString(),
      conversationId: randomConvId,
      senderId: otherParticipant,
      receiverId: '1',
      content: randomMessages[Math.floor(Math.random() * randomMessages.length)],
      timestamp: new Date(),
      isRead: false
    };

    this.mockMessages[randomConvId].push(randomMessage);
    conversation.lastMessage = randomMessage;
    conversation.lastMessageTime = randomMessage.timestamp;
    conversation.unreadCount++;

    console.log('📨 Random message received:', randomMessage.content);
  }

  // Utility methods for enhanced chat features

  searchMessages(query: string, conversationId?: string): Observable<ChatMessage[]> {
    console.log('🔍 Searching messages:', query);
    
    return of(null).pipe(
      delay(300),
      map(() => {
        let allMessages: ChatMessage[] = [];
        
        if (conversationId) {
          allMessages = this.mockMessages[conversationId] || [];
        } else {
          allMessages = Object.values(this.mockMessages).flat();
        }
        
        return allMessages.filter(message => 
          message.content.toLowerCase().includes(query.toLowerCase())
        );
      })
    );
  }

  getUnreadCount(userId: string): Observable<number> {
    return this.getConversations(userId).pipe(
      map(conversations => 
        conversations.reduce((total, conv) => total + conv.unreadCount, 0)
      )
    );
  }

  markConversationAsRead(conversationId: string): Observable<void> {
    console.log('✅ Marking conversation as read:', conversationId);
    
    return of(void 0).pipe(
      delay(200),
      map(() => {
        const conversation = this.mockConversations.find(c => c.id === conversationId);
        if (conversation) {
          conversation.unreadCount = 0;
        }
        
        // Mark all messages in conversation as read
        const messages = this.mockMessages[conversationId] || [];
        messages.forEach(message => {
          message.isRead = true;
        });
      })
    );
  }
}