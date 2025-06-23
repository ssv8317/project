import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { HousingListing } from '../models/housing.model';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private apiUrl = '/api';

  // Mock data for demo
  private mockListings: HousingListing[] = [
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
      description: 'Beautiful modern apartment in the heart of downtown. Close to public transportation and shopping.',
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
      price: 1200,
      bedrooms: 0,
      bathrooms: 1,
      squareFeet: 500,
      petFriendly: false,
      furnished: true,
      amenities: ['WiFi', 'Laundry', 'Study Room'],
      images: [
        'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg'
      ],
      description: 'Perfect for students! Fully furnished studio apartment just 5 minutes walk from campus.',
      datePosted: new Date('2024-01-20'),
      isFeatured: true,
      contactInfo: 'info@campus-housing.com',
      ownerId: 'owner2',
      location: 'Campus Area',
      createdAt: new Date('2024-01-20'),
      landlord: {
        name: 'Campus Housing LLC',
        phone: '(555) 987-6543',
        email: 'info@campus-housing.com',
        rating: 4.2
      }
    },
    {
      id: '3',
      title: 'Spacious 3BR House with Yard',
      address: '789 Oak Street, Suburbs',
      zipCode: '10003',
      price: 3200,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      petFriendly: true,
      furnished: false,
      amenities: ['Yard', 'Garage', 'Dishwasher', 'AC'],
      images: [
        'https://images.pexels.com/photos/1571471/pexels-photo-1571471.jpeg',
        'https://images.pexels.com/photos/1571472/pexels-photo-1571472.jpeg'
      ],
      description: 'Beautiful house with large backyard. Perfect for roommates who want space and privacy.',
      datePosted: new Date('2024-01-18'),
      isFeatured: false,
      contactInfo: 'owner@oakhouse.com',
      ownerId: 'owner3',
      location: 'Suburbs',
      createdAt: new Date('2024-01-18'),
      landlord: {
        name: 'Oak Street Properties',
        phone: '(555) 456-7890',
        email: 'owner@oakhouse.com',
        rating: 4.8
      }
    }
  ];

  constructor(private http: HttpClient) {}

  getFeaturedListings(): Observable<HousingListing[]> {
    console.log('🏠 Getting featured listings');
    
    return new Observable(observer => {
      setTimeout(() => {
        const featured = this.mockListings.filter(listing => listing.isFeatured);
        console.log(`✅ Found ${featured.length} featured listings`);
        observer.next(featured);
        observer.complete();
      }, 800);
    });
  }

  searchHousing(filters: any): Observable<HousingListing[]> {
    console.log('🔍 Housing search with filters:', filters);
    
    return new Observable(observer => {
      setTimeout(() => {
        let filteredListings = [...this.mockListings];

        // Apply filters
        if (filters.zipCode) {
          filteredListings = filteredListings.filter(listing => 
            listing.zipCode.includes(filters.zipCode)
          );
        }

        if (filters.minPrice) {
          filteredListings = filteredListings.filter(listing => 
            listing.price >= parseInt(filters.minPrice)
          );
        }

        if (filters.maxPrice) {
          filteredListings = filteredListings.filter(listing => 
            listing.price <= parseInt(filters.maxPrice)
          );
        }

        if (filters.bedrooms) {
          filteredListings = filteredListings.filter(listing => 
            listing.bedrooms >= parseInt(filters.bedrooms)
          );
        }

        if (filters.bathrooms) {
          filteredListings = filteredListings.filter(listing => 
            listing.bathrooms >= parseInt(filters.bathrooms)
          );
        }

        if (filters.petFriendly === 'true') {
          filteredListings = filteredListings.filter(listing => listing.petFriendly);
        }

        if (filters.furnished === 'true') {
          filteredListings = filteredListings.filter(listing => listing.furnished);
        }

        console.log(`✅ Search returned ${filteredListings.length} results`);
        observer.next(filteredListings);
        observer.complete();
      }, 1200);
    });
  }
}