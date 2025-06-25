import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HousingListing } from '../models/housing.model';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private apiUrl = 'https://localhost:56636/api';

  // Mock housing data
  private mockListings: HousingListing[] = [
    {
      id: '1',
      title: 'Modern Downtown Apartment',
      address: '123 Main St, Downtown',
      zipCode: '10001',
      price: 2500,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1200,
      petFriendly: true,
      furnished: true,
      amenities: ['Gym', 'Pool', 'Parking', 'Laundry'],
      images: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
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
        email: 'contact@downtown-apts.com',
        rating: 4.5
      }
    },
    {
      id: '2',
      title: 'Cozy Studio Near Campus',
      address: '456 University Ave, Campus Area',
      zipCode: '10002',
      price: 1800,
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 600,
      petFriendly: false,
      furnished: true,
      amenities: ['WiFi', 'Laundry', 'Study Room'],
      images: ['https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg'],
      description: 'Perfect studio apartment for students, walking distance to campus.',
      datePosted: new Date('2024-01-20'),
      isFeatured: true,
      contactInfo: 'info@campus-housing.com',
      ownerId: 'owner2',
      location: 'Campus Area',
      createdAt: new Date('2024-01-20'),
      landlord: {
        name: 'Campus Housing LLC',
        phone: '(555) 234-5678',
        rating: 4.2
      }
    },
    {
      id: '3',
      title: 'Spacious 3BR Family Home',
      address: '789 Oak Street, Suburbs',
      zipCode: '10003',
      price: 3200,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      petFriendly: true,
      furnished: false,
      amenities: ['Garage', 'Garden', 'Fireplace'],
      images: ['https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'],
      description: 'Beautiful family home with large backyard and quiet neighborhood.',
      datePosted: new Date('2024-01-25'),
      isFeatured: true,
      contactInfo: 'rent@familyhomes.com',
      ownerId: 'owner3',
      location: 'Suburbs',
      createdAt: new Date('2024-01-25'),
      landlord: {
        name: 'Family Homes Realty',
        phone: '(555) 345-6789',
        rating: 4.8
      }
    },
    {
      id: '4',
      title: 'Luxury High-Rise Apartment',
      address: '321 Skyline Blvd, Financial District',
      zipCode: '10004',
      price: 4500,
      bedrooms: 2,
      bathrooms: 2,
      squareFeet: 1400,
      petFriendly: true,
      furnished: true,
      amenities: ['Concierge', 'Gym', 'Pool', 'Rooftop Deck', 'Parking'],
      images: ['https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg'],
      description: 'Luxury apartment with panoramic city views and premium amenities.',
      datePosted: new Date('2024-01-30'),
      isFeatured: false,
      contactInfo: 'luxury@skylineapts.com',
      ownerId: 'owner4',
      location: 'Financial District',
      createdAt: new Date('2024-01-30'),
      landlord: {
        name: 'Skyline Luxury Apartments',
        phone: '(555) 456-7890',
        rating: 4.9
      }
    },
    {
      id: '5',
      title: 'Affordable 1BR Apartment',
      address: '654 Budget Lane, Midtown',
      zipCode: '10001',
      price: 1500,
      bedrooms: 1,
      bathrooms: 1,
      squareFeet: 800,
      petFriendly: false,
      furnished: false,
      amenities: ['Laundry', 'Heat Included'],
      images: ['https://images.pexels.com/photos/1571475/pexels-photo-1571475.jpeg'],
      description: 'Clean and affordable apartment perfect for young professionals.',
      datePosted: new Date('2024-02-01'),
      isFeatured: false,
      contactInfo: 'info@budgetapts.com',
      ownerId: 'owner5',
      location: 'Midtown',
      createdAt: new Date('2024-02-01'),
      landlord: {
        name: 'Budget Apartments',
        phone: '(555) 567-8901',
        rating: 4.0
      }
    }
  ];

  constructor(private http: HttpClient) {}

  getFeaturedListings(): Observable<HousingListing[]> {
    // Return mock featured listings
    const featured = this.mockListings.filter(listing => listing.isFeatured);
    return of(featured);
  }

  searchHousing(filters: any): Observable<HousingListing[]> {
    let results = [...this.mockListings];

    // Apply filters to mock data
    if (filters.zipCode) {
      results = results.filter(listing => 
        listing.zipCode.includes(filters.zipCode)
      );
    }

    if (filters.maxPrice) {
      results = results.filter(listing => 
        listing.price <= parseInt(filters.maxPrice)
      );
    }

    if (filters.minPrice) {
      results = results.filter(listing => 
        listing.price >= parseInt(filters.minPrice)
      );
    }

    if (filters.bedrooms) {
      const bedroomCount = parseInt(filters.bedrooms);
      results = results.filter(listing => 
        listing.bedrooms === bedroomCount
      );
    }

    if (filters.petFriendly === 'true' || filters.petFriendly === true) {
      results = results.filter(listing => listing.petFriendly);
    }

    if (filters.furnished === 'true' || filters.furnished === true) {
      results = results.filter(listing => listing.furnished);
    }

    // Sort results
    if (filters.sortBy) {
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price':
            return filters.sortOrder === 'desc' ? b.price - a.price : a.price - b.price;
          case 'date':
            return filters.sortOrder === 'desc' 
              ? new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
              : new Date(a.datePosted).getTime() - new Date(b.datePosted).getTime();
          default:
            return 0;
        }
      });
    }

    return of(results);
  }
}