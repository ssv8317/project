export interface RoommateProfile {
  id?: string;
  userId: string;
  displayName: string;
  bio: string;
  age: number;
  occupation: string;
  college?: string;
  budgetMin: number;
  budgetMax: number;
  preferredLocations: string[];
  sleepSchedule: 'EarlyBird' | 'NightOwl' | 'Flexible';
  cleanlinessLevel: 'Low' | 'Medium' | 'High';
  smokingPreference: 'Smoker' | 'NonSmoker' | 'Occasional';
  petFriendly: boolean;
  interests: string[];
  lifestyle: string[];
  dealBreakers: string[];
  profilePicture?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoommateProfileView extends RoommateProfile {
  fullName: string;
  budgetRange: string;
  locationPreference: string;
  aboutMe: string;
  sharedInterests: string[];
}

export interface MatchResponse {
  id: string;
  profile: RoommateProfile;
  compatibilityScore: number;
  sharedInterests: string[];
  isMatched: boolean;
  matchedAt?: Date;
  matchPercentage?: number; // For template compatibility
}

export interface SwipeRequest {
  targetUserId: string;
  action: UserAction;
}

export enum UserAction {
  Like = 'Like',
  Pass = 'Pass',
  SuperLike = 'SuperLike'
}

export interface ProfileCheckResponse {
  hasProfile: boolean;
  profile?: RoommateProfile;
}