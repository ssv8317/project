import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError } from 'rxjs';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../models/user.model';
import { MockAuthService } from './mock-auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private useMockService = true; // Toggle this to switch between mock and real API

  constructor(
    private http: HttpClient,
    private mockAuthService: MockAuthService
  ) {
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
    if (this.useMockService) {
      console.log('🔄 Using mock auth service for login');
      return this.mockAuthService.login(credentials);
    }

    console.log('🔐 Attempting real API login with:', { email: credentials.email });
    
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('✅ Login successful:', response);
          
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockAuthService.login(credentials);
        })
      );
  }

  register(userData: RegisterRequest): Observable<{ user: User }> {
    if (this.useMockService) {
      console.log('🔄 Using mock auth service for registration');
      return this.mockAuthService.register(userData);
    }

    console.log('📝 Attempting real API registration for:', userData.email);
    
    interface RegisterResponse {
      user: User;
    }

    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, userData)
      .pipe(
        tap((response: RegisterResponse) => {
          console.log('✅ Registration successful:', response);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockAuthService.register(userData);
        })
      );
  }

  logout(): void {
    console.log('🚪 Logging out user');
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

  // Method to toggle between mock and real API (for testing)
  setUseMockService(useMock: boolean): void {
    this.useMockService = useMock;
    console.log(`🔄 Switched to ${useMock ? 'mock' : 'real'} API service`);
  }
}