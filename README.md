# HomeMate - Roommate Matching Application

A modern roommate-matching application built with Angular frontend and .NET Core backend.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- MongoDB (or use Docker)

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <your-repo>
cd homemate
npm run setup
```

2. **Start with Docker (Recommended):**
```bash
docker-compose up -d
```

3. **Or start manually:**
```bash
# Terminal 1 - Start MongoDB (if not using Docker)
mongod

# Terminal 2 - Start Backend
cd backend
dotnet run

# Terminal 3 - Start Frontend
npm run dev
```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run backend` - Start backend API
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run setup` - Install all dependencies

## 🏗️ Architecture

### Frontend (Angular + Vite)
- **Port:** 4200
- **Framework:** Angular 17 with standalone components
- **Styling:** Tailwind CSS
- **Build Tool:** Vite for faster development

### Backend (.NET Core)
- **Port:** 5000
- **Framework:** .NET 8 Web API
- **Database:** MongoDB
- **Authentication:** JWT Bearer tokens

### Database (MongoDB)
- **Port:** 27017
- **Collections:** users, housingListings, roommate_profiles, matches

## 🔧 Configuration

### Environment Variables

**Frontend (.env.development):**
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=HomeMate
```

**Backend (appsettings.Development.json):**
```json
{
  "ConnectionStrings": {
    "MongoDb": "mongodb://localhost:27017/homemate_dev"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key",
    "ExpirationHours": 24
  }
}
```

## 📁 Project Structure

```
homemate/
├── src/                    # Angular frontend
│   ├── app/
│   │   ├── components/     # UI components
│   │   ├── services/       # API services
│   │   └── models/         # TypeScript interfaces
│   └── environments/       # Environment configs
├── backend/                # .NET Core API
│   ├── Controllers/        # API controllers
│   ├── Services/          # Business logic
│   ├── Models/            # Data models
│   └── Data/              # Database context
├── scripts/               # Database scripts
└── docker-compose.yml     # Container orchestration
```

## 🐳 Docker Development

The project includes Docker configuration for easy development:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔑 Key Features

- **Smart Matching:** Algorithm-based roommate compatibility
- **Housing Search:** Filter apartments by location, price, amenities
- **Real-time Chat:** Messaging between matched users
- **Profile Management:** Detailed user preferences
- **Secure Authentication:** JWT-based auth system

## 🛠️ Development Tips

1. **Hot Reload:** Both frontend and backend support hot reload
2. **API Testing:** Swagger UI available at `http://localhost:5000/swagger`
3. **Database GUI:** Use MongoDB Compass to view data
4. **Debugging:** VS Code launch configurations included

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/housing/search` - Search apartments
- `GET /api/match/potential/{userId}` - Get potential matches
- `POST /api/match/swipe/{userId}` - Swipe on profiles

## 🚀 Deployment

### Production Build
```bash
npm run build
cd backend && dotnet publish -c Release
```

### Environment Setup
1. Update production environment files
2. Configure production MongoDB connection
3. Set secure JWT secret keys
4. Configure CORS for production domains

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.