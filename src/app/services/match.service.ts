import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RoommateProfile, RoommateProfileView, MatchResponse, UserAction, SwipeRequest } from '../models/match.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = 'https://localhost:56636/api/match';

  // Mock roommate profiles
  private mockProfiles: RoommateProfile[] = [
    {
      id: '1',
      userId: 'user1',
      displayName: 'Sarah Johnson',
      age: 24,
      gender: 'Female',
      occupation: 'Marketing Specialist',
      bio: 'Love fitness, cooking, and exploring the city. Looking for a clean, friendly roommate.',
      profilePictures: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
      budgetMin: 1400,
      budgetMax: 1800,
      preferredLocations: ['Downtown', 'Midtown'],
      cleanliness: 4,
      socialLevel: 4,
      noiseLevel: 2,
      smokingOk: false,
      petsOk: true,
      interests: ['Fitness', 'Cooking', 'Movies', 'Travel'],
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: '2',
      userId: 'user2',
      displayName: 'Mike Chen',
      age: 26,
      gender: 'Male',
      occupation: 'Software Developer',
      bio: 'Tech enthusiast who loves gaming and coffee. Quiet but friendly roommate.',
      profilePictures: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
      budgetMin: 1600,
      budgetMax: 2000,
      preferredLocations: ['Tech District', 'Downtown'],
      cleanliness: 3,
      socialLevel: 3,
      noiseLevel: 3,
      smokingOk: false,
      petsOk: false,
      interests: ['Gaming', 'Tech', 'Coffee', 'Programming'],
      isActive: true,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: '3',
      userId: 'user3',
      displayName: 'Emily Rodriguez',
      age: 23,
      gender: 'Female',
      occupation: 'Graphic Designer',
      bio: 'Creative soul who loves art, music, and photography. Looking for an inspiring living space.',
      profilePictures: ['https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'],
      budgetMin: 1300,
      budgetMax: 1700,
      preferredLocations: ['Arts District', 'Downtown'],
      cleanliness: 4,
      socialLevel: 5,
      noiseLevel: 4,
      smokingOk: false,
      petsOk: true,
      interests: ['Art', 'Music', 'Photography', 'Design'],
      isActive: true,
      createdAt: '2024-01-25T00:00:00Z',
      updatedAt: '2024-01-25T00:00:00Z'
    },
    {
      id: '4',
      userId: 'user4',
      displayName: 'Alex Thompson',
      age: 25,
      gender: 'Male',
      occupation: 'Teacher',
      bio: 'Educator who enjoys reading, hiking, and board games. Looking for a peaceful home environment.',
      profilePictures: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'],
      budgetMin: 1200,
      budgetMax: 1600,
      preferredLocations: ['Suburbs', 'Near Campus'],
      cleanliness: 5,
      socialLevel: 3,
      noiseLevel: 2,
      smokingOk: false,
      petsOk: true,
      interests: ['Reading', 'Hiking', 'Board Games', 'Education'],
      isActive: true,
      createdAt: '2024-01-30T00:00:00Z',
      updatedAt: '2024-01-30T00:00:00Z'
    }
  ];

  constructor(private http: HttpClient) {}

  // Helper to get shared interests between current user and match
  private getSharedInterests(userInterests: string[], matchInterests: string[]): string[] {
    if (!userInterests || !matchInterests) return [];
    return matchInterests.filter(i => userInterests.includes(i));
  }

  // Helper to calculate compatibility score
  private calculateCompatibility(userProfile: any, matchProfile: RoommateProfile): number {
    let score = 70; // Base score

    // Budget compatibility
    if (userProfile.budgetMin && userProfile.budgetMax) {
      const budgetOverlap = Math.max(0, 
        Math.min(userProfile.budgetMax, matchProfile.budgetMax) - 
        Math.max(userProfile.budgetMin, matchProfile.budgetMin)
      );
      if (budgetOverlap > 0) score += 10;
    }

    // Location compatibility
    if (userProfile.locationPreference && matchProfile.preferredLocations) {
      const hasCommonLocation = matchProfile.preferredLocations.some(loc => 
        userProfile.locationPreference.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(userProfile.locationPreference.toLowerCase())
      );
      if (hasCommonLocation) score += 10;
    }

    // Interest compatibility
    const userInterests = userProfile.interests || ['Fitness', 'Movies', 'Travel'];
    const sharedInterests = this.getSharedInterests(userInterests, matchProfile.interests);
    score += Math.min(15, sharedInterests.length * 3);

    return Math.min(100, Math.max(50, score));
  }

  getPotentialMatches(userId: string, userInterests: string[] = []): Observable<MatchResponse[]> {
    // Get current user profile (mock)
    const currentUser = {
      budgetMin: 1500,
      budgetMax: 2000,
      locationPreference: 'Downtown',
      interests: userInterests.length > 0 ? userInterests : ['Fitness', 'Movies', 'Travel', 'Cooking']
    };

    const matches = this.mockProfiles.map(profile => {
      const compatibilityScore = this.calculateCompatibility(currentUser, profile);
      const sharedInterests = this.getSharedInterests(currentUser.interests, profile.interests);

      return {
        id: profile.id,
        profile: {
          ...profile,
          fullName: profile.displayName,
          budgetRange: `$${profile.budgetMin} - $${profile.budgetMax}`,
          locationPreference: profile.preferredLocations.join(', '),
          aboutMe: profile.bio,
          sharedInterests: sharedInterests,
        } as RoommateProfileView,
        compatibilityScore: compatibilityScore,
        isNewMatch: false
      } as MatchResponse;
    });

    // Sort by compatibility score
    matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return of(matches);
  }

  getMatches(userId: string, userInterests: string[] = []): Observable<MatchResponse[]> {
    // Return a subset of profiles as "matched"
    return this.getPotentialMatches(userId, userInterests).pipe(
      map(matches => matches.filter(match => match.compatibilityScore >= 85))
    );
  }

  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    // Find the profile being swiped on
    const profile = this.mockProfiles.find(p => p.id === request.profileId);
    
    if (!profile) {
      throw new Error('Profile not found');
    }

    // Mock compatibility calculation
    const compatibilityScore = Math.floor(Math.random() * 30) + 70; // 70-100
    const isNewMatch = request.action === 'like' && Math.random() > 0.5; // 50% chance of mutual match

    const response: MatchResponse = {
      id: profile.id,
      profile: {
        ...profile,
        fullName: profile.displayName,
        budgetRange: `$${profile.budgetMin} - $${profile.budgetMax}`,
        locationPreference: profile.preferredLocations.join(', '),
        aboutMe: profile.bio,
        sharedInterests: profile.interests.slice(0, 3),
      } as RoommateProfileView,
      compatibilityScore: compatibilityScore,
      isNewMatch: isNewMatch
    };

    return of(response);
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile> {
    // Return a mock profile for the current user
    const mockUserProfile: RoommateProfile = {
      id: 'current-user-profile',
      userId: userId,
      displayName: 'John Doe',
      age: 25,
      gender: 'Male',
      occupation: 'Software Engineer',
      bio: 'I am a software engineer who loves coding, hiking, and trying new restaurants.',
      profilePictures: [],
      budgetMin: 1500,
      budgetMax: 2000,
      preferredLocations: ['Downtown'],
      cleanliness: 4,
      socialLevel: 3,
      noiseLevel: 3,
      smokingOk: false,
      petsOk: true,
      interests: ['Coding', 'Hiking', 'Food', 'Technology'],
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    };

    return of(mockUserProfile);
  }

  createOrUpdateProfile(userId: string, profile: RoommateProfile): Observable<RoommateProfile> {
    // Mock successful profile creation/update
    const updatedProfile = {
      ...profile,
      id: profile.id || 'new-profile-' + Date.now(),
      userId: userId,
      updatedAt: new Date().toISOString()
    };

    return of(updatedProfile);
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

// Re-export all types and enums for convenience
export type { MatchResponse, RoommateProfile, RoommateProfileView, SwipeRequest };
export { UserAction };