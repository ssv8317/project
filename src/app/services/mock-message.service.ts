import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ChatMessage, Conversation } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class MockMessageService {
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
    ],
    '2': [
      {
        id: '4',
        conversationId: '2',
        senderId: '3',
        receiverId: '1',
        content: 'The apartment has a great kitchen and the landlord is very responsive.',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true
      },
      {
        id: '5',
        conversationId: '2',
        senderId: '1',
        receiverId: '3',
        content: 'Thanks for the info about the apartment!',
        timestamp: new Date(Date.now() - 3600000),
        isRead: true
      }
    ]
  };

  constructor() {}

  getConversations(userId: string): Observable<Conversation[]> {
    console.log('💬 Getting mock conversations for user:', userId);
    
    return of(this.mockConversations.filter(conv => 
      conv.participants.includes(userId)
    )).pipe(delay(600));
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    console.log('📨 Getting mock messages for conversation:', conversationId);
    
    const messages = this.mockMessages[conversationId] || [];
    return of(messages).pipe(delay(400));
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    console.log('📤 Sending mock message:', message);
    
    return of(null).pipe(
      delay(800),
      map(() => {
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

        console.log('✅ Mock message sent');
        return newMessage;
      })
    );
  }

  markAsRead(messageId: string): Observable<void> {
    console.log('✅ Marking mock message as read:', messageId);
    
    return of(void 0).pipe(delay(200));
  }
}