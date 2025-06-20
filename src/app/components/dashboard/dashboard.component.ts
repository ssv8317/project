import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HousingService } from '../../services/housing.service';
import { User } from '../../models/user.model';
import { HousingListing, SearchFilters } from '../../models/housing.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  zipForm: FormGroup;
  housingSearchForm: FormGroup;
  
  // Tab management
  activeTab: 'home' | 'properties' | 'messages' | 'profile' = 'home';
  mobileMenuOpen = false;
  
  // Housing search properties
  housingResults: HousingListing[] = [];
  featuredListings: HousingListing[] = [];
  isSearchingHousing = false;
  hasSearchedHousing = false;
  
  // Legacy properties for roommate search
  matches: any[] = [];
  isSearching = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private housingService: HousingService,
    private router: Router
  ) {
    // Legacy roommate search form
    this.zipForm = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });

    // New housing search form
    this.housingSearchForm = this.fb.group({
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
    this.loadCurrentUser();
    this.loadFeaturedListings();
  }

  private loadCurrentUser(): void {
    // Get user from localStorage first
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        console.log('User loaded from localStorage:', this.currentUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Also try from AuthService
    if (this.authService.currentUser$) {
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.currentUser = user;
            console.log('User loaded from AuthService:', this.currentUser);
          }
        },
        error: (error) => {
          console.error('Error getting user from AuthService:', error);
        }
      });
    }

    // Try to get fresh user data from backend (will work when backend is ready)
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        if (user) {
          this.currentUser = user;
          console.log('Fresh user data loaded:', user);
        }
      },
      error: (error) => {
        console.log('Backend not ready yet for fresh user data:', error);
      }
    });
  }

  private loadFeaturedListings(): void {
    this.housingService.getFeaturedListings().subscribe({
      next: (listings) => {
        this.featuredListings = listings;
      },
      error: (error) => {
        console.error('Error loading featured listings:', error);
      }
    });
  }

  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Housing search methods
  searchHousing(): void {
    this.isSearchingHousing = true;
    this.hasSearchedHousing = true;

    const formValue = this.housingSearchForm.value;
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
        this.housingResults = results;
        this.isSearchingHousing = false;
      },
      error: (error) => {
        console.error('Housing search error:', error);
        this.isSearchingHousing = false;
      }
    });
  }

  onSortChange(event: any): void {
    const [sortBy, sortOrder] = event.target.value.split('-');
    const currentFilters = this.getCurrentHousingFilters();
    currentFilters.sortBy = sortBy as any;
    currentFilters.sortOrder = sortOrder as any;

    this.housingService.searchHousing(currentFilters).subscribe({
      next: (results) => {
        this.housingResults = results;
      }
    });
  }

  clearHousingFilters(): void {
    this.housingSearchForm.reset();
    this.housingResults = [];
    this.hasSearchedHousing = false;
  }

  private getCurrentHousingFilters(): Partial<SearchFilters> {
    const formValue = this.housingSearchForm.value;
    return {
      zipCode: formValue.zipCode,
      maxPrice: formValue.maxPrice ? parseInt(formValue.maxPrice) : undefined,
      bedrooms: formValue.bedrooms ? [parseInt(formValue.bedrooms)] : undefined,
      petFriendly: formValue.petFriendly || undefined,
      furnished: formValue.furnished || undefined,
      amenities: []
    };
  }

  // Legacy roommate search methods (keeping for backward compatibility)
  searchRoommates(): void {
    if (this.zipForm.valid) {
      this.isSearching = true;
      this.errorMessage = '';
      this.hasSearched = true;

      const zipCode = this.zipForm.get('zipCode')?.value;
      console.log('Searching for roommates in ZIP:', zipCode);
      
      // Simulate search
      setTimeout(() => {
        this.matches = [];
        this.isSearching = false;
        this.errorMessage = 'Roommate search functionality will be added in future updates.';
      }, 1000);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}