# Court API Refactor - Facility-Based Access

This document outlines the major refactoring of the court API to enforce facility-based access and separate player/owner endpoints.

## Overview

### Changes Made
1. **Removed "get all courts" endpoint** - Courts must be accessed via facility ID
2. **Created separate controllers** - Different endpoints for players and owners
3. **Enforced facility-based access** - All court operations scoped to facilities
4. **Updated frontend APIs** - Modified to work with new backend structure

## Backend Changes

### 1. New Controllers

#### Player Court Controller (`/player/courts`)
- **Public access** - No authentication required for viewing
- **Read-only operations** - Players can only view courts
- **Active courts only** - Only shows available courts to players
- **Facility-scoped** - All endpoints require facility ID

**Endpoints:**
- `GET /player/courts/facility/:facilityId` - Get courts for a facility
- `GET /player/courts/:id` - Get court details (active only)
- `GET /player/courts/facility/:facilityId/sport/:sport` - Filter by sport
- `GET /player/courts/facility/:facilityId/available` - Get available courts

#### Owner Court Controller (`/owner/courts`)
- **Authenticated access** - Requires OWNER or ADMIN role
- **Full CRUD operations** - Create, read, update, delete courts
- **All court statuses** - Can see active and inactive courts
- **Ownership validation** - TODO: Verify facility ownership

**Endpoints:**
- `GET /owner/courts/facility/:facilityId` - Get courts for owned facility
- `POST /owner/courts/facility/:facilityId` - Create court in facility
- `GET /owner/courts/:id` - Get court details
- `PUT /owner/courts/:id` - Update court
- `DELETE /owner/courts/:id` - Delete court
- `PUT /owner/courts/:id/activate` - Activate court
- `PUT /owner/courts/:id/deactivate` - Deactivate court
- `GET /owner/courts/facility/:facilityId/stats` - Get facility court statistics

### 2. Updated Original Controller (`/courts`)
- **Kept for backward compatibility** - Legacy endpoints
- **Removed problematic endpoints** - No more "get all courts"
- **Minimal functionality** - Only essential operations remain

### 3. Removed Use Cases
- **GetAllCourtsUseCase** - No longer needed
- **Generic search methods** - Removed from court service

## Frontend Changes (Owner Frontend)

### 1. Updated Court API (`src/lib/api/courts.ts`)

#### Breaking Changes
- `getCourts()` now requires `facilityId` parameter
- `createCourt()` now requires `facilityId` parameter
- `getCourtStats()` now requires `facilityId` parameter
- All endpoints now use `/owner/courts` prefix

#### New Method Signatures
```typescript
// Before
static async getCourts(filters?: CourtFilters): Promise<Court[]>
static async createCourt(data: CreateCourtData): Promise<Court>
static async getCourtStats(facilityId?: string): Promise<CourtStats>

// After
static async getCourts(facilityId: string, filters?: CourtFilters): Promise<Court[]>
static async createCourt(facilityId: string, data: CreateCourtData): Promise<Court>
static async getCourtStats(facilityId: string): Promise<CourtStats>
```

### 2. Usage Examples

#### Getting Courts for a Facility
```typescript
// Before
const courts = await CourtApi.getCourts({ facilityId: 'facility-123' });

// After
const courts = await CourtApi.getCourts('facility-123');
```

#### Creating a Court
```typescript
// Before
const court = await CourtApi.createCourt({
  facilityId: 'facility-123',
  name: 'Court 1',
  sport: 'TENNIS'
});

// After
const court = await CourtApi.createCourt('facility-123', {
  name: 'Court 1',
  sport: 'TENNIS'
});
```

#### Getting Court Statistics
```typescript
// Before
const stats = await CourtApi.getCourtStats('facility-123');

// After
const stats = await CourtApi.getCourtStats('facility-123');
```

## Security Improvements

### 1. Facility-Based Access Control
- All court operations require a facility ID
- Prevents accessing courts without proper context
- Enables easier ownership validation

### 2. Role-Based Endpoints
- Players: Read-only access to active courts
- Owners: Full access to their facility courts
- Clear separation of concerns

### 3. TODO: Ownership Validation
The following validation needs to be implemented:
- Verify facility ownership before allowing operations
- Check user permissions for specific facilities
- Implement proper authorization guards

## Migration Guide

### For Frontend Developers

1. **Update API Calls**
   ```typescript
   // Update all court API calls to include facilityId
   const courts = await CourtApi.getCourts(facilityId);
   const newCourt = await CourtApi.createCourt(facilityId, courtData);
   ```

2. **Handle Errors**
   ```typescript
   try {
     const courts = await CourtApi.getCourts(facilityId);
   } catch (error) {
     if (error.message.includes('facilityId is required')) {
       // Handle missing facility ID
     }
   }
   ```

3. **Update Components**
   - Ensure facility ID is available before making court API calls
   - Update court management components to pass facility ID
   - Handle loading states while facility ID is being determined

### For Backend Developers

1. **Implement Ownership Validation**
   - Add facility ownership checks in use cases
   - Verify user has permission to access specific facilities
   - Return 403 Forbidden for unauthorized access

2. **Add Logging**
   - Log facility access attempts
   - Monitor court operations for security
   - Track user activities per facility

## Testing

### Backend Tests
1. Test facility-based access control
2. Verify role-based permissions
3. Test error handling for missing facility IDs
4. Validate court filtering by facility

### Frontend Tests
1. Test updated API method signatures
2. Verify error handling for missing facility ID
3. Test component behavior with new API structure
4. Validate court management workflows

## Performance Considerations

### Improved Performance
- Facility-scoped queries are more efficient
- Reduced data transfer (no "get all courts")
- Better database indexing opportunities

### Potential Issues
- Additional parameter validation overhead
- More complex frontend state management
- Need to ensure facility ID is always available

## Future Enhancements

1. **Implement ownership validation** - Critical security feature
2. **Add facility-level permissions** - Fine-grained access control
3. **Cache facility court lists** - Performance optimization
4. **Add audit logging** - Track all court operations
5. **Implement bulk operations** - For managing multiple courts

## Breaking Changes Summary

### Backend
- ❌ `GET /courts` - Removed (was returning all courts)
- ❌ `GET /courts/sport/:sport` - Removed (no facility context)
- ❌ `GET /courts/surface/:surface` - Removed (no facility context)
- ❌ `GET /courts/type/indoor` - Removed (no facility context)
- ❌ `GET /courts/type/outdoor` - Removed (no facility context)
- ❌ `GET /courts/with-pricing` - Removed (optionally facility-scoped)

### Frontend
- ❌ `CourtApi.getCourts()` without facilityId - Now requires facilityId
- ❌ `CourtApi.createCourt()` without facilityId - Now requires facilityId
- ❌ `CourtApi.getCourtStats()` without facilityId - Now requires facilityId
- ❌ Generic court search methods - Removed (no facility context)

## Benefits

1. **Better Security** - Facility-based access control
2. **Clearer API** - Explicit facility context required
3. **Role Separation** - Different endpoints for different users
4. **Performance** - More efficient facility-scoped queries
5. **Maintainability** - Cleaner controller organization
