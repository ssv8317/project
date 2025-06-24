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
    // Mock profile data for testing
    const mockProfile: RoommateProfile = {
      id: 'profile-' + userId,
      userId: userId,
      displayName: 'John Doe',
      bio: 'I am a software developer who loves coding and enjoys a clean, quiet living environment. Looking for a like-minded roommate to share a great apartment with! I enjoy reading, gaming, and cooking. I work from home sometimes but also love socializing with friends.',
      age: 25,
      occupation: 'Software Developer',
      college: 'Tech University',
      budgetMin: 1000,
      budgetMax: 1500,
      preferredLocations: ['Downtown', 'Tech District', 'Near Campus'],
      sleepSchedule: 'NightOwl',
      cleanlinessLevel: 'High',
      smokingPreference: 'NonSmoker',
      petFriendly: true,
      interests: ['Gaming', 'Cooking', 'Technology', 'Reading', 'Movies', 'Fitness'],
      lifestyle: ['Professional', 'Night Owl', 'Organized', 'Social Butterfly'],
      dealBreakers: ['Smoking Indoors', 'Messy Common Areas', 'Loud Music Late'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of({ 
      hasProfile: true, 
      profile: mockProfile 
    });
  }

  // Get roommate profile
  getRoommateProfile(userId: string): Observable<RoommateProfile | null> {
    const mockProfile: RoommateProfile = {
      id: 'profile-' + userId,
      userId: userId,
      displayName: 'John Doe',
      bio: 'I am a software developer who loves coding and enjoys a clean, quiet living environment. Looking for a like-minded roommate to share a great apartment with!',
      age: 25,
      occupation: 'Software Developer',
      college: 'Tech University',
      budgetMin: 1000,
      budgetMax: 1500,
      preferredLocations: ['Downtown', 'Tech District'],
      sleepSchedule: 'NightOwl',
      cleanlinessLevel: 'High',
      smokingPreference: 'NonSmoker',
      petFriendly: true,
      interests: ['Gaming', 'Cooking', 'Technology'],
      lifestyle: ['Professional', 'Night Owl'],
      dealBreakers: ['Smoking Indoors', 'Messy Common Areas'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return of(mockProfile);
  }

  // Create or update roommate profile
  createOrUpdateProfile(userId: string, profile: Partial<RoommateProfile>): Observable<RoommateProfile> {
    const profileData: RoommateProfile = {
      id: 'profile-' + userId,
      userId: userId,
      displayName: profile.displayName || 'User',
      bio: profile.bio || '',
      age: profile.age || 25,
      occupation: profile.occupation || '',
      college: profile.college,
      budgetMin: profile.budgetMin || 0,
      budgetMax: profile.budgetMax || 0,
      preferredLocations: profile.preferredLocations || [],
      sleepSchedule: profile.sleepSchedule || 'Flexible',
      cleanlinessLevel: profile.cleanlinessLevel || 'Medium',
      smokingPreference: profile.smokingPreference || 'NonSmoker',
      petFriendly: profile.petFriendly || false,
      interests: profile.interests || [],
      lifestyle: profile.lifestyle || [],
      dealBreakers: profile.dealBreakers || [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return of(profileData);
  }

  // Get potential matches
  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    const mockMatches: MatchResponse[] = [
      {
        id: 'match-1',
        profile: {
          id: 'profile-1',
          userId: 'user-1',
          displayName: 'Sarah Johnson',
          bio: 'Graphic designer who loves art, coffee, and keeping things organized. Looking for a clean, friendly roommate to share a downtown apartment.',
          age: 24,
          occupation: 'Graphic Designer',
          college: 'Art Institute',
          budgetMin: 1000,
          budgetMax: 1400,
          preferredLocations: ['Downtown', 'Arts District'],
          sleepSchedule: 'NightOwl',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: true,
          interests: ['Art', 'Photography', 'Coffee', 'Reading', 'Movies'],
          lifestyle: ['Creative', 'Organized', 'Social'],
          dealBreakers: ['Smoking Indoors', 'Loud Music Late'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 92,
        sharedInterests: ['Clean Living', 'Night Owl', 'Pet Friendly', 'Downtown Location'],
        isMatched: false
      },
      {
        id: 'match-2',
        profile: {
          id: 'profile-2',
          userId: 'user-2',
          displayName: 'Mike Chen',
          bio: 'Software engineer at a tech startup. Love gaming, cooking, and working out. Looking for someone who appreciates a clean space and good conversation.',
          age: 26,
          occupation: 'Software Engineer',
          college: 'State University',
          budgetMin: 1200,
          budgetMax: 1600,
          preferredLocations: ['Tech District', 'Downtown'],
          sleepSchedule: 'NightOwl',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: false,
          interests: ['Gaming', 'Technology', 'Cooking', 'Fitness'],
          lifestyle: ['Professional', 'Night Owl', 'Tech Savvy'],
          dealBreakers: ['Pets', 'Smoking Indoors'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 88,
        sharedInterests: ['Tech Industry', 'Gaming', 'Cooking', 'Clean Living'],
        isMatched: false
      },
      {
        id: 'match-3',
        profile: {
          id: 'profile-3',
          userId: 'user-3',
          displayName: 'Emma Davis',
          bio: 'Marketing specialist and yoga enthusiast. I love trying new restaurants, reading, and maintaining a peaceful living environment.',
          age: 23,
          occupation: 'Marketing Specialist',
          college: 'Business College',
          budgetMin: 900,
          budgetMax: 1300,
          preferredLocations: ['Near Campus', 'Downtown'],
          sleepSchedule: 'EarlyBird',
          cleanlinessLevel: 'Medium',
          smokingPreference: 'NonSmoker',
          petFriendly: true,
          interests: ['Yoga', 'Reading', 'Cooking', 'Travel'],
          lifestyle: ['Health Conscious', 'Early Riser', 'Social'],
          dealBreakers: ['Smoking Indoors', 'Parties at Home'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 85,
        sharedInterests: ['Young Professional', 'Reading', 'Budget Conscious'],
        isMatched: false
      },
      {
        id: 'match-4',
        profile: {
          id: 'profile-4',
          userId: 'user-4',
          displayName: 'Alex Rodriguez',
          bio: 'Data analyst who enjoys hiking, photography, and good music. Looking for a responsible roommate who values work-life balance.',
          age: 25,
          occupation: 'Data Analyst',
          college: 'Tech University',
          budgetMin: 1100,
          budgetMax: 1500,
          preferredLocations: ['Midtown', 'Tech District'],
          sleepSchedule: 'Flexible',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: true,
          interests: ['Photography', 'Hiking', 'Music', 'Technology'],
          lifestyle: ['Professional', 'Outdoorsy', 'Balanced'],
          dealBreakers: ['Smoking Indoors', 'Messy Common Areas'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 82,
        sharedInterests: ['Professional', 'Clean Living', 'Technology'],
        isMatched: false
      },
      {
        id: 'match-5',
        profile: {
          id: 'profile-5',
          userId: 'user-5',
          displayName: 'Jessica Kim',
          bio: 'UX designer passionate about creating beautiful spaces and experiences. Love art galleries, coffee shops, and weekend adventures.',
          age: 27,
          occupation: 'UX Designer',
          college: 'Design School',
          budgetMin: 1300,
          budgetMax: 1700,
          preferredLocations: ['Arts District', 'Downtown'],
          sleepSchedule: 'NightOwl',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: false,
          interests: ['Art', 'Design', 'Coffee', 'Travel'],
          lifestyle: ['Creative', 'Professional', 'Cultured'],
          dealBreakers: ['Pets', 'Loud Music Late'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 79,
        sharedInterests: ['Creative Field', 'Night Owl', 'Professional'],
        isMatched: false
      }
    ];

    return of(mockMatches);
  }

  // Swipe on a profile
  swipe(userId: string, request: SwipeRequest): Observable<MatchResponse> {
    // Find the match being swiped on
    const mockMatches: MatchResponse[] = [
      {
        id: 'match-1',
        profile: {
          id: 'profile-1',
          userId: 'user-1',
          displayName: 'Sarah Johnson',
          bio: 'Graphic designer who loves art, coffee, and keeping things organized.',
          age: 24,
          occupation: 'Graphic Designer',
          college: 'Art Institute',
          budgetMin: 1000,
          budgetMax: 1400,
          preferredLocations: ['Downtown', 'Arts District'],
          sleepSchedule: 'NightOwl',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: true,
          interests: ['Art', 'Photography', 'Coffee'],
          lifestyle: ['Creative', 'Organized'],
          dealBreakers: ['Smoking Indoors'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        } as RoommateProfile,
        compatibilityScore: 92,
        sharedInterests: ['Clean Living', 'Night Owl', 'Pet Friendly'],
        isMatched: request.action === UserAction.Like || request.action === UserAction.SuperLike,
        matchedAt: request.action === UserAction.Like || request.action === UserAction.SuperLike ? new Date() : undefined
      }
    ];

    const match = mockMatches.find(m => m.profile.userId === request.targetUserId) || mockMatches[0];
    return of(match);
  }

  // Get confirmed matches
  getMatches(userId: string): Observable<MatchResponse[]> {
    const mockConfirmedMatches: MatchResponse[] = [
      {
        id: 'confirmed-match-1',
        profile: {
          id: 'profile-confirmed-1',
          userId: 'user-confirmed-1',
          displayName: 'Lisa Wang',
          bio: 'Medical student who loves studying, yoga, and cooking healthy meals. Looking for a quiet, studious roommate.',
          age: 24,
          occupation: 'Medical Student',
          college: 'Medical School',
          budgetMin: 1100,
          budgetMax: 1400,
          preferredLocations: ['Near Campus', 'Quiet Area'],
          sleepSchedule: 'EarlyBird',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: false,
          interests: ['Studying', 'Yoga', 'Cooking', 'Health'],
          lifestyle: ['Student', 'Health Conscious', 'Quiet'],
          dealBreakers: ['Loud Music Late', 'Parties at Home'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 89,
        sharedInterests: ['Clean Living', 'Health Conscious', 'Quiet Environment'],
        isMatched: true,
        matchedAt: new Date(Date.now() - 86400000) // 1 day ago
      },
      {
        id: 'confirmed-match-2',
        profile: {
          id: 'profile-confirmed-2',
          userId: 'user-confirmed-2',
          displayName: 'David Park',
          bio: 'Finance professional who enjoys reading, working out, and exploring the city. Looking for a responsible roommate.',
          age: 26,
          occupation: 'Financial Analyst',
          college: 'Business School',
          budgetMin: 1200,
          budgetMax: 1600,
          preferredLocations: ['Downtown', 'Financial District'],
          sleepSchedule: 'EarlyBird',
          cleanlinessLevel: 'High',
          smokingPreference: 'NonSmoker',
          petFriendly: true,
          interests: ['Reading', 'Fitness', 'Finance', 'Travel'],
          lifestyle: ['Professional', 'Early Riser', 'Organized'],
          dealBreakers: ['Smoking Indoors', 'Messy Common Areas'],
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        compatibilityScore: 86,
        sharedInterests: ['Professional', 'Reading', 'Fitness', 'Organized'],
        isMatched: true,
        matchedAt: new Date(Date.now() - 172800000) // 2 days ago
      }
    ];

    return of(mockConfirmedMatches);
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