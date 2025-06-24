import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatchService } from '../../services/match.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { RoommateProfile } from '../../models/match.model';

@Component({
  selector: 'app-profile-setup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Complete Your Roommate Profile</h1>
          <p class="text-lg text-gray-600">Help us find your perfect roommate match!</p>
          <div class="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-blue-800 text-sm">
              <span class="font-medium">Almost there!</span> Complete your profile to start discovering compatible roommates.
            </p>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="mb-8">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>Profile Completion</span>
            <span>{{ getCompletionPercentage() }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-primary-500 h-2 rounded-full transition-all duration-300"
              [style.width.%]="getCompletionPercentage()"
            ></div>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-8">
            
            <!-- Basic Information -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    formControlName="displayName"
                    class="form-input"
                    placeholder="How should others see your name?"
                  >
                  <div *ngIf="profileForm.get('displayName')?.invalid && profileForm.get('displayName')?.touched" class="form-error">
                    Display name is required
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    formControlName="age"
                    class="form-input"
                    min="18"
                    max="100"
                  >
                  <div *ngIf="profileForm.get('age')?.invalid && profileForm.get('age')?.touched" class="form-error">
                    Please enter a valid age (18-100)
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    formControlName="bio"
                    rows="4"
                    class="form-textarea"
                    placeholder="Tell potential roommates about yourself, your hobbies, and what you're looking for in a living situation..."
                  ></textarea>
                  <div *ngIf="profileForm.get('bio')?.invalid && profileForm.get('bio')?.touched" class="form-error">
                    Please write a brief bio about yourself
                  </div>
                </div>
              </div>
            </div>

            <!-- Budget & Location -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Budget & Location</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Minimum Budget</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      formControlName="budgetMin"
                      class="form-input pl-8"
                      placeholder="500"
                      min="0"
                    >
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Maximum Budget</label>
                  <div class="relative">
                    <span class="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      formControlName="budgetMax"
                      class="form-input pl-8"
                      placeholder="1500"
                      min="0"
                    >
                  </div>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
                  <div class="space-y-2">
                    <div formArrayName="preferredLocations">
                      <div *ngFor="let location of preferredLocationsArray.controls; let i = index" class="flex gap-2">
                        <input
                          type="text"
                          [formControlName]="i"
                          class="form-input flex-1"
                          placeholder="e.g., Downtown, Near Campus, Midtown"
                        >
                        <button
                          type="button"
                          (click)="removeLocation(i)"
                          class="px-3 py-2 text-red-600 hover:text-red-800"
                          [disabled]="preferredLocationsArray.length <= 1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      (click)="addLocation()"
                      class="text-primary-500 hover:text-primary-600 text-sm font-medium"
                    >
                      + Add Another Location
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lifestyle Preferences -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Lifestyle Preferences</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Sleep Schedule</label>
                  <select formControlName="sleepSchedule" class="form-select">
                    <option value="">Select your schedule</option>
                    <option value="EarlyBird">Early Bird (sleep early, wake early)</option>
                    <option value="NightOwl">Night Owl (sleep late, wake late)</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cleanliness Level</label>
                  <select formControlName="cleanlinessLevel" class="form-select">
                    <option value="">Select level</option>
                    <option value="Low">Relaxed about cleanliness</option>
                    <option value="Medium">Moderately clean</option>
                    <option value="High">Very clean and organized</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Smoking Preference</label>
                  <select formControlName="smokingPreference" class="form-select">
                    <option value="">Select preference</option>
                    <option value="NonSmoker">Non-smoker</option>
                    <option value="Occasional">Occasional smoker</option>
                    <option value="Smoker">Regular smoker</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pet Friendly</label>
                  <select formControlName="petFriendly" class="form-select">
                    <option value="">Select preference</option>
                    <option value="true">Yes, I love pets!</option>
                    <option value="false">No pets please</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Interests -->
            <div class="border-b border-gray-200 pb-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Interests & Hobbies</h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Select your interests (choose multiple)</label>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <label *ngFor="let interest of availableInterests" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        [value]="interest"
                        (change)="onInterestChange($event)"
                        class="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      >
                      <span class="text-sm text-gray-700">{{ interest }}</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Lifestyle Tags</label>
                  <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <label *ngFor="let lifestyle of availableLifestyles" class="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        [value]="lifestyle"
                        (change)="onLifestyleChange($event)"
                        class="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                      >
                      <span class="text-sm text-gray-700">{{ lifestyle }}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Deal Breakers -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Deal Breakers</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">What are absolute no-gos for you?</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <label *ngFor="let dealBreaker of availableDealBreakers" class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      [value]="dealBreaker"
                      (change)="onDealBreakerChange($event)"
                      class="rounded border-gray-300 text-red-500 focus:ring-red-500"
                    >
                    <span class="text-sm text-gray-700">{{ dealBreaker }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 rounded-lg p-4">
              <p class="text-red-600 text-sm">{{ errorMessage }}</p>
            </div>

            <!-- Success Message -->
            <div *ngIf="successMessage" class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-green-600 text-sm">{{ successMessage }}</p>
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end space-x-4">
              <button
                type="button"
                (click)="saveDraft()"
                class="btn-secondary"
                [disabled]="isLoading"
              >
                Save Draft
              </button>
              <button
                type="submit"
                [disabled]="profileForm.invalid || isLoading"
                class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span *ngIf="isLoading">Creating Profile...</span>
                <span *ngIf="!isLoading">Complete Profile & Start Matching</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileSetupComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  availableInterests = [
    'Reading', 'Gaming', 'Cooking', 'Fitness', 'Music', 'Movies',
    'Travel', 'Photography', 'Art', 'Sports', 'Technology', 'Fashion',
    'Yoga', 'Dancing', 'Hiking', 'Cycling', 'Swimming', 'Running'
  ];

  availableLifestyles = [
    'Social Butterfly', 'Homebody', 'Party Lover', 'Quiet Person',
    'Early Riser', 'Night Owl', 'Workaholic', 'Student', 'Professional',
    'Minimalist', 'Organized', 'Laid Back', 'Health Conscious'
  ];

  availableDealBreakers = [
    'Smoking Indoors', 'Loud Music Late', 'Messy Common Areas',
    'Overnight Guests Often', 'Pets', 'Parties at Home',
    'Strong Cooking Smells', 'Different Sleep Schedules'
  ];

  selectedInterests: string[] = [];
  selectedLifestyles: string[] = [];
  selectedDealBreakers: string[] = [];

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      displayName: ['', Validators.required],
      bio: ['', [Validators.required, Validators.minLength(50)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(100)]],
      occupation: [''],
      college: [''],
      budgetMin: ['', [Validators.required, Validators.min(0)]],
      budgetMax: ['', [Validators.required, Validators.min(0)]],
      preferredLocations: this.fb.array([this.fb.control('', Validators.required)]),
      sleepSchedule: ['', Validators.required],
      cleanlinessLevel: ['', Validators.required],
      smokingPreference: ['', Validators.required],
      petFriendly: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  get preferredLocationsArray(): FormArray {
    return this.profileForm.get('preferredLocations') as FormArray;
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.prefillFromUserData(user);
      }
    });
  }

  private prefillFromUserData(user: User): void {
    this.profileForm.patchValue({
      displayName: user.fullName,
      age: user.age,
      occupation: user.occupation,
      college: user.college
    });
  }

  addLocation(): void {
    this.preferredLocationsArray.push(this.fb.control('', Validators.required));
  }

  removeLocation(index: number): void {
    if (this.preferredLocationsArray.length > 1) {
      this.preferredLocationsArray.removeAt(index);
    }
  }

  onInterestChange(event: any): void {
    const interest = event.target.value;
    if (event.target.checked) {
      this.selectedInterests.push(interest);
    } else {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
    }
  }

  onLifestyleChange(event: any): void {
    const lifestyle = event.target.value;
    if (event.target.checked) {
      this.selectedLifestyles.push(lifestyle);
    } else {
      this.selectedLifestyles = this.selectedLifestyles.filter(l => l !== lifestyle);
    }
  }

  onDealBreakerChange(event: any): void {
    const dealBreaker = event.target.value;
    if (event.target.checked) {
      this.selectedDealBreakers.push(dealBreaker);
    } else {
      this.selectedDealBreakers = this.selectedDealBreakers.filter(d => d !== dealBreaker);
    }
  }

  getCompletionPercentage(): number {
    const formValue = this.profileForm.value;
    let completed = 0;
    const total = 8; // Total required sections

    if (formValue.displayName) completed++;
    if (formValue.bio && formValue.bio.length >= 50) completed++;
    if (formValue.age) completed++;
    if (formValue.budgetMin && formValue.budgetMax) completed++;
    if (formValue.preferredLocations && formValue.preferredLocations[0]) completed++;
    if (formValue.sleepSchedule) completed++;
    if (formValue.cleanlinessLevel) completed++;
    if (formValue.smokingPreference) completed++;

    return Math.round((completed / total) * 100);
  }

  saveDraft(): void {
    // Save current form state to localStorage
    const draftData = {
      ...this.profileForm.value,
      interests: this.selectedInterests,
      lifestyle: this.selectedLifestyles,
      dealBreakers: this.selectedDealBreakers
    };
    localStorage.setItem('profileDraft', JSON.stringify(draftData));
    this.successMessage = 'Draft saved successfully!';
    setTimeout(() => this.successMessage = '', 3000);
  }

  onSubmit(): void {
    if (this.profileForm.valid && this.currentUser) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.profileForm.value;
      const profileData: Partial<RoommateProfile> = {
        displayName: formValue.displayName,
        bio: formValue.bio,
        age: formValue.age,
        occupation: formValue.occupation || this.currentUser.occupation,
        college: formValue.college || this.currentUser.college,
        budgetMin: parseInt(formValue.budgetMin),
        budgetMax: parseInt(formValue.budgetMax),
        preferredLocations: formValue.preferredLocations.filter((loc: string) => loc.trim()),
        sleepSchedule: formValue.sleepSchedule,
        cleanlinessLevel: formValue.cleanlinessLevel,
        smokingPreference: formValue.smokingPreference,
        petFriendly: formValue.petFriendly === 'true',
        interests: this.selectedInterests,
        lifestyle: this.selectedLifestyles,
        dealBreakers: this.selectedDealBreakers
      };

      this.matchService.createOrUpdateProfile(this.currentUser.id!, profileData).subscribe({
        next: (profile) => {
          this.isLoading = false;
          this.successMessage = 'Profile created successfully! Redirecting to dashboard...';
          
          // Clear draft
          localStorage.removeItem('profileDraft');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Failed to create profile. Please try again.';
        }
      });
    }
  }
}