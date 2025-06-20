import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HousingService } from '../../services/housing.service';
import { HousingListing, SearchFilters } from '../../models/housing.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <!-- Navigation Header -->
    <nav class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center">
              <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-xl shadow-lg">
                HM
              </div>
              <span class="ml-3 text-xl font-bold text-gray-800">HomeMate</span>
            </a>
          </div>

          <!-- Navigation Links -->
          <div class="flex items-center space-x-4">
            <a routerLink="/login" class="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200">
              Login
            </a>
            <a routerLink="/register" class="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 shadow-lg">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section with Search -->
    <section class="bg-gradient-to-br from-blue-600 to-indigo-800 py-20 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h1 class="text-4xl md:text-6xl font-bold mb-6">
            Find Your Perfect
            <span class="text-yellow-300">Home</span>
          </h1>
          <p class="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Discover amazing housing options in your area. Search by location, filter by your preferences, and find your ideal living space.
          </p>
        </div>

        <!-- Search Form -->
        <div class="max-w-4xl mx-auto">
          <form [formGroup]="searchForm" (ngSubmit)="onSearch()" class="bg-white rounded-2xl shadow-2xl p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <!-- ZIP Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  formControlName="zipCode"
                  placeholder="e.g., 10001"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>

              <!-- Price Range -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
                <select formControlName="maxPrice" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Any Price</option>
                  <option value="800">Under $800</option>
                  <option value="1200">Under $1,200</option>
                  <option value="1600">Under $1,600</option>
                  <option value="2000">Under $2,000</option>
                  <option value="2500">Under $2,500</option>
                </select>
              </div>

              <!-- Bedrooms -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <select formControlName="bedrooms" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Any</option>
                  <option value="1">1 Bedroom</option>
                  <option value="2">2 Bedrooms</option>
                  <option value="3">3+ Bedrooms</option>
                </select>
              </div>

              <!-- Search Button -->
              <div class="flex items-end">
                <button
                  type="submit"
                  [disabled]="isSearching"
                  class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium"
                >
                  <span *ngIf="isSearching">Searching...</span>
                  <span *ngIf="!isSearching">🔍 Search</span>
                </button>
              </div>
            </div>

            <!-- Advanced Filters -->
            <div class="border-t border-gray-200 pt-4">
              <div class="flex flex-wrap gap-4">
                <label class="flex items-center">
                  <input type="checkbox" formControlName="petFriendly" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Pet Friendly</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="furnished" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Furnished</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="parking" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Parking</span>
                </label>
                <label class="flex items-center">
                  <input type="checkbox" formControlName="gym" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                  <span class="ml-2 text-sm text-gray-700">Gym</span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Results Section -->
    <section class="py-12 bg-gray-50" *ngIf="searchResults.length > 0 || hasSearched">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Results Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-900">Search Results</h2>
            <p class="text-gray-600 mt-1">{{ searchResults.length }} properties found</p>
          </div>
          
          <!-- Sort Options -->
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">Sort by:</label>
            <select 
              (change)="onSortChange($event)"
              class="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="bedrooms-asc">Bedrooms: Low to High</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- Listings Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" *ngIf="searchResults.length > 0">
          <div *ngFor="let listing of searchResults" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <!-- Image -->
            <div class="relative h-48 overflow-hidden">
              <img 
                [src]="listing.images[0]" 
                [alt]="listing.title"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              >
              <div class="absolute top-4 left-4">
                <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ${{ listing.price }}/month
                </span>
              </div>
              <div class="absolute top-4 right-4" *ngIf="listing.featured">
                <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ Featured
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ listing.title }}</h3>
              <p class="text-gray-600 mb-3">📍 {{ listing.address }}</p>
              
              <!-- Property Details -->
              <div class="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <span>🛏️ {{ listing.bedrooms }} bed</span>
                <span>🚿 {{ listing.bathrooms }} bath</span>
                <span>📐 {{ listing.squareFeet }} sq ft</span>
              </div>

              <!-- Amenities -->
              <div class="flex flex-wrap gap-2 mb-4">
                <span 
                  *ngFor="let amenity of listing.amenities.slice(0, 3)" 
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {{ amenity }}
                </span>
                <span 
                  *ngIf="listing.amenities.length > 3"
                  class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  +{{ listing.amenities.length - 3 }} more
                </span>
              </div>

              <!-- Footer -->
              <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                <div class="flex items-center space-x-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="text-sm text-gray-600">{{ listing.landlord.rating }}</span>
                </div>
                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div *ngIf="hasSearched && searchResults.length === 0" class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h4m6 0h2m-6 4h2"/>
            </svg>
          </div>
          <h3 class="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
          <p class="text-gray-600 mb-4">Try adjusting your search criteria or expanding your search area.</p>
          <button 
            (click)="clearFilters()"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </section>

    <!-- Featured Properties -->
    <section class="py-16 bg-white" *ngIf="!hasSearched">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Properties
          </h2>
          <p class="text-xl text-gray-600">
            Hand-picked properties with the best value and amenities
          </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div *ngFor="let listing of featuredListings" class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div class="relative h-48 overflow-hidden">
              <img 
                [src]="listing.images[0]" 
                [alt]="listing.title"
                class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              >
              <div class="absolute top-4 left-4">
                <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ${{ listing.price }}/month
                </span>
              </div>
              <div class="absolute top-4 right-4">
                <span class="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  ⭐ Featured
                </span>
              </div>
            </div>

            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ listing.title }}</h3>
              <p class="text-gray-600 mb-3">📍 {{ listing.address }}</p>
              
              <div class="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                <span>🛏️ {{ listing.bedrooms }} bed</span>
                <span>🚿 {{ listing.bathrooms }} bath</span>
                <span>📐 {{ listing.squareFeet }} sq ft</span>
              </div>

              <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                <div class="flex items-center space-x-2">
                  <span class="text-yellow-500">⭐</span>
                  <span class="text-sm text-gray-600">{{ listing.landlord.rating }}</span>
                </div>
                <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-indigo-700 py-16" *ngIf="!hasSearched">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Find Your Perfect Home?
        </h2>
        <p class="text-xl text-blue-100 mb-8">
          Join thousands who found their ideal living space through HomeMate
        </p>
        <a routerLink="/register" class="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200">
          Get Started Today
        </a>
      </div>
    </section>
  `
})
export class LandingComponent implements OnInit {
  searchForm: FormGroup;
  searchResults: HousingListing[] = [];
  featuredListings: HousingListing[] = [];
  isSearching = false;
  hasSearched = false;

  constructor(
    private fb: FormBuilder,
    private housingService: HousingService
  ) {
    this.searchForm = this.fb.group({
      zipCode: ['', [Validators.pattern(/^\d{5}$/)]],
      maxPrice: [''],
      bedrooms: [''],
      petFriendly: [false],
      furnished: [false],
      parking: [false],
      gym: [false]
    });
  }

  ngOnInit(): void {
    this.loadFeaturedListings();
  }

  loadFeaturedListings(): void {
    this.housingService.getFeaturedListings().subscribe({
      next: (listings) => {
        this.featuredListings = listings;
      },
      error: (error) => {
        console.error('Error loading featured listings:', error);
      }
    });
  }

  onSearch(): void {
    this.isSearching = true;
    this.hasSearched = true;

    const formValue = this.searchForm.value;
    const filters: Partial<SearchFilters> = {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: [],
      sortBy: 'date',
      sortOrder: 'desc'
    };

    // Add amenities based on checkboxes
    if (formValue.parking) filters.amenities?.push('Parking');
    if (formValue.gym) filters.amenities?.push('Gym');

    this.housingService.searchHousing(filters).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.isSearching = false;
      }
    });
  }

  onSortChange(event: any): void {
    const [sortBy, sortOrder] = event.target.value.split('-');
    const currentFilters = this.getCurrentFilters();
    currentFilters.sortBy = sortBy as any;
    currentFilters.sortOrder = sortOrder as any;

    this.housingService.searchHousing(currentFilters).subscribe({
      next: (results) => {
        this.searchResults = results;
      }
    });
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.searchResults = [];
    this.hasSearched = false;
  }

  private getCurrentFilters(): Partial<SearchFilters> {
    const formValue = this.searchForm.value;
    return {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: []
    };
  }
}