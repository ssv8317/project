import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HousingListing } from '../models/housing.model';
import { MockDataService } from './mock-data.service';

@Injectable({
  providedIn: 'root'
})
export class HousingService {
  private apiUrl = 'https://localhost:56636/api';
  
  // Flag to enable/disable mock mode
  private useMockData = true; // Set to false to use real backend

  constructor(
    private http: HttpClient,
    private mockDataService: MockDataService
  ) {}

  getFeaturedListings(): Observable<HousingListing[]> {
    if (this.useMockData) {
      return this.mockDataService.getFeaturedListings();
    }

    return this.http.get<HousingListing[]>(`${this.apiUrl}/housing/featured`);
  }

  searchHousing(filters: any): Observable<HousingListing[]> {
    if (this.useMockData) {
      return this.mockDataService.searchHousing(filters);
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

    return this.http.get<HousingListing[]>(`${this.apiUrl}/housing/search`, { params: searchParams });
  }

  // Method to toggle mock mode
  setMockMode(enabled: boolean): void {
    this.useMockData = enabled;
  }

  isMockMode(): boolean {
    return this.useMockData;
  }
}