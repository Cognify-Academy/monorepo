# Compass-TS API Integration

This document outlines the integration of the compass-ts Next.js application with the Cognify Academy API.

## What's Been Integrated

### 🔐 Authentication System

- **API Client**: Created a complete API client (`src/lib/api.ts`) for communicating with your backend API
- **Auth Context**: Added React context for managing authentication state (`src/contexts/auth.tsx`)
- **Login Page**: Updated login page to work with API endpoints
- **Signup Page**: Created new signup page with form validation
- **Navbar**: Added authentication controls with login/logout functionality

### 📚 Course Management

- **Course Service**: Created course service (`src/services/courses.ts`) to replace static data
- **Course Listing**: Updated homepage to display courses from API
- **Course Details**: Created course detail pages with enrollment functionality
- **Course Cards**: Added course card components for grid display
- **Enrollment**: Integrated course enrollment with API

### 🎯 Key Features Added

- JWT token management with refresh token support
- Role-based access control
- Course enrollment workflow
- Responsive design for mobile and desktop
- Error handling and loading states
- Environment configuration support

## API Endpoints Used

- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/courses` - List all published courses
- `GET /api/v1/courses/:identifier` - Get course details
- `POST /api/v1/courses/:identifier/students` - Enroll in course

## Setup Instructions

1. **Environment Configuration**

   ```bash
   cd apps/compass-ts
   cp .env.example .env.local
   ```

   Update the API URL if needed:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3333/api/v1
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the API Server**

   ```bash
   cd ../api
   bun run dev  # Should start on port 3000
   ```

4. **Start the Frontend**
   ```bash
   cd ../compass-ts
   npm run dev      # Should start on port 3001
   ```

## File Structure Changes

### New Files Created

```
src/
├── lib/
│   └── api.ts                    # API client
├── contexts/
│   └── auth.tsx                  # Authentication context
├── services/
│   └── courses.ts                # Course data service
├── components/
│   ├── course-card.tsx           # Course display component
│   └── enrollment-button.tsx     # Course enrollment component
└── app/
    ├── (auth)/
    │   └── signup/
    │       └── page.tsx           # New signup page
    └── (sidebar)/
        └── courses/
            └── [slug]/
                └── page.tsx       # Course detail page
```

### Modified Files

- `src/app/layout.tsx` - Added AuthProvider
- `src/app/(auth)/login/page.tsx` - Updated for API integration
- `src/app/(sidebar)/page.tsx` - Updated to show courses from API
- `src/components/navbar.tsx` - Added authentication controls

## Next Steps

1. **Test the Integration**
   - Create a test user via signup
   - Login and browse courses
   - Try enrolling in a course

2. **Additional Features to Consider**
   - User dashboard showing enrolled courses
   - Course progress tracking
   - Search and filtering functionality
   - Course reviews and ratings
   - Instructor profiles

3. **API Enhancements Needed**
   - User profile endpoints
   - Course progress tracking
   - User enrollment status checking
   - Course search and filtering

## Troubleshooting

### Common Issues

1. **CORS Errors**: Make sure your API has CORS configured for the frontend URL
2. **Auth Errors**: Check that JWT tokens are being set correctly in cookies
3. **API Connection**: Verify the API_URL in environment variables
4. **Build Errors**: Make sure all dependencies are installed

### Debug Tips

- Check browser dev tools network tab for API calls
- Console logs are included in auth context for debugging
- API errors are displayed in the UI for user feedback

## Authentication Flow

1. User enters credentials on login/signup page
2. Frontend calls API endpoint
3. API returns JWT access token and sets refresh token in httpOnly cookie
4. Frontend stores access token in context state
5. Subsequent API calls include Authorization header with access token
6. Refresh token is used automatically for token renewal

This integration transforms the static compass-ts template into a fully functional course platform integrated with your backend API!
