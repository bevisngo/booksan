# Elasticsearch Integration

This module provides Elasticsearch integration for the Booksan backend, enabling fast and scalable search functionality for venues and facilities.

## Features

- **Venue Search**: Search venues by keyword (name, address, description)
- **Geospatial Search**: Distance-based sorting and filtering
- **Sport Filtering**: Filter venues by available sports
- **Index Management**: Create, update, delete, and reindex operations
- **Bulk Operations**: Efficient bulk indexing for large datasets

## Configuration

Add the following environment variables:

```env
ELASTICSEARCH_URL="http://localhost:9200"
ELASTICSEARCH_USERNAME="elastic"  # Optional
ELASTICSEARCH_PASSWORD="password"  # Optional
```

## Index Structure

### Venues Index (`venues`)

```json
{
  "id": "venue_id",
  "name": "Venue Name",
  "address": "123 Street Name",
  "ward": "Ward Name",
  "city": "City Name", 
  "description": "Venue description",
  "location": {
    "lat": 10.7769,
    "lon": 106.7009
  },
  "isPublished": true,
  "ownerId": "owner_id",
  "courts": [
    {
      "id": "court_id",
      "name": "Court 1",
      "sport": "TENNIS",
      "surface": "HARD_COURT",
      "indoor": false,
      "isActive": true
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Search Features

### Keyword Search
- **Name Boost**: 3x weight for venue names
- **Address**: 1x weight for addresses  
- **Description**: 0.5x weight for descriptions
- **Fuzzy Matching**: Automatic typo tolerance

### Distance Search
- **Geo-distance sorting**: Sort by distance from coordinates
- **Distance filtering**: Filter venues within specified radius
- **Unit support**: kilometers (km), meters (m)

### Advanced Filtering
- **Sport filtering**: Filter by court sports
- **Publication status**: Published/unpublished venues
- **Active courts**: Only include active courts

## Usage

### Basic Search

```typescript
import { VenueSearchService } from '@/modules/venues/services';

// Search by keyword
const results = await venueSearchService.searchVenues({
  keyword: 'tennis court',
  limit: 20,
  offset: 0
});

// Search with location
const results = await venueSearchService.searchVenues({
  keyword: 'badminton',
  lat: 10.7769,
  lon: 106.7009,
  maxDistance: '5km',
  sortBy: 'distance'
});

// Filter by sport
const results = await venueSearchService.searchVenues({
  sport: 'TENNIS',
  isPublished: true
});
```

### Index Management

```typescript
// Index single venue
await venueSearchService.indexVenue('venue_id');

// Reindex all venues
await venueSearchService.reindexAllVenues();

// Get index statistics
const stats = await venueSearchService.getIndexStats();
```

## API Endpoints

### Public Endpoints

- `GET /venues/search` - Search venues
- `GET /venues/:id` - Get venue by ID

### Admin Endpoints (Requires Auth)

- `POST /venues/:id/reindex` - Reindex single venue
- `POST /venues/reindex-all` - Reindex all venues
- `GET /venues/admin/stats` - Get index statistics

## Migration Scripts

### Available Commands

```bash
# Migrate all published venues
pnpm run migrate:venues

# Migrate with custom batch size
pnpm run migrate:venues --batch-size 50

# Clear index and migrate
pnpm run es:reindex

# Validate venue coordinates
pnpm run es:validate

# Test search functionality
pnpm run es:test

# Dry run (validate without indexing)
pnpm run migrate:venues --dry-run

# Show help
pnpm run migrate:venues --help
```

### Migration Options

- `--batch-size N`: Process venues in batches of N (default: 100)
- `--all`: Migrate all venues, not just published ones
- `--dry-run`: Validate data without indexing
- `--clear-index`: Clear existing index before migration
- `--validate-coords`: Only validate venue coordinates
- `--test-search`: Only test search functionality

## Performance Considerations

- **Batch Size**: Default 100 venues per batch, adjust based on memory
- **Bulk Indexing**: Uses Elasticsearch bulk API for efficiency
- **Index Settings**: Single shard, no replicas for development
- **Connection Pool**: Configurable timeout and retry settings

## Monitoring

### Index Health

```typescript
const stats = await elasticsearchService.getIndexStats();
console.log('Documents:', stats.indices.venues.total.docs.count);
console.log('Size:', stats.indices.venues.total.store.size_in_bytes);
```

### Search Performance

- Monitor search response times
- Track search result relevance
- Monitor index size growth

## Error Handling

- **Connection errors**: Automatic retry with exponential backoff
- **Index errors**: Detailed error logging and recovery
- **Bulk operation errors**: Individual item error tracking
- **Search errors**: Graceful fallback to database search

## Security

- **Authentication**: Optional username/password authentication
- **Index isolation**: Separate indices per environment
- **Data validation**: Input sanitization and validation
- **Access control**: Protected admin endpoints
