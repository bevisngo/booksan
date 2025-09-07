# Authentication System Updates

## Overview
This document outlines the updates made to the authentication system to support unique phone + role constraints and owner-specific authentication.

## Changes Made

### 1. Database Schema Changes
- **Updated User Model**: Modified the unique constraint from `@@unique([phone])` to `@@unique([phone, role])`
- **Migration Applied**: Created and applied migration `20250907193335_phone_role_unique_constraint`
- **Impact**: Now allows the same phone number to be used by users with different roles (e.g., a person can be both a PLAYER and an OWNER)

### 2. Authentication API Enhancements

#### New Owner Login Endpoint
- **Endpoint**: `POST /auth/owner/login`
- **Purpose**: Dedicated authentication endpoint for users with OWNER role
- **DTO**: `OwnerLoginDto` (similar to regular login but specifically validates OWNER role)
- **Use Case**: `OwnerLoginUseCase` handles owner-specific authentication logic

#### Repository Updates
- Added `findUserByEmailAndRole()` method
- Added `findUserByPhoneAndRole()` method
- These methods enable role-specific user lookups

#### New Authentication Flow
```typescript
// Owner login validates role during authentication
const user = await this.authRepository.findUserByEmailAndRole(email, UserRole.OWNER);
// OR
const user = await this.authRepository.findUserByPhoneAndRole(phone, UserRole.OWNER);
```

### 3. Data Migration
- **Script**: `scripts/seed-users-from-geocoded-data.ts`
- **Purpose**: Updates passwords for existing users whose phone numbers are found in the geocoded data Excel file
- **Default Password**: `Booksan@2024`
- **Results**: 
  - ✅ Updated: 1400 users
  - ⚠️ Not found: 59 phone numbers

## API Endpoints

### Regular Authentication
- `POST /auth/login` - General user login (any role)
- `POST /auth/signup` - User registration

### Owner Authentication
- `POST /auth/owner/login` - Owner-specific login (OWNER role only)

## Security Features

### Role-Based Access Control
The system maintains existing role-based access control using:
- `@Roles(UserRole.OWNER)` decorator
- `RolesGuard` for endpoint protection
- JWT tokens contain role information

### Authentication Guards
- `JwtAuthGuard` - Validates JWT tokens
- `RolesGuard` - Enforces role-based access
- `@Public()` decorator for public endpoints

## Database Constraints

### Before
```sql
UNIQUE INDEX "users_phone_key" ON "users"("phone")
```

### After
```sql
UNIQUE INDEX "users_phone_role_key" ON "users"("phone", "role")
```

## Usage Examples

### Owner Login
```bash
curl -X POST http://localhost:3000/auth/owner/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0837199191",
    "password": "Booksan@2024"
  }'
```

### Regular Login (any role)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "0837199191", 
    "password": "Booksan@2024"
  }'
```

## Benefits

1. **Flexible User Management**: Same phone number can be used for different roles
2. **Role-Specific Authentication**: Owners have dedicated login endpoint
3. **Data Consistency**: Existing user data updated with default passwords
4. **Security**: Maintains existing security features while adding flexibility

## Files Modified

### Core Authentication Files
- `src/modules/auth/dto/owner-login.dto.ts` (new)
- `src/modules/auth/use-cases/owner-login.use-case.ts` (new)
- `src/modules/auth/repositories/auth.repository.ts` (modified)
- `src/modules/auth/controllers/auth.controller.ts` (modified)
- `src/modules/auth/auth.module.ts` (modified)

### Database Files
- `prisma/user.prisma` (modified)
- `prisma/migrations/20250907193335_phone_role_unique_constraint/migration.sql` (new)

### Scripts
- `scripts/seed-users-from-geocoded-data.ts` (new)

## Notes

- The default password for migrated users is `Booksan@2024`
- 59 phone numbers from the geocoded data were not found in the existing user database
- All authentication endpoints maintain backward compatibility
- The new owner login endpoint provides the same response format as regular login
