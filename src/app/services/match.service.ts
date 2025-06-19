import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

// Simple interface for now
export interface RoommateMatch {
  user: any;
  matchPercentage: number;
  sharedPreferences: string[];
}

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  findMatches(zipCode: string): Observable<RoommateMatch[]> {
    // For now, return empty array - we'll implement backend later
    console.log('MatchService: Searching for matches in ZIP:', zipCode);
    return of([]); // Returns empty array for now
  }
}