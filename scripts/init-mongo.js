// MongoDB initialization script
db = db.getSiblingDB('homemate');

// Create collections
db.createCollection('users');
db.createCollection('housingListings');
db.createCollection('roommate_profiles');
db.createCollection('matches');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.housingListings.createIndex({ "zipCode": 1 });
db.housingListings.createIndex({ "price": 1 });
db.housingListings.createIndex({ "isFeatured": 1 });
db.roommate_profiles.createIndex({ "userId": 1 }, { unique: true });
db.matches.createIndex({ "userId1": 1, "userId2": 1 });

// Insert sample data
db.housingListings.insertMany([
  {
    title: "Modern Downtown Apartment",
    address: "123 Main St, Downtown",
    zipCode: "12345",
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 850,
    petFriendly: true,
    furnished: false,
    amenities: ["Gym", "Pool", "Parking"],
    images: ["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"],
    description: "Beautiful modern apartment in the heart of downtown",
    datePosted: new Date(),
    isFeatured: true,
    contactInfo: "contact@example.com",
    ownerId: "owner1",
    location: "Downtown",
    createdAt: new Date(),
    landlord: {
      name: "John Smith",
      phone: "555-0123",
      email: "john@example.com",
      rating: 4.5
    }
  },
  {
    title: "Cozy Studio Near Campus",
    address: "456 College Ave, University District",
    zipCode: "12346",
    price: 800,
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: 500,
    petFriendly: false,
    furnished: true,
    amenities: ["WiFi", "Laundry"],
    images: ["https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg"],
    description: "Perfect for students, walking distance to campus",
    datePosted: new Date(),
    isFeatured: true,
    contactInfo: "campus@example.com",
    ownerId: "owner2",
    location: "University District",
    createdAt: new Date(),
    landlord: {
      name: "Sarah Johnson",
      phone: "555-0124",
      email: "sarah@example.com",
      rating: 4.8
    }
  }
]);

print('Database initialized successfully!');