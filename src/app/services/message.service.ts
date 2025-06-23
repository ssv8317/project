import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

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

  // Mock data for demo
  private mockConversations: Conversation[] = [
    {
      id: '1',
      participants: ['1', '2'],
      lastMessageTime: new Date(),
      unreadCount: 2,
      lastMessage: {
        id: '1',
        conversationId: '1',
        senderId: '2',
        receiverId: '1',
        content: 'Hey! I saw we matched. Would love to chat about potentially being roommates!',
        timestamp: new Date(),
        isRead: false
      }
    },
    {
      id: '2',
      participants: ['1', '3'],
      lastMessageTime: new Date(Date.now() - 3600000), // 1 hour ago
      unreadCount: 0,
      lastMessage: {
        id: '2',
        conversationId: '2',
        senderId: '1',
        receiverId: '3',
        content: 'Thanks for the info about the apartment!',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true
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
        content: 'Hi there! I saw we matched.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: true
      },
      {
        id: '2',
        conversationId: '1',
        senderId: '1',
        receiverId: '2',
        content: 'Hey! Nice to meet you. I saw your profile and we seem compatible!',
        timestamp: new Date(Date.now() - 6600000), // 1.5 hours ago
        isRead: true
      },
      {
        id: '3',
        conversationId: '1',
        senderId: '2',
        receiverId: '1',
        content: 'Hey! I saw we matched. Would love to chat about potentially being roommates!',
        timestamp: new Date(),
        isRead: false
      }
    ]
  };

  constructor(private http: HttpClient) {}

  getConversations(userId: string): Observable<Conversation[]> {
    console.log('💬 Getting conversations for user:', userId);
    
    return new Observable(observer => {
      setTimeout(() => {
        const conversations = this.mockConversations.filter(conv => 
          conv.participants.includes(userId)
        );
        observer.next(conversations);
        observer.complete();
      }, 600);
    });
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    console.log('📨 Getting messages for conversation:', conversationId);
    
    return new Observable(observer => {
      setTimeout(() => {
        const messages = this.mockMessages[conversationId] || [];
        observer.next(messages);
        observer.complete();
      }, 400);
    });
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    console.log('📤 Sending message:', message);
    
    return new Observable(observer => {
      setTimeout(() => {
        const newMessage: ChatMessage = {
          id: Date.now().toString(),
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

        console.log('✅ Message sent');
        observer.next(newMessage);
        observer.complete();
      }, 800);
    });
  }

  markAsRead(messageId: string): Observable<void> {
    console.log('✅ Marking message as read:', messageId);
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next();
        observer.complete();
      }, 200);
    });
  }
}