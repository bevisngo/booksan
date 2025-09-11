# Direct API Migration

This document outlines the changes made to remove the Next.js API layer and call the backend API directly.

## Changes Made

### 1. API Client Updates (`src/lib/api.ts`)
- **Changed base URL**: Now points directly to the backend API (`NEXT_PUBLIC_API_URL` or `http://localhost:3000/v1`)
- **Added token management**: Client-side cookie reading for authentication tokens
- **Added token refresh**: Automatic token refresh on 401 errors
- **Updated file uploads**: Direct backend uploads with authentication

### 2. Authentication Updates
- **Client-side auth service** (`src/lib/auth-client.ts`): Updated to call backend directly
- **Protected route wrapper** (`src/components/auth/protected-route.tsx`): New client-side route protection
- **Removed server-side dependencies**: Pages no longer use `authServiceServer`

### 3. Page Conversions
All protected pages converted from server-side to client-side:
- `src/app/venues/page.tsx`
- `src/app/courts/page.tsx` 
- `src/app/bookings/page.tsx`
- `src/app/settings/payments/page.tsx`
- `src/app/venues/[id]/courts/page.tsx`

### 4. Middleware Simplification
- **Reduced middleware scope**: Only handles root redirect
- **Client-side auth handling**: Authentication checks moved to `ProtectedRoute` component

### 5. API Routes Removed
All Next.js API routes deleted:
- `/api/[...path]/route.ts` - General API proxy
- `/api/auth/owner/login/route.ts` - Login endpoint
- `/api/auth/logout/route.ts` - Logout endpoint
- `/api/auth/me/route.ts` - Current user endpoint
- `/api/auth/refresh/route.ts` - Token refresh endpoint
- `/api/upload/[...path]/route.ts` - File upload proxy

### 6. API Method Updates
- **Court API**: Already using `apiClient` - no changes needed
- **Venue API**: Already using `apiClient` - no changes needed  
- **Booking API**: Updated CSV export method to use direct API calls
- **Payment API**: Already using `apiClient` - no changes needed

## Environment Variables

Ensure the following environment variable is set:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
```

This should point to your backend API server. The default is now set to port 8000 to match the backend configuration.

## CORS Configuration

The backend CORS is configured to allow specific origins with credentials:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:8082',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
});
```

## Authentication Flow

1. **Login**: Client calls backend `/auth/owner/login` directly
2. **Token Storage**: Backend sets HTTP-only cookies automatically
3. **API Calls**: Client reads access token from cookies and adds to Authorization header
4. **Token Refresh**: On 401 errors, client automatically calls `/auth/refresh`
5. **Logout**: Client calls backend `/auth/logout` directly

## Benefits

- **Reduced latency**: Eliminates Next.js proxy layer
- **Simplified architecture**: Direct backend communication
- **Better performance**: Fewer network hops
- **Cleaner codebase**: Removed unnecessary API routes

## SSR Preservation

As requested, infinite scroll functionality can still use SSR when needed. Current implementation uses regular pagination, but SSR can be easily added for specific components that require server-side rendering for SEO or performance reasons.

## Testing

To test the changes:
1. Start the backend server
2. Start the frontend with `npm run dev`
3. Login and verify all functionality works
4. Check browser network tab to confirm direct API calls to backend
5. Verify token refresh works on expired tokens

## Migration Notes

- All existing API interfaces remain the same
- No frontend component logic changes required
- Authentication flow preserved with improved performance
- Error handling enhanced with automatic token refresh
