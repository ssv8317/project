import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatchService } from '../../services/match.service'; // Add this import
import { User, RoommateMatch } from '../../models/user.model'; // Add RoommateMatch import

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
  matches: RoommateMatch[] = []; // Add this property
  isSearching = false;
  hasSearched = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private matchService: MatchService, // Add this injection
    private router: Router
  ) {
    this.zipForm = this.fb.group({
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
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

  getInitials(fullName?: string): string {
    if (!fullName) return 'U';
    return fullName.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  searchRoommates(): void {
    if (this.zipForm.valid) {
      this.isSearching = true;
      this.errorMessage = '';
      this.hasSearched = true;

      const zipCode = this.zipForm.get('zipCode')?.value;
      console.log('Searching for roommates in ZIP:', zipCode);
      
      // Use MatchService instead of setTimeout
      this.matchService.findMatches(zipCode).subscribe({
        next: (matches) => {
          this.matches = matches;
          this.isSearching = false;
          if (matches.length === 0) {
            this.errorMessage = 'Backend endpoints not implemented yet. Will show real matches once we add backend integration.';
          }
          console.log('Search completed, matches found:', matches.length);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.errorMessage = 'Search service error. Backend endpoints needed.';
          this.isSearching = false;
          this.matches = [];
        }
      });
    } else {
      console.log('Form invalid:', this.zipForm.errors);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}