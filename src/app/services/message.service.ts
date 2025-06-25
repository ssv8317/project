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
  private apiUrl = 'https://localhost:56636/api';

  // Mock conversations data
  private mockConversations: Conversation[] = [
    {
      id: 'conv1',
      participants: ['current-user', 'user1'],
      lastMessage: {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user1',
        receiverId: 'current-user',
        content: 'Hi! I saw we matched. Are you still looking for a roommate?',
        timestamp: new Date(Date.now() - 3600000),
        isRead: false
      },
      lastMessageTime: new Date(Date.now() - 3600000),
      unreadCount: 1
    },
    {
      id: 'conv2',
      participants: ['current-user', 'user2'],
      lastMessage: {
        id: 'msg2',
        conversationId: 'conv2',
        senderId: 'current-user',
        receiverId: 'user2',
        content: 'That apartment looks great! When can we schedule a viewing?',
        timestamp: new Date(Date.now() - 7200000),
        isRead: true
      },
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 0
    }
  ];

  // Mock messages data
  private mockMessages: ChatMessage[] = [
    {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'user1',
      receiverId: 'current-user',
      content: 'Hi! I saw we matched. Are you still looking for a roommate?',
      timestamp: new Date(Date.now() - 3600000),
      isRead: false,
      isOwn: false
    },
    {
      id: 'msg2',
      conversationId: 'conv1',
      senderId: 'current-user',
      receiverId: 'user1',
      content: 'Yes! I love that we both prefer downtown. Have you found any good apartments yet?',
      timestamp: new Date(Date.now() - 3000000),
      isRead: true,
      isOwn: true
    },
    {
      id: 'msg3',
      conversationId: 'conv2',
      senderId: 'user2',
      receiverId: 'current-user',
      content: 'Hey! I found some great listings in the tech district.',
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      isOwn: false
    },
    {
      id: 'msg4',
      conversationId: 'conv2',
      senderId: 'current-user',
      receiverId: 'user2',
      content: 'That apartment looks great! When can we schedule a viewing?',
      timestamp: new Date(Date.now() - 6900000),
      isRead: true,
      isOwn: true
    }
  ];

  constructor(private http: HttpClient) {}

  getConversations(userId: string): Observable<Conversation[]> {
    return of(this.mockConversations);
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    const messages = this.mockMessages.filter(msg => msg.conversationId === conversationId);
    return of(messages);
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    const newMessage: ChatMessage = {
      id: 'msg' + Date.now(),
      conversationId: message.conversationId!,
      senderId: message.senderId!,
      receiverId: message.receiverId!,
      content: message.content!,
      timestamp: new Date(),
      isRead: false,
      isOwn: true
    };

    // Add to mock data
    this.mockMessages.push(newMessage);

    // Update conversation
    const conversation = this.mockConversations.find(c => c.id === message.conversationId);
    if (conversation) {
      conversation.lastMessage = newMessage;
      conversation.lastMessageTime = newMessage.timestamp;
    }

    return of(newMessage);
  }

  markAsRead(messageId: string): Observable<void> {
    const message = this.mockMessages.find(m => m.id === messageId);
    if (message) {
      message.isRead = true;
    }
    return of(void 0);
  }
}