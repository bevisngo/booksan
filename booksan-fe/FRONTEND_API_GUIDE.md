# 🚀 Booksan Backend API Guide for Frontend

## 📋 Table of Contents
- [Overview](#overview)
- [Base Configuration](#base-configuration)
- [Authentication APIs](#authentication-apis)
- [Venue Search APIs](#venue-search-apis)
- [Error Handling](#error-handling)
- [Frontend Implementation Examples](#frontend-implementation-examples)
- [Environment Setup](#environment-setup)

---

## 🎯 Overview

This guide provides comprehensive documentation for frontend developers to integrate with the Booksan backend API. The backend is built with NestJS, PostgreSQL, and Elasticsearch, providing robust authentication and venue search capabilities.

### Key Features
- ✅ JWT-based authentication with refresh tokens
- ✅ Multiple OAuth providers (Google, Facebook, Zalo)
- ✅ Advanced venue search with Elasticsearch
- ✅ Distance-based sorting
- ✅ Clean, RESTful API design

---

## ⚙️ Base Configuration

### Base URL
```
Development: http://localhost:3000/v1
Production: https://api.booksan.com/v1
```

### API Version
All endpoints are prefixed with `/v1`

### Content Type
```
Content-Type: application/json
```

### Authentication Header
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication APIs

### 1. User Registration
**POST** `/auth/signup`

Register a new user account with email or phone.

```typescript
interface SignupRequest {
  fullname: string;           // Required, min 2 chars
  email?: string;            // Optional if phone provided
  phone?: string;            // Optional if email provided, min 10 chars
  password: string;          // Required, min 6 chars
  passwordConfirm?: string;  // Optional, min 6 chars
}

interface SignupResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      fullname: string;
      email: string | null;
      phone: string | null;
      role: 'USER' | 'ADMIN' | 'OWNER';
    };
  };
}
```

**Example Request:**
```javascript
const response = await fetch('/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullname: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    passwordConfirm: 'password123'
  })
});
```

### 2. User Login
**POST** `/auth/login`

Authenticate user with email/phone and password.

```typescript
interface LoginRequest {
  email?: string;    // Optional if phone provided
  phone?: string;    // Optional if email provided
  password: string;  // Required, min 6 chars
}

interface LoginResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      fullname: string;
      email: string | null;
      phone: string | null;
      role: 'USER' | 'ADMIN' | 'OWNER';
    };
  };
}
```

### 3. Token Refresh
**POST** `/auth/refresh`

Get new access token using refresh token.

```typescript
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  data: {
    accessToken: string;
  };
}
```

### 4. Get Current User
**GET** `/auth/me`

Get current authenticated user profile.

```typescript
interface UserProfile {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN' | 'OWNER';
  createdAt: string;
  updatedAt: string;
}

interface MeResponse {
  data: UserProfile;
}
```

### 5. User Logout
**POST** `/auth/logout`

Logout user (client-side token removal).

**Headers Required:**
```
Authorization: Bearer <access_token>
```

---

## 🌐 OAuth Provider APIs

### Google OAuth
```javascript
// 1. Get OAuth URL
const getGoogleAuthUrl = async () => {
  const response = await fetch('/v1/auth/google');
  return response.json(); // { data: { url: "https://accounts.google.com/..." } }
};

// 2. Handle callback
const handleGoogleCallback = async (code) => {
  const response = await fetch(`/v1/auth/google/callback?code=${code}`);
  return response.json(); // Returns AuthResponse
};
```

### Facebook OAuth
```javascript
// 1. Get OAuth URL
const getFacebookAuthUrl = async () => {
  const response = await fetch('/v1/auth/facebook');
  return response.json(); // { data: { url: "https://www.facebook.com/..." } }
};

// 2. Handle callback
const handleFacebookCallback = async (code) => {
  const response = await fetch(`/v1/auth/facebook/callback?code=${code}`);
  return response.json(); // Returns AuthResponse
};
```

### Zalo OAuth
```javascript
// 1. Get OAuth URL
const getZaloAuthUrl = async () => {
  const response = await fetch('/v1/auth/zalo');
  return response.json(); // { data: { url: "https://oauth.zaloapp.com/..." } }
};

// 2. Login with Zalo token
const loginWithZalo = async (accessToken) => {
  const response = await fetch('/v1/auth/zalo/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken })
  });
  return response.json(); // Returns AuthResponse
};
```

---

## 🏢 Venue Search APIs

### Search Venues
**GET** `/venues/search`

Search venues with advanced filtering and sorting options.

```typescript
interface SearchVenuesRequest {
  query?: string;           // Search keyword
  latitude?: number;        // User's latitude for distance sorting
  longitude?: number;       // User's longitude for distance sorting
  radius?: number;          // Search radius in kilometers (default: 50)
  sortBy?: 'relevance' | 'distance' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;            // Page number (default: 1)
  limit?: number;           // Items per page (default: 20, max: 100)
  minPrice?: number;        // Minimum price filter
  maxPrice?: number;        // Maximum price filter
  amenities?: string[];     // Array of amenity IDs
  facilityTypes?: string[]; // Array of facility type IDs
  isActive?: boolean;       // Filter by active status
}

interface VenueSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance?: number;        // Distance in km (if coordinates provided)
  price: number;
  rating: number;
  imageUrl?: string;
  amenities: string[];
  facilityTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SearchVenuesResponse {
  venues: VenueSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

**Example Search Request:**
```javascript
const searchVenues = async (searchParams) => {
  const queryString = new URLSearchParams(searchParams).toString();
  const response = await fetch(`/v1/venues/search?${queryString}`);
  return response.json();
};

// Usage examples:
// Basic search
await searchVenues({ query: 'basketball court' });

// Location-based search
await searchVenues({ 
  query: 'tennis',
  latitude: 10.762622,
  longitude: 106.660172,
  radius: 10,
  sortBy: 'distance'
});

// Filtered search
await searchVenues({
  query: 'gym',
  minPrice: 100000,
  maxPrice: 500000,
  amenities: ['wifi', 'parking'],
  facilityTypes: ['fitness_center']
});
```

### Get Venue by ID
**GET** `/venues/{id}`

Get detailed information about a specific venue.

```typescript
interface VenueDetailResponse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  price: number;
  rating: number;
  imageUrl?: string;
  amenities: string[];
  facilityTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🚨 Error Handling

### Standard Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  statusCode: number;
}
```

### Common HTTP Status Codes
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success with no response body
- `400 Bad Request`: Validation errors or invalid input
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., email already registered)
- `422 Unprocessable Entity`: Validation failed
- `500 Internal Server Error`: Server error

### Error Handling Example
```javascript
const handleApiError = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    
    switch (response.status) {
      case 400:
        // Validation errors
        console.error('Validation Error:', error.message);
        break;
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        break;
      case 409:
        // Conflict - show specific message
        console.error('Conflict:', error.message);
        break;
      case 500:
        // Server error
        console.error('Server Error:', error.message);
        break;
      default:
        console.error('Unknown Error:', error.message);
    }
    
    throw error;
  }
  
  return response.json();
};
```

---

## 💻 Frontend Implementation Examples

### Authentication Service
```javascript
class AuthService {
  constructor(baseUrl = 'http://localhost:3000/v1') {
    this.baseUrl = baseUrl;
  }

  // Token management
  getAccessToken() {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  setTokens(accessToken, refreshToken) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  // API request helper
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAccessToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request
        config.headers.Authorization = `Bearer ${this.getAccessToken()}`;
        return fetch(url, config);
      }
    }
    
    return response;
  }

  // Authentication methods
  async signup(userData) {
    const response = await this.apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }
    return data;
  }

  async login(credentials) {
    const response = await this.apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }
    return data;
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data.accessToken, refreshToken);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      this.clearTokens();
      return false;
    }
  }

  async getCurrentUser() {
    const response = await this.apiRequest('/auth/me');
    return response.json();
  }

  async logout() {
    await this.apiRequest('/auth/logout', { method: 'POST' });
    this.clearTokens();
  }

  // OAuth methods
  async getGoogleAuthUrl() {
    const response = await this.apiRequest('/auth/google');
    return response.json();
  }

  async handleGoogleCallback(code) {
    const response = await this.apiRequest(`/auth/google/callback?code=${code}`);
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    }
    return data;
  }
}

// Usage
const authService = new AuthService();

// Register
const signupData = {
  fullname: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
};
const signupResult = await authService.signup(signupData);

// Login
const loginData = {
  email: 'john@example.com',
  password: 'password123'
};
const loginResult = await authService.login(loginData);

// Get current user
const currentUser = await authService.getCurrentUser();
```

### Venue Search Service
```javascript
class VenueService {
  constructor(baseUrl = 'http://localhost:3000/v1') {
    this.baseUrl = baseUrl;
  }

  async searchVenues(searchParams = {}) {
    const queryString = new URLSearchParams(
      Object.entries(searchParams).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            acc[key] = value.join(',');
          } else {
            acc[key] = value.toString();
          }
        }
        return acc;
      }, {})
    ).toString();

    const response = await fetch(`${this.baseUrl}/venues/search?${queryString}`);
    return response.json();
  }

  async getVenueById(venueId) {
    const response = await fetch(`${this.baseUrl}/venues/${venueId}`);
    return response.json();
  }
}

// Usage
const venueService = new VenueService();

// Basic search
const basicSearch = await venueService.searchVenues({
  query: 'basketball court'
});

// Advanced search with location
const advancedSearch = await venueService.searchVenues({
  query: 'tennis',
  latitude: 10.762622,
  longitude: 106.660172,
  radius: 10,
  sortBy: 'distance',
  minPrice: 100000,
  maxPrice: 500000,
  amenities: ['wifi', 'parking']
});

// Get specific venue
const venue = await venueService.getVenueById('venue_id_123');
```

---

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Backend URL
REACT_APP_API_URL=http://localhost:3000/v1

# OAuth Client IDs (if using OAuth)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
REACT_APP_ZALO_APP_ID=your_zalo_app_id
```

### CORS Configuration
The backend is configured to accept requests from:
- `http://localhost:3000` (development)
- `http://localhost:3001` (alternative dev port)
- Your production domain

### Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- Search endpoints: 100 requests per minute per IP
- Other endpoints: 1000 requests per minute per IP

---

## 📱 Mobile App Considerations

### Token Storage
- **React Native**: Use `@react-native-async-storage/async-storage`
- **Flutter**: Use `shared_preferences`
- **Ionic**: Use `@ionic/storage`

### Network Configuration
```javascript
// React Native example
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/v1'
  : 'https://api.booksan.com/v1';

// Handle network errors
const handleNetworkError = (error) => {
  if (error.message === 'Network request failed') {
    // Handle offline scenario
    return { error: 'No internet connection' };
  }
  throw error;
};
```

---

## 🚀 Getting Started Checklist

### For Frontend Developers:

1. **Setup Environment**
   - [ ] Configure API base URL
   - [ ] Set up OAuth client IDs (if using OAuth)
   - [ ] Configure CORS settings

2. **Implement Authentication**
   - [ ] Create AuthService class
   - [ ] Implement login/signup forms
   - [ ] Add token management
   - [ ] Handle token refresh
   - [ ] Implement logout functionality

3. **Implement OAuth (Optional)**
   - [ ] Set up Google OAuth
   - [ ] Set up Facebook OAuth
   - [ ] Set up Zalo OAuth
   - [ ] Handle OAuth callbacks

4. **Implement Venue Search**
   - [ ] Create VenueService class
   - [ ] Implement search functionality
   - [ ] Add location-based search
   - [ ] Implement filtering and sorting
   - [ ] Add pagination

5. **Error Handling**
   - [ ] Implement global error handler
   - [ ] Handle authentication errors
   - [ ] Handle network errors
   - [ ] Add user-friendly error messages

6. **Testing**
   - [ ] Test all authentication flows
   - [ ] Test venue search functionality
   - [ ] Test error scenarios
   - [ ] Test OAuth flows

---

## 📞 Support

For technical support or questions about the API:

- **Backend Team**: Contact the backend development team
- **API Documentation**: This guide and inline code comments
- **Issue Tracking**: Use your project's issue tracking system

---

## 🔄 API Updates

This API is versioned and backward compatible. When new features are added:

1. New endpoints will be added without breaking existing ones
2. New optional fields will be added to existing endpoints
3. Breaking changes will be communicated in advance
4. Version updates will be documented in release notes

---

**Happy Coding! 🎉**

*Last updated: January 2024*
