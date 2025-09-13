# Role-Based Guards

This document describes the role-based authentication guards implemented to protect player and owner APIs based on the role in the JWT token payload.

## Guards Overview

### 1. PlayerRoleGuard
- **Purpose**: Ensures only users with `PLAYER` role can access protected endpoints
- **Usage**: Applied to player-specific API endpoints
- **Error**: Throws `ForbiddenException` with message "Access denied. This endpoint is only available for players."

### 2. OwnerRoleGuard  
- **Purpose**: Ensures only users with `OWNER` or `ADMIN` role can access protected endpoints
- **Usage**: Applied to owner-specific API endpoints
- **Error**: Throws `ForbiddenException` with message "Access denied. This endpoint is only available for owners and administrators."

## Implementation Details

### JWT Token Structure
The guards expect the JWT token payload to contain:
```typescript
interface JwtPayload {
  sub: string;           // User ID
  email?: string;        // User email
  role: string;          // User role (PLAYER, OWNER, ADMIN)
  facilityId?: string;   // Optional - only for owners
  phone?: string;        // User phone
}
```

### Request Interface
The guards work with the following request interface:
```typescript
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    facilityId?: string | null;
  };
}
```

## Applied Guards

### Player APIs (Protected by PlayerRoleGuard)
- `POST /player/auth/signup` - Public (no guard)
- `POST /player/auth/login` - Public (no guard)
- `POST /player/auth/logout` - PlayerRoleGuard
- `GET /player/auth/me` - PlayerRoleGuard
- `GET /player/auth/google` - Public (no guard)
- `GET /player/auth/google/callback` - Public (no guard)
- `GET /player/auth/facebook` - Public (no guard)
- `GET /player/auth/facebook/callback` - Public (no guard)
- `GET /player/auth/zalo` - Public (no guard)
- `POST /player/auth/zalo/login` - Public (no guard)
- All `/player/courts/*` endpoints - PlayerRoleGuard

### Owner APIs (Protected by OwnerRoleGuard)
- `POST /owner/auth/signup` - Public (no guard)
- `POST /owner/auth/login` - Public (no guard)
- `POST /owner/auth/logout` - OwnerRoleGuard
- `GET /owner/auth/me` - OwnerRoleGuard
- `GET /owner/auth/google` - Public (no guard)
- `GET /owner/auth/google/callback` - Public (no guard)
- `GET /owner/auth/facebook` - Public (no guard)
- `GET /owner/auth/facebook/callback` - Public (no guard)
- `GET /owner/auth/zalo` - Public (no guard)
- `POST /owner/auth/zalo/login` - Public (no guard)
- All `/owner/courts/*` endpoints - OwnerRoleGuard
- All `/facility-profiles/*` endpoints - OwnerRoleGuard
- All `/facility-templates/*` endpoints - OwnerRoleGuard

### Mixed APIs (Protected by OwnerRoleGuard for write operations)
- `GET /courts` - JwtAuthGuard only (any authenticated user)
- `POST /courts` - OwnerRoleGuard (OWNER/ADMIN only)
- `PUT /courts/:id` - OwnerRoleGuard (OWNER/ADMIN only)
- `DELETE /courts/:id` - OwnerRoleGuard (OWNER/ADMIN only)
- `PUT /courts/:id/activate` - OwnerRoleGuard (OWNER/ADMIN only)
- `PUT /courts/:id/deactivate` - OwnerRoleGuard (OWNER/ADMIN only)
- `GET /courts/:id` - JwtAuthGuard only (any authenticated user)
- `GET /courts/facility/:facilityId` - JwtAuthGuard only (any authenticated user)
- `GET /courts/stats/overview` - JwtAuthGuard only (any authenticated user)

## Security Benefits

1. **Role Isolation**: Players cannot access owner-specific endpoints and vice versa
2. **Token Validation**: All protected endpoints require valid JWT tokens
3. **Role Verification**: Token role is verified against endpoint requirements
4. **Clear Error Messages**: Users receive specific error messages when access is denied
5. **Consistent Protection**: All controllers use the same guard pattern

## Usage Example

```typescript
import { JwtAuthGuard, PlayerRoleGuard, OwnerRoleGuard } from '@/modules/auth/guards';

// Player-only controller
@Controller('player/example')
@UseGuards(JwtAuthGuard, PlayerRoleGuard)
export class PlayerExampleController {
  // Only players can access these endpoints
}

// Owner-only controller  
@Controller('owner/example')
@UseGuards(JwtAuthGuard, OwnerRoleGuard)
export class OwnerExampleController {
  // Only owners and admins can access these endpoints
}
```

## Error Handling

When a user with the wrong role tries to access a protected endpoint:

1. **PlayerRoleGuard**: Returns 403 Forbidden with message "Access denied. This endpoint is only available for players."
2. **OwnerRoleGuard**: Returns 403 Forbidden with message "Access denied. This endpoint is only available for owners and administrators."

## Testing

To test the guards:

1. **Valid Player Token**: Should access player endpoints successfully
2. **Valid Owner Token**: Should access owner endpoints successfully  
3. **Player Token on Owner Endpoint**: Should return 403 Forbidden
4. **Owner Token on Player Endpoint**: Should return 403 Forbidden
5. **Invalid/Expired Token**: Should return 401 Unauthorized
6. **No Token**: Should return 401 Unauthorized
