import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { MockMessageService } from './mock-message.service';

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
  private useMockService = true; // Toggle this to switch between mock and real API

  constructor(
    private http: HttpClient,
    private mockMessageService: MockMessageService
  ) {}

  getConversations(userId: string): Observable<Conversation[]> {
    if (this.useMockService) {
      console.log('🔄 Using mock message service for conversations');
      return this.mockMessageService.getConversations(userId);
    }

    return this.http.get<Conversation[]>(`${this.apiUrl}/messages/conversations/${userId}`)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMessageService.getConversations(userId);
        })
      );
  }

  getMessages(conversationId: string): Observable<ChatMessage[]> {
    if (this.useMockService) {
      console.log('🔄 Using mock message service for messages');
      return this.mockMessageService.getMessages(conversationId);
    }

    return this.http.get<ChatMessage[]>(`${this.apiUrl}/messages/${conversationId}`)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMessageService.getMessages(conversationId);
        })
      );
  }

  sendMessage(message: Partial<ChatMessage>): Observable<ChatMessage> {
    if (this.useMockService) {
      console.log('🔄 Using mock message service for send message');
      return this.mockMessageService.sendMessage(message);
    }

    return this.http.post<ChatMessage>(`${this.apiUrl}/messages`, message)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMessageService.sendMessage(message);
        })
      );
  }

  markAsRead(messageId: string): Observable<void> {
    if (this.useMockService) {
      console.log('🔄 Using mock message service for mark as read');
      return this.mockMessageService.markAsRead(messageId);
    }

    return this.http.put<void>(`${this.apiUrl}/messages/${messageId}/read`, {})
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMessageService.markAsRead(messageId);
        })
      );
  }

  // Method to toggle between mock and real API (for testing)
  setUseMockService(useMock: boolean): void {
    this.useMockService = useMock;
    console.log(`🔄 Switched to ${useMock ? 'mock' : 'real'} message API service`);
  }
}