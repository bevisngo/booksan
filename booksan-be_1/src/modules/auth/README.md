# Auth Module

A lightweight and fast authentication module for the Booksan backend application.

## Features

1. **Email + Password Authentication**
   - Signup with email and password
   - Login with email and password

2. **Phone + Password Authentication**
   - Signup with phone number and password
   - Login with phone number and password

3. **OAuth Authentication**
   - Google OAuth login
   - Facebook OAuth login
   - Zalo OAuth login

4. **Token Management**
   - JWT access tokens (15 minutes)
   - Refresh tokens (7 days)
   - Token refresh endpoint

5. **User Management**
   - Get current user info (/me)
   - Logout functionality
   - Password hashing with bcrypt

## Architecture

### Controllers (Thin Layer)
- **AuthController**: Handles HTTP requests, validates DTOs, calls use cases

### Use Cases (Business Logic)
- **SignupUseCase**: User registration logic
- **LoginUseCase**: User authentication logic
- **OAuthLoginUseCase**: OAuth authentication flow
- **RefreshTokenUseCase**: Token refresh logic
- **GetCurrentUserUseCase**: Get user profile logic

### Services (Technical Utilities)
- **JwtService**: JWT token generation and verification
- **HashService**: Password hashing and comparison
- **OAuthService**: OAuth provider integrations

### Repository (Data Access)
- **AuthRepository**: User data operations with Prisma

### Guards & Decorators
- **JwtAuthGuard**: JWT authentication guard
- **RolesGuard**: Role-based authorization guard
- **@Public()**: Mark endpoints as public (no auth required)
- **@Roles()**: Require specific user roles
- **@CurrentUser()**: Inject current user into endpoint

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### OAuth
- `GET /auth/google` - Get Google OAuth URL
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/facebook` - Get Facebook OAuth URL
- `GET /auth/facebook/callback` - Facebook OAuth callback
- `GET /auth/zalo` - Get Zalo OAuth URL
- `POST /auth/zalo/login` - Zalo OAuth login (direct token)

## Environment Variables

```env
# JWT Configuration
JWT_SECRET="your-very-long-and-secure-jwt-secret-key-here-min-32-chars"
JWT_REFRESH_SECRET="your-very-long-and-secure-refresh-secret-key-here-min-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Application URL
APP_URL="http://localhost:3000"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
ZALO_APP_ID="your-zalo-app-id"
ZALO_APP_SECRET="your-zalo-app-secret"
```

## Usage Examples

### Protected Endpoint
```typescript
@Controller('protected')
export class ProtectedController {
  @Get('user-only')
  getUserData(@CurrentUser() user: UserProfile) {
    return { message: `Hello ${user.fullname}` };
  }

  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  getAdminData(@CurrentUser() user: UserProfile) {
    return { message: 'Admin area' };
  }
}
```

### Public Endpoint
```typescript
@Controller('public')
export class PublicController {
  @Public()
  @Get('info')
  getPublicInfo() {
    return { message: 'This is public' };
  }
}
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiration
- Separate refresh token secret
- Role-based access control
- Input validation with class-validator
- SQL injection protection via Prisma

## Database Schema

The auth module uses the User model with the following fields:
- `id`: Unique identifier
- `fullname`: User's full name
- `email`: User's email (required, unique)
- `phone`: User's phone number (optional)
- `password`: Hashed password
- `role`: User role (PLAYER, OWNER, MANAGER, STAFF, ADMIN)
- `oauthProvider`: OAuth provider used (optional)
- `oauthId`: OAuth provider user ID (optional)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp
