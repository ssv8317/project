import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { HousingListing } from '../models/housing.model';
import { MockHousingService } from './mock-housing.service';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private apiUrl = '/api';
  private useMockService = true; // Toggle this to switch between mock and real API

  constructor(
    private http: HttpClient,
    private mockHousingService: MockHousingService
  ) {}

  getFeaturedListings(): Observable<HousingListing[]> {
    if (this.useMockService) {
      console.log('🔄 Using mock housing service for featured listings');
      return this.mockHousingService.getFeaturedListings();
    }

    return this.http.get<HousingListing[]>(`${this.apiUrl}/housing/featured`)
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockHousingService.getFeaturedListings();
        })
      );
  }

  searchHousing(filters: any): Observable<HousingListing[]> {
    if (this.useMockService) {
      console.log('🔄 Using mock housing service for search');
      return this.mockHousingService.searchHousing(filters);
    }

    const searchParams = new HttpParams({
      fromObject: {
        zipCode: filters.zipCode || '',
        minPrice: filters.minPrice || '',
        maxPrice: filters.maxPrice || '',
        bedrooms: filters.bedrooms || '',
        bathrooms: filters.bathrooms || '',
        petFriendly: filters.petFriendly ? 'true' : 'false',
        furnished: filters.furnished ? 'true' : 'false',
        amenities: filters.amenities || ''
      }
    });

    return this.http.get<HousingListing[]>(`${this.apiUrl}/housing/search`, { params: searchParams })
      .pipe(
        catchError(error => {
          console.log('❌ Real API failed, falling back to mock service');
          this.useMockService = true;
          return this.mockHousingService.searchHousing(filters);
        })
      );
  }

  // Method to toggle between mock and real API (for testing)
  setUseMockService(useMock: boolean): void {
    this.useMockService = useMock;
    console.log(`🔄 Switched to ${useMock ? 'mock' : 'real'} housing API service`);
  }
}