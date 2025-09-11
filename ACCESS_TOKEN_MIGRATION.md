# Access Token Migration - Remove Refresh Tokens

This document outlines the changes made to remove refresh tokens and use only access tokens with 1-month expiration across all three services.

## Overview

- **Backend**: Updated JWT configuration to use only access tokens with 30-day expiration
- **Main Frontend (booksan-fe)**: Removed refresh token logic, simplified auth flow
- **Owner Frontend (booksan-owner_fe)**: Removed refresh token logic, simplified auth flow

## Backend Changes (`booksan-be_1`)

### 1. Configuration Updates
- **`src/config/schema.config.ts`**: Removed `JWT_REFRESH_SECRET` and `JWT_REFRESH_EXPIRES_IN`, updated `JWT_EXPIRES_IN` to `30d`
- **`env.example`**: Removed refresh token configuration, updated JWT expiration to 30 days

### 2. JWT Service Updates
- **`src/modules/auth/services/jwt.service.ts`**:
  - Removed `type` field from `JwtPayload` interface
  - Replaced `generateTokens()` with `generateAccessToken()`
  - Removed `verifyRefreshToken()` method
  - Simplified token generation to only create access tokens

### 3. Auth Module Updates
- **`src/modules/auth/auth.module.ts`**: Removed `RefreshTokenUseCase` from imports and providers
- **`src/modules/auth/use-cases/index.ts`**: Removed refresh token use case export
- **`src/modules/auth/dto/index.ts`**: Removed refresh token DTO export

### 4. Use Case Updates
Updated all authentication use cases to only generate access tokens:
- **`src/modules/auth/use-cases/owner-login.use-case.ts`**
- **`src/modules/auth/use-cases/login.use-case.ts`**
- **`src/modules/auth/use-cases/signup.use-case.ts`**
- **`src/modules/auth/use-cases/oauth-login.use-case.ts`**

### 5. DTO Updates
- **`src/modules/auth/dto/auth-response.dto.ts`**: Removed `refreshToken` field, removed `RefreshResponseDto`

### 6. Controller Updates
- **`src/modules/auth/controllers/auth.controller.ts`**: Removed refresh token endpoint and related imports

### 7. Guard Updates
- **`src/modules/auth/guards/jwt-auth.guard.ts`**: Removed token type validation

### 8. File Deletions
- **`src/modules/auth/use-cases/refresh-token.use-case.ts`**: Deleted
- **`src/modules/auth/dto/refresh-token.dto.ts`**: Deleted

## Main Frontend Changes (`booksan-fe`)

### 1. Auth Service Updates
- **`src/features/auth/service.ts`**:
  - Removed `getRefreshToken()` and `setTokens()` methods
  - Added `setAccessToken()` method
  - Removed `refreshAccessToken()` method
  - Simplified `apiRequest()` to redirect to login on 401 instead of refreshing
  - Updated all auth methods to only store access tokens

### 2. Auth Types Updates
- **`src/features/auth/types.ts`**:
  - Removed `AuthTokens` interface
  - Removed `refreshToken` from `AuthResponse`
  - Removed `RefreshRequest` and `RefreshResponse` interfaces
  - Removed `refreshToken` method from `AuthContextType`

### 3. Auth Context Updates
- **`src/features/auth/context.tsx`**:
  - Removed `refreshToken()` method
  - Updated context value to exclude refresh token method

## Owner Frontend Changes (`booksan-owner_fe`)

### 1. API Client Updates
- **`src/lib/api.ts`**:
  - Removed `refreshToken()` method
  - Simplified 401 error handling to redirect to login instead of refreshing
  - Updated both `request()` and `uploadFile()` methods

### 2. Auth Types Updates
- **`src/lib/auth.ts`**: Removed `refreshToken` from `AuthResponse` interface

### 3. Auth Server Updates
- **`src/lib/auth-server.ts`**:
  - Removed `getRefreshToken()` and `setTokens()` methods
  - Added `setAccessToken()` method with 30-day expiration
  - Removed `refreshAccessToken()` method
  - Updated `getCookieHeader()` to only include access token
  - Updated `clearTokens()` to only clear access token

## Environment Variables

### Backend
```env
JWT_SECRET="your-very-long-and-secure-jwt-secret-key-here-minimum-32-characters"
JWT_EXPIRES_IN="30d"
```

### Frontend
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
```

## Benefits

1. **Simplified Architecture**: Removed complex refresh token logic
2. **Better User Experience**: No automatic token refresh interruptions
3. **Reduced Complexity**: Fewer moving parts in authentication flow
4. **Longer Session Duration**: 30-day tokens reduce login frequency
5. **Cleaner Code**: Removed unused refresh token code

## Migration Notes

- All existing authentication flows remain the same from user perspective
- Tokens now expire after 30 days instead of 15 minutes
- 401 errors now redirect to login instead of attempting refresh
- No breaking changes to API endpoints (except removed `/auth/refresh`)
- All OAuth flows continue to work with access tokens only

## Testing

To test the changes:
1. Start the backend server
2. Start both frontend applications
3. Login and verify authentication works
4. Test token expiration after 30 days
5. Verify 401 errors redirect to login page
6. Test OAuth flows (Google, Facebook, Zalo)

## Security Considerations

- Access tokens are now valid for 30 days
- Consider implementing token blacklisting for logout if needed
- Monitor for any security implications of longer token lifetime
- Ensure proper token storage (HTTP-only cookies for server-side, localStorage for client-side)
