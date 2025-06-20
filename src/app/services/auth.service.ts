import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    // Mock login for testing - bypass backend
    const mockUser: User = {
      id: 'mock-user-123',
      fullName: 'John Doe',
      email: credentials.email,
      age: 25,
      gender: 'Male',
      occupation: 'Software Developer',
      college: 'Tech University',
      sleepSchedule: 'Night Owl',
      cleanlinessLevel: 'High',
      smokingPreference: 'No',
      petFriendly: 'Yes',
      budgetRange: '$1000-1500/month',
      locationPreference: 'Downtown',
      aboutMe: 'I am a software developer who loves coding and enjoys a clean, quiet living environment. Looking for a like-minded roommate to share a great apartment with!',
      createdAt: new Date()
    };

    const mockResponse: AuthResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: mockUser
    };

    // Store in localStorage
    localStorage.setItem('token', mockResponse.token!);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
    this.currentUserSubject.next(mockResponse.user);

    // Return as Observable
    return of(mockResponse);
  }

  register(userData: RegisterRequest): Observable<{ user: User }> {
    return this.http.post<{ user: User }>(`${this.baseUrl}/register`, userData)
      .pipe(
        tap(response => {
          // Remove or comment out the line below, since token is not returned
          // localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token; // In a real app, you'd also check if token is expired
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Returns true if token exists, false if not
  }

  // Updated method to return Observable for dashboard compatibility
  getCurrentUser(): Observable<User | null> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return of(user); // Return as Observable
      } catch (error) {
        console.error('Error parsing user data:', error);
        return of(null);
      }
    }
    return of(null);
  }

  // Keep the synchronous version for backward compatibility
  getCurrentUserSync(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}