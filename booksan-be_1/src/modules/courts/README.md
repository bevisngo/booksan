# Courts Module

The Courts module provides comprehensive functionality for managing sports courts within facilities. It follows the established patterns in the Booksan backend architecture.

## Features

- **Court Management**: Create, read, update, and delete courts
- **Facility Integration**: Courts are associated with facilities
- **Sport & Surface Types**: Support for various sports and court surfaces
- **Indoor/Outdoor Classification**: Distinguish between indoor and outdoor courts
- **Booking Slot Configuration**: Set custom slot durations for each court
- **Court Statistics**: Get comprehensive statistics about courts
- **Filtering & Search**: Advanced filtering by sport, surface, facility, etc.

## API Endpoints

### Court Management
- `POST /courts` - Create a new court (Owner/Admin only)
- `PUT /courts/:id` - Update a court (Owner/Admin only)
- `GET /courts/:id` - Get court by ID
- `DELETE /courts/:id` - Delete a court (Owner/Admin only)

### Court Listing
- `GET /courts` - Get all courts with optional filters
- `GET /courts/facility/:facilityId` - Get courts for a specific facility

### Court Status
- `PUT /courts/:id/activate` - Activate a court (Owner/Admin only)
- `PUT /courts/:id/deactivate` - Deactivate a court (Owner/Admin only)

### Court Filtering
- `GET /courts/sport/:sport` - Get courts by sport type (Public)
- `GET /courts/surface/:surface` - Get courts by surface type (Public)
- `GET /courts/type/indoor` - Get all indoor courts (Public)
- `GET /courts/type/outdoor` - Get all outdoor courts (Public)

### Statistics & Analytics
- `GET /courts/stats/overview` - Get court statistics
- `GET /courts/with-pricing` - Get courts with pricing information

## Data Models

### Court
- `id`: Unique identifier (UUID)
- `facilityId`: Reference to the facility
- `name`: Court name
- `sport`: Sport type (enum)
- `surface`: Court surface type (optional enum)
- `indoor`: Boolean indicating if court is indoor
- `notes`: Additional notes about the court
- `slotMinutes`: Duration of each booking slot in minutes
- `isActive`: Whether the court is active
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Supported Sports
- TENNIS
- BADMINTON
- SQUASH
- BASKETBALL
- FOOTBALL
- VOLLEYBALL
- TABLE_TENNIS
- PICKLEBALL
- FUTSAL
- OTHER

### Supported Surfaces
- HARD_COURT
- CLAY
- GRASS
- CARPET
- CONCRETE
- WOODEN
- SYNTHETIC
- ACRYLIC
- SAND
- OTHER

## Architecture

The module follows the established patterns:

### Controllers
- `CourtController`: Handles HTTP requests and responses
- Uses guards for authentication and authorization
- Implements proper error handling and validation

### Services
- `CourtService`: Contains business logic
- Handles validation and error cases
- Coordinates between repositories and use cases

### Repositories
- `CourtRepository`: Extends BaseRepository for data access
- Provides specialized queries for courts
- Handles complex relationships with facilities

### Use Cases
- `CreateCourtUseCase`: Handles court creation
- `UpdateCourtUseCase`: Handles court updates
- `GetCourtByIdUseCase`: Retrieves single court
- `GetCourtsByFacilityUseCase`: Retrieves courts by facility
- `GetAllCourtsUseCase`: Retrieves all courts with filters
- `DeleteCourtUseCase`: Handles court deletion
- `GetCourtStatsUseCase`: Provides court statistics

### DTOs
- `CreateCourtDto`: Input validation for court creation
- `UpdateCourtDto`: Input validation for court updates
- `CourtResponseDto`: Standard court response format
- `CourtWithFacilityResponseDto`: Court response with facility data
- `CourtFiltersDto`: Filtering options for court queries

## Usage Examples

### Create a Court
```typescript
const createCourtDto: CreateCourtDto = {
  facilityId: 'facility-uuid',
  name: 'Court 1',
  sport: Sport.TENNIS,
  surface: Surface.HARD_COURT,
  indoor: false,
  slotMinutes: 60,
  notes: 'Professional tennis court with lighting'
};

const court = await courtService.createCourt(createCourtDto);
```

### Get Courts by Facility
```typescript
const courts = await courtService.getCourtsByFacility('facility-uuid');
```

### Filter Courts
```typescript
const filters: CourtFiltersDto = {
  sport: Sport.TENNIS,
  indoor: true,
  isActive: true
};

const courts = await courtService.getAllCourts(filters);
```

## Security

- Authentication required for most endpoints
- Role-based authorization (Owner/Admin for modifications)
- Public access for read-only operations like filtering
- Input validation using class-validator decorators

## Error Handling

- `NotFoundException`: When court or facility doesn't exist
- `ConflictException`: When court name already exists in facility
- `BadRequestException`: When trying to delete court with bookings
- Proper HTTP status codes and error messages

## Integration

The module integrates with:
- **Auth Module**: For authentication and authorization
- **Venues Module**: For facility validation and data
- **Prisma**: For database operations
- **Base Repository**: For common CRUD operations
