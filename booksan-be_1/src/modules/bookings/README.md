# Bookings Module

This module handles booking management for both players and owners.

## Features Implemented

### For Players (Dummy APIs)
- **GET** `/player/bookings` - Get player's bookings
- **GET** `/player/bookings/:id` - Get specific booking details
- **GET** `/player/bookings/courts/:courtId/available-slots` - Get available time slots
- **POST** `/player/bookings/request` - Request a booking
- **POST** `/player/bookings/:id/cancel-request` - Request booking cancellation

### For Owners (Full Implementation)

#### Court Detail Page Views
- **GET** `/owner/bookings/courts/:courtId` - Get bookings for a specific court
  - Supports 3 views: `day`, `week`, `month`
  - Query params: `view`, `startDate`

#### Bookings Page Views  
- **GET** `/owner/bookings` - Get facility bookings with pagination
  - Supports 2 views: `day`, `week` only
  - Query params: `page`, `limit`, `courtId`, `status`, `search`, `view`, `startDate`, `endDate`

#### Booking Management
- **POST** `/owner/bookings` - Create booking for a player
- **POST** `/owner/bookings/slots/:slotId/cancel` - Cancel a booking slot

#### Analytics & Statistics
- **GET** `/owner/bookings/stats` - Get booking statistics
- **GET** `/owner/bookings/analytics/by-time` - Get time-based analytics
- **GET** `/owner/bookings/analytics/popular-slots` - Get popular time slots
- **GET** `/owner/bookings/analytics/court-utilization` - Get court utilization rates

## Schema Analysis

The existing booking schema supports all required features:

✅ **Day/Week/Month Views**: `BookingSlot` with `startTime`/`endTime` DateTime fields  
✅ **Court-specific bookings**: Proper relationships `Booking` → `Court` → `Facility`  
✅ **Owner access control**: Court belongs to Facility, owners have `facilityId`  
✅ **Booking cancellation**: `BookingSlot` has status, cancelReason, cancelledBy fields  
✅ **Owner creates for players**: Schema supports this workflow  

## Key Components

- **DTOs**: Request/response validation and transformation
- **Services**: Database operations and business logic
- **Use Cases**: Business use case implementations
- **Controllers**: API endpoints with proper auth guards
- **Module**: Dependency injection setup

## Authentication

- Player endpoints use `JwtAuthGuard` + `PlayerRoleGuard`
- Owner endpoints use `JwtAuthGuard` + `OwnerRoleGuard`
- Owners can only access bookings for their own facility
