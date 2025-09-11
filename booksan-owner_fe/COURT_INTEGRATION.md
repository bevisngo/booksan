# Court Integration - Owner Frontend

This document describes the integration of the court management system with the Booksan owner frontend.

## Overview

The court integration provides comprehensive functionality for managing sports courts within facilities. It includes full CRUD operations, filtering, statistics, and seamless integration with the existing venue management system.

## Features Implemented

### 🏗️ **Core Components**
- **CourtCard**: Display individual court information with actions
- **CreateCourtDialog**: Modal for creating and editing courts
- **CourtsPage**: Main page for managing all courts
- **CourtStatsCard**: Statistics display component

### 📊 **API Integration**
- **CourtApi**: Complete API client for all court operations
- **useCourts**: React hooks for data fetching and mutations
- **Type Safety**: Full TypeScript support with proper types

### 🎯 **Key Features**
- **Full CRUD Operations**: Create, read, update, delete courts
- **Advanced Filtering**: Filter by sport, surface, indoor/outdoor, status
- **Court Statistics**: Real-time statistics and analytics
- **Facility Integration**: Courts are properly linked to facilities
- **Status Management**: Activate/deactivate courts
- **Responsive Design**: Mobile-friendly interface

## File Structure

```
src/
├── types/
│   └── court.ts                 # Court type definitions
├── lib/
│   └── api/
│       └── courts.ts           # Court API client
├── hooks/
│   └── use-courts.ts           # Court data hooks
├── components/
│   └── courts/
│       ├── court-card.tsx      # Individual court display
│       ├── create-court-dialog.tsx # Create/edit modal
│       ├── courts-page.tsx     # Main courts page
│       ├── court-stats-card.tsx # Statistics component
│       └── index.ts            # Component exports
└── app/
    ├── courts/
    │   └── page.tsx            # Global courts page
    └── venues/
        └── [id]/
            └── courts/
                └── page.tsx    # Facility-specific courts page
```

## API Endpoints Used

The integration uses the following backend endpoints:

- `GET /courts` - Get all courts with filters
- `GET /courts/:id` - Get specific court
- `POST /courts` - Create new court
- `PUT /courts/:id` - Update court
- `DELETE /courts/:id` - Delete court
- `GET /courts/facility/:facilityId` - Get courts by facility
- `PUT /courts/:id/activate` - Activate court
- `PUT /courts/:id/deactivate` - Deactivate court
- `GET /courts/stats/overview` - Get court statistics
- `GET /courts/sport/:sport` - Get courts by sport
- `GET /courts/surface/:surface` - Get courts by surface
- `GET /courts/type/indoor` - Get indoor courts
- `GET /courts/type/outdoor` - Get outdoor courts
- `GET /courts/with-pricing` - Get courts with pricing

## Navigation Integration

The courts module is integrated into the main navigation:

- **Global Courts Page**: `/courts` - Manage all courts across facilities
- **Facility Courts Page**: `/venues/[id]/courts` - Manage courts for specific facility
- **Navigation Menu**: Added "Courts" item to the main dashboard navigation

## Usage Examples

### Creating a Court
```typescript
const { createCourt } = useCourtMutations();

const handleCreate = async (data: CreateCourtData) => {
  try {
    await createCourt(data);
    toast({ title: 'Court created successfully' });
  } catch (error) {
    toast({ title: 'Failed to create court', variant: 'destructive' });
  }
};
```

### Filtering Courts
```typescript
const { courts, loading, error } = useCourts({
  facilityId: 'facility-uuid',
  sport: Sport.TENNIS,
  indoor: true,
  isActive: true
});
```

### Getting Court Statistics
```typescript
const { stats, loading, error } = useCourtStats('facility-uuid');
```

## Component Props

### CourtCard
```typescript
interface CourtCardProps {
  court: Court;
  onUpdate?: () => void;
  onDelete?: (id: string) => void;
  onToggleActive?: (id: string, isActive: boolean) => void;
}
```

### CreateCourtDialog
```typescript
interface CreateCourtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (court: Court) => void;
  facilityId?: string;
  court?: Court; // For editing
}
```

### CourtsPage
```typescript
interface CourtsPageProps {
  facilityId?: string; // Optional - filters to specific facility
}
```

## Data Types

### Court
```typescript
interface Court {
  id: string;
  facilityId: string;
  name: string;
  sport: Sport;
  surface?: Surface;
  indoor: boolean;
  notes?: string;
  slotMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### CourtFilters
```typescript
interface CourtFilters {
  facilityId?: string;
  sport?: Sport;
  surface?: Surface;
  indoor?: boolean;
  isActive?: boolean;
}
```

## Error Handling

The integration includes comprehensive error handling:

- **API Errors**: Proper error messages and user feedback
- **Validation**: Form validation using Zod schemas
- **Loading States**: Loading indicators for all async operations
- **Toast Notifications**: Success and error notifications

## Security

- **Authentication**: All court operations require authentication
- **Authorization**: Role-based access control (Owner/Admin only)
- **Input Validation**: Server-side and client-side validation
- **CSRF Protection**: Built-in Next.js CSRF protection

## Performance

- **Debounced Search**: Optimized search with debouncing
- **Lazy Loading**: Components load data only when needed
- **Caching**: React Query for efficient data caching
- **Optimistic Updates**: Immediate UI updates with rollback on error

## Future Enhancements

Potential future improvements:

1. **Bulk Operations**: Select multiple courts for bulk actions
2. **Advanced Filtering**: More sophisticated filter options
3. **Court Templates**: Predefined court configurations
4. **Import/Export**: Bulk court data management
5. **Analytics Dashboard**: Advanced court usage analytics
6. **Mobile App**: Native mobile app integration
7. **Real-time Updates**: WebSocket integration for live updates

## Testing

The integration should be tested for:

- **Unit Tests**: Individual component testing
- **Integration Tests**: API integration testing
- **E2E Tests**: Full user workflow testing
- **Accessibility**: Screen reader and keyboard navigation
- **Performance**: Load testing and optimization

## Deployment

The court integration is ready for deployment and includes:

- **Environment Variables**: Proper configuration management
- **Build Optimization**: Optimized production builds
- **Error Monitoring**: Comprehensive error tracking
- **Analytics**: User interaction tracking
