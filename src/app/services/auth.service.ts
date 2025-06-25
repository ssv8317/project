import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, throwError } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'https://localhost:56636/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock user data for development
  private mockUser: User = {
    id: 'mock-user-1',
    email: 'john.doe@example.com',
    fullName: 'John Doe',
    age: 25,
    gender: 'Male',
    occupation: 'Software Engineer',
    college: 'University of Technology',
    sleepSchedule: 'Early Bird',
    cleanlinessLevel: 'Very Clean',
    smokingPreference: 'Non-smoker',
    petFriendly: 'Yes',
    budgetRange: '$1500-2000',
    locationPreference: 'Downtown',
    aboutMe: 'I am a software engineer who loves coding, hiking, and trying new restaurants. Looking for a clean, respectful roommate to share a great living space.',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date()
  };

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
    // Use mock data for development
    if (credentials.email === 'john.doe@example.com' || credentials.email === this.mockUser.email) {
      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token-' + Date.now(),
        user: this.mockUser
      };

      // Store in localStorage
      localStorage.setItem('token', mockResponse.token!);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));
      this.currentUserSubject.next(mockResponse.user);

      return of(mockResponse);
    }

    // Try real backend if not using mock credentials
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token!);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        })
      );
  }

  register(userData: RegisterRequest): Observable<{ user: User }> {
    // Create a mock user from registration data
    const newMockUser: User = {
      id: 'mock-user-' + Date.now(),
      fullName: userData.fullName,
      email: userData.email,
      age: userData.age,
      gender: userData.gender,
      occupation: userData.occupation,
      college: userData.college,
      sleepSchedule: userData.sleepSchedule,
      cleanlinessLevel: userData.cleanlinessLevel,
      smokingPreference: userData.smokingPreference,
      petFriendly: userData.petFriendly,
      budgetRange: userData.budgetRange,
      locationPreference: userData.locationPreference,
      aboutMe: userData.aboutMe,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const mockResponse = { user: newMockUser };

    // Store the new user
    localStorage.setItem('user', JSON.stringify(newMockUser));
    this.currentUserSubject.next(newMockUser);

    return of(mockResponse);
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
    return !!token;
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getCurrentUser(): Observable<User | null> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return of(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return of(null);
      }
    }
    return of(null);
  }

  getCurrentUserSync(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}