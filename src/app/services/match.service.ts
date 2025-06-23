import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { RoommateProfile, RoommateProfileView, MatchResponse, UserAction, SwipeRequest } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private apiUrl = '/api/match';

  // Mock data for demo
  private mockProfiles: RoommateProfile[] = [
    {
      id: '2',
      userId: '2',
      displayName: 'Sarah Chen',
      age: 22,
      gender: 'Female',
      occupation: 'Graphic Designer',
      bio: 'Creative soul who loves art, music, and yoga. Very organized and friendly.',
      profilePictures: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
      budgetMin: 800,
      budgetMax: 1200,
      preferredLocations: ['Campus Area', 'Arts District'],
      cleanliness: 5,
      socialLevel: 4,
      noiseLevel: 2,
      smokingOk: false,
      petsOk: false,
      interests: ['Art', 'Music', 'Yoga', 'Photography'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      userId: '4',
      displayName: 'Mike Rodriguez',
      age: 26,
      gender: 'Male',
      occupation: 'Marketing Manager',
      bio: 'Outgoing professional who enjoys fitness, movies, and trying new restaurants.',
      profilePictures: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'],
      budgetMin: 1200,
      budgetMax: 1800,
      preferredLocations: ['Downtown', 'Business District'],
      cleanliness: 3,
      socialLevel: 5,
      noiseLevel: 3,
      smokingOk: false,
      petsOk: true,
      interests: ['Fitness', 'Movies', 'Food', 'Travel'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '1',
      userId: '3',
      displayName: 'Alex Johnson',
      age: 24,
      gender: 'Male',
      occupation: 'Data Scientist',
      bio: 'Love hiking, cooking, and board games. Looking for a clean, respectful roommate.',
      profilePictures: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
      budgetMin: 1000,
      budgetMax: 1500,
      preferredLocations: ['Downtown', 'Midtown'],
      cleanliness: 4,
      socialLevel: 3,
      noiseLevel: 2,
      smokingOk: false,
      petsOk: true,
      interests: ['Hiking', 'Cooking', 'Board Games', 'Tech'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      userId: '5',
      displayName: 'Emma Wilson',
      age: 23,
      gender: 'Female',
      occupation: 'Graduate Student',
      bio: 'Quiet student focused on studies. Love reading, coffee, and weekend adventures.',
      profilePictures: ['https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'],
      budgetMin: 600,
      budgetMax: 1000,
      preferredLocations: ['Campus Area', 'Library District'],
      cleanliness: 4,
      socialLevel: 2,
      noiseLevel: 1,
      smokingOk: false,
      petsOk: false,
      interests: ['Reading', 'Coffee', 'Hiking', 'Study Groups'],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  private swipeHistory: { [userId: string]: string[] } = {};
  
  // Pre-populate matches for John Doe (user ID '1') - FIXED IDs
  private matches: { [userId: string]: string[] } = {
    '1': ['2', '3'] // John is matched with Sarah Chen (ID '2') and Mike Rodriguez (ID '3')
  };

  constructor(private http: HttpClient) {
    console.log('🎯 MatchService initialized');
    console.log('📊 Pre-existing matches:', this.matches);
    console.log('👥 Available profiles:', this.mockProfiles.map(p => ({ id: p.id, name: p.displayName })));
  }

  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    console.log('💕 Getting potential matches for user:', userId);
    
    return new Observable(observer => {
      setTimeout(() => {
        // Filter out profiles the user has already swiped on or matched with
        const swipedProfiles = this.swipeHistory[userId] || [];
        const matchedProfiles = this.matches[userId] || [];
        const excludedProfiles = [...swipedProfiles, ...matchedProfiles];
        
        console.log('🚫 Excluded profiles:', excludedProfiles);
        
        const availableProfiles = this.mockProfiles.filter(p => 
          p.userId !== userId && 
          !excludedProfiles.includes(p.id)
        );

        console.log('✅ Available profiles for matching:', availableProfiles.map(p => ({ id: p.id, name: p.displayName })));

        // Convert to MatchResponse format with mock compatibility scores
        const matchResponses: MatchResponse[] = availableProfiles.map(profile => ({
          id: profile.id,
          profile: this.convertToProfileView(profile),
          compatibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100% compatibility
          isNewMatch: false
        }));

        console.log(`✅ Found ${matchResponses.length} potential matches`);
        observer.next(matchResponses.sort((a, b) => b.compatibilityScore - a.compatibilityScore));
        observer.complete();
      }, 1000);
    });
  }

  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    console.log('👆 Swipe:', { userId, request });
    
    return new Observable(observer => {
      setTimeout(() => {
        // Add to swipe history
        if (!this.swipeHistory[userId]) {
          this.swipeHistory[userId] = [];
        }
        this.swipeHistory[userId].push(request.profileId);

        // Find the profile
        const profile = this.mockProfiles.find(p => p.id === request.profileId);
        if (!profile) {
          observer.error(new Error('Profile not found'));
          return;
        }

        // Simulate match (60% chance if it's a like for better demo)
        const isNewMatch = request.action === UserAction.Like && Math.random() < 0.6;
        
        if (isNewMatch) {
          if (!this.matches[userId]) {
            this.matches[userId] = [];
          }
          this.matches[userId].push(request.profileId);
          console.log('🎉 New match created! Updated matches:', this.matches);
        }

        const response: MatchResponse = {
          id: profile.id,
          profile: this.convertToProfileView(profile),
          compatibilityScore: Math.floor(Math.random() * 40) + 60,
          isNewMatch
        };

        observer.next(response);
        observer.complete();
      }, 500);
    });
  }

  getMatches(userId: string): Observable<MatchResponse[]> {
    console.log('💑 Getting matches for user:', userId);
    console.log('📊 Current matches data:', this.matches);
    
    return new Observable(observer => {
      setTimeout(() => {
        const userMatches = this.matches[userId] || [];
        console.log(`👤 User ${userId} has match IDs:`, userMatches);
        
        const matchedProfiles = this.mockProfiles.filter(p => {
          const isMatch = userMatches.includes(p.id);
          console.log(`🔍 Profile ${p.id} (${p.displayName}): ${isMatch ? 'MATCH' : 'no match'}`);
          return isMatch;
        });
        
        console.log('🔍 Found matched profiles:', matchedProfiles.map(p => ({ id: p.id, name: p.displayName })));
        
        const matchResponses: MatchResponse[] = matchedProfiles.map(profile => ({
          id: profile.id,
          profile: this.convertToProfileView(profile),
          compatibilityScore: Math.floor(Math.random() * 20) + 75, // 75-95% for matches
          isNewMatch: false
        }));

        console.log(`✅ Returning ${matchResponses.length} matches for user ${userId}:`, matchResponses.map(m => m.profile.displayName));
        observer.next(matchResponses);
        observer.complete();
      }, 800);
    });
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile> {
    console.log('👤 Getting roommate profile for user:', userId);
    
    return new Observable(observer => {
      setTimeout(() => {
        const profile = this.mockProfiles.find(p => p.userId === userId);
        if (!profile) {
          observer.error(new Error('Profile not found'));
          return;
        }
        observer.next(profile);
        observer.complete();
      }, 600);
    });
  }

  createOrUpdateProfile(userId: string, profile: RoommateProfile): Observable<RoommateProfile> {
    console.log('💾 Create/update profile for user:', userId);
    
    return new Observable(observer => {
      setTimeout(() => {
        // Find existing profile or create new one
        const existingIndex = this.mockProfiles.findIndex(p => p.userId === userId);
        
        const updatedProfile = {
          ...profile,
          userId,
          id: existingIndex >= 0 ? this.mockProfiles[existingIndex].id : (this.mockProfiles.length + 1).toString(),
          updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
          this.mockProfiles[existingIndex] = updatedProfile;
        } else {
          this.mockProfiles.push(updatedProfile);
        }

        console.log('✅ Profile saved successfully');
        observer.next(updatedProfile);
        observer.complete();
      }, 1000);
    });
  }

  private convertToProfileView(profile: RoommateProfile): RoommateProfileView {
    return {
      ...profile,
      fullName: profile.displayName,
      budgetRange: `$${profile.budgetMin} - $${profile.budgetMax}`,
      locationPreference: profile.preferredLocations.join(', '),
      aboutMe: profile.bio,
      sharedInterests: profile.interests
    };
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