import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { map } from 'rxjs/operators';
import { RoommateProfile, RoommateProfileView, MatchResponse, UserAction, SwipeRequest } from '../models/match.model';
import { MockMatchService } from './mock-match.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = '/api/match';
  private useMockService = true; // Toggle this to switch between mock and real API

  constructor(
    private http: HttpClient,
    private mockMatchService: MockMatchService
  ) {}

  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    if (this.useMockService) {
      console.log('🔄 Using mock match service for potential matches');
      return this.mockMatchService.getPotentialMatches(userId);
    }

    return this.http.get<MatchResponse[]>(`${this.apiUrl}/potential/${userId}`)
      .pipe(
        map(matches => matches.map(match => ({
          ...match,
          profile: {
            ...match.profile,
            fullName: match.profile.displayName || '',
            budgetRange: (typeof match.profile.budgetMin !== 'undefined' && typeof match.profile.budgetMax !== 'undefined')
              ? `$${match.profile.budgetMin} - $${match.profile.budgetMax}` : '',
            locationPreference: match.profile.preferredLocations ? match.profile.preferredLocations.join(', ') : '',
            aboutMe: match.profile.bio || '',
            sharedInterests: match.profile.interests || [],
          } as RoommateProfileView,
          matchPercentage: match.compatibilityScore
        }))),
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMatchService.getPotentialMatches(userId);
        })
      );
  }

  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    if (this.useMockService) {
      console.log('🔄 Using mock match service for swipe');
      return this.mockMatchService.swipe(userId, request);
    }

    return this.http.post<MatchResponse>(`${this.apiUrl}/swipe/${userId}`, request)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMatchService.swipe(userId, request);
        })
      );
  }

  getMatches(userId: string): Observable<MatchResponse[]> {
    if (this.useMockService) {
      console.log('🔄 Using mock match service for matches');
      return this.mockMatchService.getMatches(userId);
    }

    return this.http.get<MatchResponse[]>(`${this.apiUrl}/matches/${userId}`)
      .pipe(
        map(matches => matches.map(match => ({
          ...match,
          profile: {
            ...match.profile,
            fullName: match.profile.displayName || '',
            budgetRange: (typeof match.profile.budgetMin !== 'undefined' && typeof match.profile.budgetMax !== 'undefined')
              ? `$${match.profile.budgetMin} - $${match.profile.budgetMax}` : '',
            locationPreference: match.profile.preferredLocations ? match.profile.preferredLocations.join(', ') : '',
            aboutMe: match.profile.bio || '',
            sharedInterests: match.profile.interests || [],
          } as RoommateProfileView,
          matchPercentage: match.compatibilityScore
        }))),
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMatchService.getMatches(userId);
        })
      );
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile> {
    if (this.useMockService) {
      console.log('🔄 Using mock match service for roommate profile');
      return this.mockMatchService.getRoommateProfile(userId);
    }

    return this.http.get<RoommateProfile>(`${this.apiUrl}/profile/${userId}`)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMatchService.getRoommateProfile(userId);
        })
      );
  }

  createOrUpdateProfile(userId: string, profile: RoommateProfile): Observable<RoommateProfile> {
    if (this.useMockService) {
      console.log('🔄 Using mock match service for create/update profile');
      return this.mockMatchService.createOrUpdateProfile(userId, profile);
    }

    return this.http.post<RoommateProfile>(`${this.apiUrl}/profile/${userId}`, profile)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockMatchService.createOrUpdateProfile(userId, profile);
        })
      );
  }

  // Helper methods
  getCompatibilityText(score: number): string {
    return this.mockMatchService.getCompatibilityText(score);
  }

  getCompatibilityColor(score: number): string {
    return this.mockMatchService.getCompatibilityColor(score);
  }

  // Method to toggle between mock and real API (for testing)
  setUseMockService(useMock: boolean): void {
    this.useMockService = useMock;
    console.log(`🔄 Switched to ${useMock ? 'mock' : 'real'} match API service`);
  }
}

// Re-export all types and enums for convenience
export type { MatchResponse, RoommateProfile, RoommateProfileView, SwipeRequest };
export { UserAction };