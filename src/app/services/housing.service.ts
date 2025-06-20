import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { HousingListing, SearchFilters } from '../models/housing.model';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private mockListings: HousingListing[] = [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      address: '123 Main St, Downtown',
      zipCode: '10001',
      price: 1200,
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 850,
      images: [
        'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
        'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg',
        'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'
      ],
      amenities: ['WiFi', 'Gym', 'Parking', 'Laundry', 'Pool'],
      description: 'Beautiful modern apartment in the heart of downtown with stunning city views.',
      availableDate: new Date('2024-02-01'),
      petFriendly: true,
      furnished: false,
      utilities: ['Water', 'Trash'],
      landlord: {
        name: 'John Smith',
        phone: '(555) 123-4567',
        email: 'john@example.com',
        rating: 4.8
      },
      coordinates: { lat: 40.7128, lng: -74.0060 },
      featured: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Cozy Studio Near Campus',
      address: '456 University Ave, Campus Area',
      zipCode: '10002',
      price: 800,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 500,
      images: [
        'https://images.pexels.com/photos/1571467/pexels-photo-1571467.jpeg',
        'https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg'
      ],
      amenities: ['WiFi', 'Study Room', 'Bike Storage'],
      description: 'Perfect for students! Walking distance to campus with all utilities included.',
      availableDate: new Date('2024-01-20'),
      petFriendly: false,
      furnished: true,
      utilities: ['Water', 'Electric', 'Internet'],
      landlord: {
        name: 'Sarah Johnson',
        phone: '(555) 987-6543',
        email: 'sarah@example.com',
        rating: 4.5
      },
      coordinates: { lat: 40.7589, lng: -73.9851 },
      featured: false,
      createdAt: new Date('2024-01-10')
    },
    {
      id: '3',
      title: 'Luxury 3BR Penthouse',
      address: '789 Park Ave, Upper East Side',
      zipCode: '10003',
      price: 2500,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1200,
      images: [
        'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg',
        'https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg',
        'https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg'
      ],
      amenities: ['Concierge', 'Rooftop Deck', 'Gym', 'Parking', 'Pool', 'Spa'],
      description: 'Stunning penthouse with panoramic city views and luxury amenities.',
      availableDate: new Date('2024-02-15'),
      petFriendly: true,
      furnished: true,
      utilities: ['Water', 'Trash', 'Cable'],
      landlord: {
        name: 'Michael Brown',
        phone: '(555) 456-7890',
        email: 'michael@example.com',
        rating: 4.9
      },
      coordinates: { lat: 40.7831, lng: -73.9712 },
      featured: true,
      createdAt: new Date('2024-01-20')
    },
    {
      id: '4',
      title: 'Shared House with Garden',
      address: '321 Oak St, Residential Area',
      zipCode: '10001',
      price: 950,
      bedrooms: 2,
      bathrooms: 1,
      squareFeet: 900,
      images: [
        'https://images.pexels.com/photos/1571476/pexels-photo-1571476.jpeg',
        'https://images.pexels.com/photos/1571477/pexels-photo-1571477.jpeg'
      ],
      amenities: ['Garden', 'Parking', 'Laundry', 'BBQ Area'],
      description: 'Charming house with private garden, perfect for roommate sharing.',
      availableDate: new Date('2024-01-25'),
      petFriendly: true,
      furnished: false,
      utilities: ['Water'],
      landlord: {
        name: 'Emily Davis',
        phone: '(555) 234-5678',
        email: 'emily@example.com',
        rating: 4.6
      },
      coordinates: { lat: 40.7505, lng: -73.9934 },
      featured: false,
      createdAt: new Date('2024-01-12')
    },
    {
      id: '5',
      title: 'Modern Loft in Arts District',
      address: '654 Creative Blvd, Arts District',
      zipCode: '10002',
      price: 1400,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 750,
      images: [
        'https://images.pexels.com/photos/1571478/pexels-photo-1571478.jpeg',
        'https://images.pexels.com/photos/1571479/pexels-photo-1571479.jpeg'
      ],
      amenities: ['High Ceilings', 'Exposed Brick', 'WiFi', 'Art Studio'],
      description: 'Industrial loft with artistic flair in the vibrant arts district.',
      availableDate: new Date('2024-02-10'),
      petFriendly: false,
      furnished: false,
      utilities: ['Water', 'Trash'],
      landlord: {
        name: 'Alex Wilson',
        phone: '(555) 345-6789',
        email: 'alex@example.com',
        rating: 4.7
      },
      coordinates: { lat: 40.7282, lng: -74.0776 },
      featured: false,
      createdAt: new Date('2024-01-18')
    }
  ];

  searchHousing(filters: Partial<SearchFilters>): Observable<HousingListing[]> {
    let filteredListings = [...this.mockListings];

    // Filter by ZIP code
    if (filters.zipCode) {
      filteredListings = filteredListings.filter(listing => 
        listing.zipCode.includes(filters.zipCode!)
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filteredListings = filteredListings.filter(listing => 
        listing.price >= filters.minPrice!
      );
    }
    if (filters.maxPrice !== undefined) {
      filteredListings = filteredListings.filter(listing => 
        listing.price <= filters.maxPrice!
      );
    }

    // Filter by bedrooms
    if (filters.bedrooms && filters.bedrooms.length > 0) {
      filteredListings = filteredListings.filter(listing => 
        filters.bedrooms!.includes(listing.bedrooms)
      );
    }

    // Filter by bathrooms
    if (filters.bathrooms !== undefined) {
      filteredListings = filteredListings.filter(listing => 
        listing.bathrooms >= filters.bathrooms!
      );
    }

    // Filter by pet friendly
    if (filters.petFriendly !== undefined) {
      filteredListings = filteredListings.filter(listing => 
        listing.petFriendly === filters.petFriendly
      );
    }

    // Filter by furnished
    if (filters.furnished !== undefined) {
      filteredListings = filteredListings.filter(listing => 
        listing.furnished === filters.furnished
      );
    }

    // Filter by amenities
    if (filters.amenities && filters.amenities.length > 0) {
      filteredListings = filteredListings.filter(listing => 
        filters.amenities!.some(amenity => listing.amenities.includes(amenity))
      );
    }

    // Sort results
    if (filters.sortBy) {
      filteredListings.sort((a, b) => {
        let comparison = 0;
        switch (filters.sortBy) {
          case 'price':
            comparison = a.price - b.price;
            break;
          case 'date':
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            break;
          case 'bedrooms':
            comparison = a.bedrooms - b.bedrooms;
            break;
          case 'rating':
            comparison = a.landlord.rating - b.landlord.rating;
            break;
        }
        return filters.sortOrder === 'desc' ? -comparison : comparison;
      });
    }

    // Simulate API delay
    return of(filteredListings).pipe(delay(500));
  }

  getFeaturedListings(): Observable<HousingListing[]> {
    const featured = this.mockListings.filter(listing => listing.featured);
    return of(featured).pipe(delay(300));
  }

  getListingById(id: string): Observable<HousingListing | null> {
    const listing = this.mockListings.find(l => l.id === id);
    return of(listing || null).pipe(delay(200));
  }
}