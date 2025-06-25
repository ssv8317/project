import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HousingListing } from '../models/housing.model';
import { RoommateProfile, MatchResponse, UserAction } from '../models/match.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  
  // Mock Housing Listings
  private mockHousingListings: HousingListing[] = [
    {
      id: '1',
      title: 'Modern 2BR Apartment Downtown',
      address: '123 Main St, Downtown',
      zipCode: '10001',
      price: 2500,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      petFriendly: true,
      furnished: false,
      amenities: ['Gym', 'Pool', 'Parking', 'Laundry'],
      images: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'
      ],
      description: 'Beautiful modern apartment in the heart of downtown with stunning city views.',
      datePosted: new Date('2024-01-15'),
      isFeatured: true,
      contactInfo: 'contact@downtown-apts.com',
      ownerId: 'owner1',
      location: 'Downtown',
      createdAt: new Date('2024-01-15'),
      landlord: {
        name: 'Downtown Properties',
        phone: '(555) 123-4567',
        email: 'info@downtownprops.com',
        rating: 4.5
      }
    },
    {
      id: '2',
      title: 'Cozy 1BR Near Campus',
      address: '456 University Ave',
      zipCode: '10002',
      price: 1800,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 800,
      petFriendly: false,
      furnished: true,
      amenities: ['WiFi', 'Parking', 'Study Room'],
      images: [
        'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'
      ],
      description: 'Perfect for students! Walking distance to campus with all utilities included.',
      datePosted: new Date('2024-01-20'),
      isFeatured: false,
      contactInfo: 'rentals@campushousing.com',
      ownerId: 'owner2',
      location: 'University District',
      createdAt: new Date('2024-01-20'),
      landlord: {
        name: 'Campus Housing LLC',
        phone: '(555) 987-6543',
        email: 'info@campushousing.com',
        rating: 4.2
      }
    },
    {
      id: '3',
      title: 'Luxury 3BR Penthouse',
      address: '789 Skyline Dr',
      zipCode: '10003',
      price: 4500,
      bedrooms: 3,
      bathrooms: 3,
      squareFeet: 2000,
      petFriendly: true,
      furnished: false,
      amenities: ['Gym', 'Pool', 'Concierge', 'Rooftop Deck', 'Parking'],
      images: [
        'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg'
      ],
      description: 'Stunning penthouse with panoramic city views and luxury amenities.',
      datePosted: new Date('2024-01-25'),
      isFeatured: true,
      contactInfo: 'luxury@skylineprops.com',
      ownerId: 'owner3',
      location: 'Uptown',
      createdAt: new Date('2024-01-25'),
      landlord: {
        name: 'Skyline Properties',
        phone: '(555) 456-7890',
        email: 'info@skylineprops.com',
        rating: 4.8
      }
    },
    {
      id: '4',
      title: 'Affordable Studio Apartment',
      address: '321 Budget St',
      zipCode: '10001',
      price: 1200,
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 500,
      petFriendly: false,
      furnished: true,
      amenities: ['Laundry', 'WiFi'],
      images: [
        'https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg'
      ],
      description: 'Compact and efficient studio perfect for young professionals.',
      datePosted: new Date('2024-01-28'),
      isFeatured: false,
      contactInfo: 'info@budgetliving.com',
      ownerId: 'owner4',
      location: 'Downtown',
      createdAt: new Date('2024-01-28')
    }
  ];

  // Mock Roommate Profiles
  private mockRoommateProfiles: RoommateProfile[] = [
    {
      id: 'profile1',
      userId: 'user1',
      displayName: 'Sarah Johnson',
      age: 24,
      gender: 'Female',
      occupation: 'Software Engineer',
      bio: 'Love cooking, hiking, and movie nights. Looking for a clean and friendly roommate!',
      profilePictures: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
      budgetMin: 800,
      budgetMax: 1500,
      preferredLocations: ['Downtown', 'Tech District'],
      cleanliness: 4,
      socialLevel: 3,
      noiseLevel: 2,
      smokingOk: false,
      petsOk: true,
      interests: ['Cooking', 'Hiking', 'Movies', 'Technology'],
      isActive: true,
      createdAt: '2024-01-15T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z'
    },
    {
      id: 'profile2',
      userId: 'user2',
      displayName: 'Mike Chen',
      age: 26,
      gender: 'Male',
      occupation: 'Marketing Specialist',
      bio: 'Fitness enthusiast and social butterfly. Love hosting friends and trying new restaurants.',
      profilePictures: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
      budgetMin: 1000,
      budgetMax: 1800,
      preferredLocations: ['Downtown', 'Midtown'],
      cleanliness: 3,
      socialLevel: 5,
      noiseLevel: 4,
      smokingOk: false,
      petsOk: false,
      interests: ['Fitness', 'Cooking', 'Socializing', 'Travel'],
      isActive: true,
      createdAt: '2024-01-16T00:00:00Z',
      updatedAt: '2024-01-16T00:00:00Z'
    },
    {
      id: 'profile3',
      userId: 'user3',
      displayName: 'Emily Rodriguez',
      age: 22,
      gender: 'Female',
      occupation: 'Graduate Student',
      bio: 'Quiet student focused on studies. Love reading, yoga, and peaceful environments.',
      profilePictures: ['https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'],
      budgetMin: 600,
      budgetMax: 1200,
      preferredLocations: ['University District', 'Quiet Neighborhoods'],
      cleanliness: 5,
      socialLevel: 2,
      noiseLevel: 1,
      smokingOk: false,
      petsOk: true,
      interests: ['Reading', 'Yoga', 'Studying', 'Nature'],
      isActive: true,
      createdAt: '2024-01-17T00:00:00Z',
      updatedAt: '2024-01-17T00:00:00Z'
    },
    {
      id: 'profile4',
      userId: 'user4',
      displayName: 'Alex Thompson',
      age: 28,
      gender: 'Male',
      occupation: 'Graphic Designer',
      bio: 'Creative professional who loves art, music, and good coffee. Looking for an inspiring living space.',
      profilePictures: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'],
      budgetMin: 900,
      budgetMax: 1600,
      preferredLocations: ['Arts District', 'Downtown', 'Creative Neighborhoods'],
      cleanliness: 3,
      socialLevel: 4,
      noiseLevel: 3,
      smokingOk: false,
      petsOk: true,
      interests: ['Art', 'Music', 'Coffee', 'Design', 'Photography'],
      isActive: true,
      createdAt: '2024-01-18T00:00:00Z',
      updatedAt: '2024-01-18T00:00:00Z'
    }
  ];

  // Mock Users
  private mockUsers: User[] = [
    {
      id: 'user1',
      fullName: 'Sarah Johnson',
      email: 'sarah@example.com',
      age: 24,
      gender: 'Female',
      occupation: 'Software Engineer',
      college: 'Tech University',
      sleepSchedule: 'Early Bird',
      cleanlinessLevel: 'High',
      smokingPreference: 'No',
      petFriendly: 'Yes',
      budgetRange: '$800-1500',
      locationPreference: 'Downtown',
      aboutMe: 'Love cooking, hiking, and movie nights. Looking for a clean and friendly roommate!',
      createdAt: new Date('2024-01-15')
    }
  ];

  getFeaturedListings(): Observable<HousingListing[]> {
    const featured = this.mockHousingListings.filter(listing => listing.isFeatured);
    return of(featured).pipe(delay(500)); // Simulate network delay
  }

  searchHousing(filters: any): Observable<HousingListing[]> {
    let results = [...this.mockHousingListings];

    // Apply filters
    if (filters.zipCode) {
      results = results.filter(listing => listing.zipCode === filters.zipCode);
    }
    if (filters.maxPrice) {
      results = results.filter(listing => listing.price <= filters.maxPrice);
    }
    if (filters.minPrice) {
      results = results.filter(listing => listing.price >= filters.minPrice);
    }
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      results = results.filter(listing => filters.bedrooms.includes(listing.bedrooms));
    }
    if (filters.petFriendly === true) {
      results = results.filter(listing => listing.petFriendly);
    }
    if (filters.furnished === true) {
      results = results.filter(listing => listing.furnished);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      results = results.filter(listing => 
        filters.amenities.some((amenity: string) => listing.amenities.includes(amenity))
      );
    }

    // Apply sorting
    if (filters.sortBy === 'price') {
      results.sort((a, b) => filters.sortOrder === 'desc' ? b.price - a.price : a.price - b.price);
    } else {
      results.sort((a, b) => filters.sortOrder === 'desc' 
        ? new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
        : new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime()
      );
    }

    return of(results).pipe(delay(800)); // Simulate network delay
  }

  getPotentialMatches(userId: string): Observable<MatchResponse[]> {
    // Calculate compatibility scores and return matches
    const matches: MatchResponse[] = this.mockRoommateProfiles.map((profile, index) => ({
      id: profile.id,
      profile: {
        ...profile,
        fullName: profile.displayName,
        budgetRange: `$${profile.budgetMin} - $${profile.budgetMax}`,
        locationPreference: profile.preferredLocations.join(', '),
        aboutMe: profile.bio,
        sharedInterests: profile.interests.slice(0, 2) // Mock shared interests
      },
      compatibilityScore: 75 + (index * 5), // Mock compatibility scores
      isNewMatch: false
    }));

    return of(matches).pipe(delay(600));
  }

  getRoommateProfile(userId: string): Observable<RoommateProfile | null> {
    const profile = this.mockRoommateProfiles.find(p => p.userId === userId);
    return of(profile || null).pipe(delay(300));
  }

  createOrUpdateProfile(userId: string, profile: any): Observable<RoommateProfile> {
    const newProfile: RoommateProfile = {
      id: 'new-profile-' + Date.now(),
      userId: userId,
      displayName: profile.displayName || profile.fullName,
      age: profile.age,
      gender: profile.gender,
      occupation: profile.occupation,
      bio: profile.bio,
      profilePictures: profile.profilePictures || [],
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
      preferredLocations: profile.preferredLocations || [],
      cleanliness: profile.cleanliness,
      socialLevel: profile.socialLevel,
      noiseLevel: profile.noiseLevel,
      smokingOk: profile.smokingOk,
      petsOk: profile.petsOk,
      interests: profile.interests || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return of(newProfile).pipe(delay(500));
  }

  swipe(userId: string, request: any): Observable<MatchResponse> {
    const targetProfile = this.mockRoommateProfiles.find(p => p.id === request.profileId);
    
    if (!targetProfile) {
      throw new Error('Profile not found');
    }

    const matchResponse: MatchResponse = {
      id: targetProfile.id,
      profile: {
        ...targetProfile,
        fullName: targetProfile.displayName,
        budgetRange: `$${targetProfile.budgetMin} - $${targetProfile.budgetMax}`,
        locationPreference: targetProfile.preferredLocations.join(', '),
        aboutMe: targetProfile.bio,
        sharedInterests: targetProfile.interests.slice(0, 2)
      },
      compatibilityScore: Math.floor(Math.random() * 30) + 70, // Random score 70-100
      isNewMatch: request.action === 'like' && Math.random() > 0.7 // 30% chance of mutual match
    };

    return of(matchResponse).pipe(delay(400));
  }

  getMatches(userId: string): Observable<MatchResponse[]> {
    // Return a subset of profiles as "matched"
    const matches = this.mockRoommateProfiles.slice(0, 2).map(profile => ({
      id: profile.id,
      profile: {
        ...profile,
        fullName: profile.displayName,
        budgetRange: `$${profile.budgetMin} - $${profile.budgetMax}`,
        locationPreference: profile.preferredLocations.join(', '),
        aboutMe: profile.bio,
        sharedInterests: profile.interests.slice(0, 3)
      },
      compatibilityScore: Math.floor(Math.random() * 20) + 80, // High compatibility for matches
      isNewMatch: false
    }));

    return of(matches).pipe(delay(500));
  }

  // Auth mock methods
  login(credentials: any): Observable<any> {
    const user = this.mockUsers[0]; // Return first mock user
    return of({
      token: 'mock-jwt-token-' + Date.now(),
      user: user
    }).pipe(delay(800));
  }

  register(userData: any): Observable<any> {
    const newUser: User = {
      id: 'user-' + Date.now(),
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

    return of({ user: newUser }).pipe(delay(1000));
  }

  getCurrentUser(): Observable<User | null> {
    return of(this.mockUsers[0]).pipe(delay(200));
  }
}