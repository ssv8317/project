import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoommateProfile, RoommateProfileView, MatchResponse, UserAction, SwipeRequest } from '../models/match.model';
import { map } from 'rxjs/operators';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'https://localhost:56636/api/match';
  
  // Flag to enable/disable mock mode
  private useMockData = true; // Set to false to use real backend

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  private getSharedInterests(userInterests: string[], matchInterests: string[]): string[] {
    if (!userInterests || !matchInterests) return [];
    return matchInterests.filter(i => userInterests.includes(i));
  }

  getPotentialMatches(userId: string, userInterests: string[] = []): Observable<MatchResponse[]> {
    if (this.useMockData) {
      return this.mockDataService.getPotentialMatches(userId);
    }

    return this.http.get<MatchResponse[]>(`${this.apiUrl}/potential/${userId}`).pipe(
      map(matches => matches.map(match => ({
        ...match,
        profile: {
          ...match.profile,
          fullName: match.profile.displayName || '',
          budgetRange: (typeof match.profile.budgetMin !== 'undefined' && typeof match.profile.budgetMax !== 'undefined')
            ? `$${match.profile.budgetMin} - $${match.profile.budgetMax}` : '',
          locationPreference: match.profile.preferredLocations ? match.profile.preferredLocations.join(', ') : '',
          aboutMe: match.profile.bio || '',
          sharedInterests: this.getSharedInterests(userInterests, match.profile.interests || []),
        } as RoommateProfileView
      })))
    );
  }

  getMatches(userId: string, userInterests: string[] = []): Observable<MatchResponse[]> {
    if (this.useMockData) {
      return this.mockDataService.getMatches(userId);
    }

    return this.http.get<MatchResponse[]>(`${this.apiUrl}/matches/${userId}`).pipe(
      map(matches => matches.map(match => ({
        ...match,
        profile: {
          ...match.profile,
          fullName: match.profile.displayName || '',
          budgetRange: (typeof match.profile.budgetMin !== 'undefined' && typeof match.profile.budgetMax !== 'undefined')
            ? `$${match.profile.budgetMin} - $${match.profile.budgetMax}` : '',
          locationPreference: match.profile.preferredLocations ? match.profile.preferredLocations.join(', ') : '',
          aboutMe: match.profile.bio || '',
          sharedInterests: this.getSharedInterests(userInterests, match.profile.interests || []),
        } as RoommateProfileView
      })))
    );
  }

  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    if (this.useMockData) {
      return this.mockDataService.swipe(userId, request);
    }

    return this.http.post<MatchResponse>(`${this.apiUrl}/swipe/${userId}`, request);
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile> {
    if (this.useMockData) {
      return this.mockDataService.getRoommateProfile(userId) as Observable<RoommateProfile>;
    }

    return this.http.get<RoommateProfile>(`${this.apiUrl}/profile/${userId}`);
  }

  createOrUpdateProfile(userId: string, profile: RoommateProfile): Observable<RoommateProfile> {
    if (this.useMockData) {
      return this.mockDataService.createOrUpdateProfile(userId, profile);
    }

    return this.http.post<RoommateProfile>(`${this.apiUrl}/profile/${userId}`, profile);
  }

  // Helper methods
  getCompatibilityText(score: number): string {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  }

  getCompatibilityColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }

  // Method to toggle mock mode
  setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
  }

  isMockMode(): boolean {
    return this.useMockData;
  }
}

// Re-export all types and enums for convenience
export type { MatchResponse, RoommateProfile, RoommateProfileView, SwipeRequest };
export { UserAction };