import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { RoommateProfile, RoommateProfileView, MatchResponse, UserAction, SwipeRequest } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MockMatchService {
  private mockProfiles: RoommateProfile[] = [
    {
      id: '1',
      userId: '2',
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
      id: '2',
      userId: '3',
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
  private matches: { [userId: string]: string[] } = {};

  constructor() {}

  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    console.log('💕 Getting mock potential matches for user:', userId);
    
    return of(this.mockProfiles).pipe(
      delay(1000),
      map(profiles => {
        // Filter out profiles the user has already swiped on
        const swipedProfiles = this.swipeHistory[userId] || [];
        const availableProfiles = profiles.filter(p => 
          p.userId !== userId && !swipedProfiles.includes(p.id)
        );

        // Convert to MatchResponse format with mock compatibility scores
        const matchResponses: MatchResponse[] = availableProfiles.map(profile => ({
          id: profile.id,
          profile: this.convertToProfileView(profile),
          compatibilityScore: Math.floor(Math.random() * 40) + 60, // 60-100% compatibility
          isNewMatch: false
        }));

        console.log(`✅ Found ${matchResponses.length} potential matches`);
        return matchResponses.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
      })
    );
  }

  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    console.log('👆 Mock swipe:', { userId, request });
    
    return of(null).pipe(
      delay(500),
      map(() => {
        // Add to swipe history
        if (!this.swipeHistory[userId]) {
          this.swipeHistory[userId] = [];
        }
        this.swipeHistory[userId].push(request.profileId);

        // Find the profile
        const profile = this.mockProfiles.find(p => p.id === request.profileId);
        if (!profile) {
          throw new Error('Profile not found');
        }

        // Simulate match (30% chance if it's a like)
        const isNewMatch = request.action === UserAction.Like && Math.random() < 0.3;
        
        if (isNewMatch) {
          if (!this.matches[userId]) {
            this.matches[userId] = [];
          }
          this.matches[userId].push(request.profileId);
          console.log('🎉 New match created!');
        }

        return {
          id: profile.id,
          profile: this.convertToProfileView(profile),
          compatibilityScore: Math.floor(Math.random() * 40) + 60,
          isNewMatch
        };
      })
    );
  }

  getMatches(userId: string): Observable<MatchResponse[]> {
    console.log('💑 Getting mock matches for user:', userId);
    
    return of(null).pipe(
      delay(800),
      map(() => {
        const userMatches = this.matches[userId] || [];
        const matchedProfiles = this.mockProfiles.filter(p => userMatches.includes(p.id));
        
        const matchResponses: MatchResponse[] = matchedProfiles.map(profile => ({
          id: profile.id,
          profile: this.convertToProfileView(profile),
          compatibilityScore: Math.floor(Math.random() * 40) + 60,
          isNewMatch: false
        }));

        console.log(`✅ Found ${matchResponses.length} matches`);
        return matchResponses;
      })
    );
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile> {
    console.log('👤 Getting mock roommate profile for user:', userId);
    
    return of(null).pipe(
      delay(600),
      map(() => {
        const profile = this.mockProfiles.find(p => p.userId === userId);
        if (!profile) {
          throw new Error('Profile not found');
        }
        return profile;
      })
    );
  }

  createOrUpdateProfile(userId: string, profile: RoommateProfile): Observable<RoommateProfile> {
    console.log('💾 Mock create/update profile for user:', userId);
    
    return of(profile).pipe(
      delay(1000),
      map(() => {
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
        return updatedProfile;
      })
    );
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