import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockAuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock user database
  private mockUsers: User[] = [
    {
      id: '1',
      fullName: 'John Doe',
      email: 'john@example.com',
      age: 25,
      gender: 'Male',
      occupation: 'Software Engineer',
      college: 'MIT',
      sleepSchedule: 'Night Owl',
      cleanlinessLevel: 'High',
      smokingPreference: 'No',
      petFriendly: 'Yes',
      budgetRange: '$1000-1500',
      locationPreference: 'Downtown',
      aboutMe: 'I love coding and playing video games. Looking for a clean, quiet roommate.',
      createdAt: new Date()
    },
    {
      id: '2',
      fullName: 'Jane Smith',
      email: 'jane@example.com',
      age: 23,
      gender: 'Female',
      occupation: 'Designer',
      college: 'Stanford',
      sleepSchedule: 'Early Bird',
      cleanlinessLevel: 'Medium',
      smokingPreference: 'No',
      petFriendly: 'No',
      budgetRange: '$800-1200',
      locationPreference: 'Near Campus',
      aboutMe: 'Creative designer who loves art and music. Very organized and friendly.',
      createdAt: new Date()
    }
  ];

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    console.log('🔐 Mock login attempt for:', credentials.email);
    
    return of(null).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        // Find user by email
        const user = this.mockUsers.find(u => u.email === credentials.email);
        
        if (!user) {
          throw new Error('User not found');
        }

        // Simple password check (in real app, this would be hashed)
        if (credentials.password !== 'password123') {
          throw new Error('Invalid password');
        }

        const token = 'mock-jwt-token-' + Date.now();
        const response: AuthResponse = {
          token,
          user
        };

        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);

        console.log('✅ Mock login successful');
        return response;
      })
    );
  }

  register(userData: RegisterRequest): Observable<{ user: User }> {
    console.log('📝 Mock registration for:', userData.email);
    
    return of(null).pipe(
      delay(1500), // Simulate network delay
      map(() => {
        // Check if user already exists
        const existingUser = this.mockUsers.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('User already exists with this email');
        }

        // Create new user
        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
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
          createdAt: new Date()
        };

        // Add to mock database
        this.mockUsers.push(newUser);

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(newUser));
        this.currentUserSubject.next(newUser);

        console.log('✅ Mock registration successful');
        return { user: newUser };
      })
    );
  }

  logout(): void {
    console.log('🚪 Mock logout');
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
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  getCurrentUser(): Observable<User | null> {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return of(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        this.logout();
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