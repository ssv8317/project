import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { 
  RoommateProfile, 
  RoommateProfileView, 
  MatchResponse, 
  UserAction, 
  SwipeRequest,
  ProfileCheckResponse 
} from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = '/api/match';

  constructor(private http: HttpClient) {}

  // Check if user has a roommate profile
  checkUserProfile(userId: string): Observable<ProfileCheckResponse> {
    return this.http.get<ProfileCheckResponse>(`${this.apiUrl}/profile/check/${userId}`)
      .pipe(
        catchError(error => {
          console.log('Profile check failed, assuming no profile exists');
          return of({ hasProfile: false });
        })
      );
  }

  // Get roommate profile
  getRoommateProfile(userId: string): Observable<RoommateProfile | null> {
    return this.http.get<RoommateProfile>(`${this.apiUrl}/profile/${userId}`)
      .pipe(
        catchError(error => {
          console.log('Profile not found');
          return of(null);
        })
      );
  }

  // Create or update roommate profile
  createOrUpdateProfile(userId: string, profile: Partial<RoommateProfile>): Observable<RoommateProfile> {
    const profileData = {
      ...profile,
      userId: userId,
      isActive: true
    };
    
    return this.http.post<RoommateProfile>(`${this.apiUrl}/profile/${userId}`, profileData);
  }

  // Get potential matches
  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/potential/${userId}`)
      .pipe(
        map(matches => matches.map(match => ({
          ...match,
          profile: {
            ...match.profile,
            fullName: match.profile.displayName || '',
            budgetRange: `$${match.profile.budgetMin} - $${match.profile.budgetMax}`,
            locationPreference: match.profile.preferredLocations.join(', '),
            aboutMe: match.profile.bio || '',
            sharedInterests: match.profile.interests || [],
          } as RoommateProfileView,
          matchPercentage: match.compatibilityScore
        }))),
        catchError(error => {
          console.error('Error fetching matches:', error);
          return of([]);
        })
      );
  }

  // Swipe on a profile
  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    return this.http.post<MatchResponse>(`${this.apiUrl}/swipe/${userId}`, request);
  }

  // Get confirmed matches
  getMatches(userId: string): Observable<MatchResponse[]> {
    return this.http.get<MatchResponse[]>(`${this.apiUrl}/matches/${userId}`)
      .pipe(
        map(matches => matches.map(match => ({
          ...match,
          profile: {
            ...match.profile,
            fullName: match.profile.displayName || '',
            budgetRange: `$${match.profile.budgetMin} - $${match.profile.budgetMax}`,
            locationPreference: match.profile.preferredLocations.join(', '),
            aboutMe: match.profile.bio || '',
            sharedInterests: match.profile.interests || [],
          } as RoommateProfileView,
          matchPercentage: match.compatibilityScore
        }))),
        catchError(error => {
          console.error('Error fetching matches:', error);
          return of([]);
        })
      );
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
}

// Re-export types for convenience
export type { MatchResponse, RoommateProfile, RoommateProfileView, SwipeRequest, ProfileCheckResponse };
export { UserAction };