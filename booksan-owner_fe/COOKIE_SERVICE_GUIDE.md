# Cookie Service Guide

This guide explains the cookie management system implemented in the owner frontend.

## Overview

The cookie service provides a robust way to manage cookies in the client-side application, with special focus on authentication cookies.

## Files

- `src/lib/cookie-service.ts` - Main cookie service implementation
- `src/lib/auth-client.ts` - Updated to use cookie service
- `src/lib/api.ts` - Updated to use cookie service for token retrieval
- `src/hooks/use-auth.ts` - React hook for authentication state management

## CookieService Class

### Basic Cookie Operations

```typescript
import { CookieService } from '@/lib/cookie-service';

// Set a cookie
CookieService.setCookie('myCookie', 'value', {
  expires: 7, // 7 days from now
  path: '/',
  secure: true,
  sameSite: 'lax'
});

// Get a cookie
const value = CookieService.getCookie('myCookie');

// Remove a cookie
CookieService.removeCookie('myCookie');

// Check if cookie exists
const exists = CookieService.hasCookie('myCookie');

// Get all cookies
const allCookies = CookieService.getAllCookies();

// Clear all cookies
CookieService.clearAllCookies();
```

### Cookie Options

```typescript
interface CookieOptions {
  expires?: Date | number; // Date object or days from now
  path?: string;           // Default: '/'
  domain?: string;         // Optional domain
  secure?: boolean;        // Default: true in production
  sameSite?: 'strict' | 'lax' | 'none'; // Default: 'lax'
  httpOnly?: boolean;      // Note: Cannot be set from client-side
}
```

## AuthCookieService Class

Specialized service for authentication-related cookies.

### Authentication Cookie Operations

```typescript
import { AuthCookieService } from '@/lib/cookie-service';

// Set access token (30-day expiration)
AuthCookieService.setAccessToken('your-jwt-token');

// Get access token
const token = AuthCookieService.getAccessToken();

// Check if access token exists
const hasToken = AuthCookieService.hasAccessToken();

// Remove access token
AuthCookieService.removeAccessToken();

// Clear all auth cookies
AuthCookieService.clearAuthCookies();
```

## AuthServiceClient Integration

The auth client now uses the cookie service for better cookie management:

```typescript
import { authServiceClient } from '@/lib/auth-client';

// Login - automatically sets access token cookie
const response = await authServiceClient.login({
  email: 'user@example.com',
  password: 'password'
});

// Check authentication status
const isAuth = authServiceClient.isAuthenticated();

// Get current access token
const token = authServiceClient.getAccessToken();

// Logout - automatically clears auth cookies
await authServiceClient.logout();

// Clear all auth data
authServiceClient.clearAuth();
```

## React Hook Integration

Use the `useAuth` hook for authentication state management:

```typescript
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div>
      <p>Welcome, {user?.fullname}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Protected Route Component

The protected route component now uses the auth hook:

```typescript
import { ProtectedRoute } from '@/components/auth/protected-route';

function App() {
  return (
    <ProtectedRoute requiredRole="OWNER">
      {(user) => (
        <Dashboard user={user} />
      )}
    </ProtectedRoute>
  );
}
```

## Cookie Configuration

### Access Token Cookie Settings

- **Name**: `accessToken`
- **Expiration**: 30 days
- **Path**: `/` (available site-wide)
- **Secure**: `true` in production, `false` in development
- **SameSite**: `lax` (CSRF protection)
- **HttpOnly**: `false` (accessible via JavaScript for client-side auth)

### Security Considerations

1. **Secure Flag**: Automatically set to `true` in production
2. **SameSite**: Set to `lax` to prevent CSRF attacks
3. **Path**: Set to `/` for site-wide access
4. **Expiration**: 30-day expiration for better UX
5. **Encoding**: All cookie values are properly encoded/decoded

## API Integration

The API client automatically includes the access token from cookies:

```typescript
import { apiClient } from '@/lib/api';

// The API client automatically:
// 1. Gets the access token from cookies
// 2. Adds it to the Authorization header
// 3. Handles 401 errors by redirecting to login
const data = await apiClient.get('/protected-endpoint');
```

## Error Handling

### 401 Unauthorized
When a 401 error occurs:
1. Auth cookies are automatically cleared
2. User is redirected to login page
3. No automatic token refresh (as per new design)

### Network Errors
- Network errors don't clear auth cookies
- Only 401 errors trigger logout

## Best Practices

1. **Always use the cookie service** instead of direct `document.cookie` manipulation
2. **Use the auth hook** for authentication state in React components
3. **Use protected routes** for pages that require authentication
4. **Handle loading states** when checking authentication
5. **Clear auth data on logout** to prevent stale tokens

## Migration from Manual Cookie Handling

### Before (Manual)
```typescript
// Manual cookie setting
document.cookie = `accessToken=${token}; path=/`;

// Manual cookie reading
const token = document.cookie
  .split(';')
  .find(c => c.trim().startsWith('accessToken='))
  ?.split('=')[1];
```

### After (Cookie Service)
```typescript
// Using cookie service
AuthCookieService.setAccessToken(token);
const token = AuthCookieService.getAccessToken();
```

## Testing

To test cookie functionality:

1. **Login**: Verify access token is set with correct expiration
2. **API Calls**: Verify token is included in requests
3. **Logout**: Verify cookies are cleared
4. **Expiration**: Test behavior after token expires
5. **Cross-tab**: Verify cookies work across browser tabs

## Troubleshooting

### Common Issues

1. **Cookies not set**: Check if running in browser environment
2. **Token not found**: Verify cookie name and path
3. **CORS issues**: Ensure backend allows credentials
4. **Expired tokens**: Check token expiration and refresh logic

### Debug Tools

```typescript
// Check all cookies
console.log(CookieService.getAllCookies());

// Check auth status
console.log(authServiceClient.isAuthenticated());

// Check current token
console.log(authServiceClient.getAccessToken());
```
