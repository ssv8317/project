export interface HousingListing {
  id: string;
  title: string;
  address: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  images: string[];
  amenities: string[];
  description: string;
  availableDate: Date;
  petFriendly: boolean;
  furnished: boolean;
  utilities: string[];
  landlord: {
    name: string;
    phone: string;
    email: string;
    rating: number;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  featured: boolean;
  createdAt: Date;
}

export interface SearchFilters {
  zipCode: string;
  minPrice: number;
  maxPrice: number;
  bedrooms: number[];
  bathrooms: number;
  petFriendly?: boolean;
  furnished?: boolean;
  amenities: string[];
  sortBy: 'price' | 'date' | 'bedrooms' | 'rating';
  sortOrder: 'asc' | 'desc';
}