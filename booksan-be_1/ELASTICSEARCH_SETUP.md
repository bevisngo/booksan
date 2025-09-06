# Elasticsearch Setup Guide

This guide explains how to set up and use the Elasticsearch integration in the Booksan backend.

## Prerequisites

1. **Docker Setup**: Ensure Elasticsearch is running via Docker
2. **Environment Variables**: Configure Elasticsearch connection settings

## Environment Configuration

Add these variables to your `.env` file:

```env
# Elasticsearch Configuration
ELASTICSEARCH_URL="http://localhost:9200"
# ELASTICSEARCH_USERNAME="elastic"  # Optional - for secured ES
# ELASTICSEARCH_PASSWORD="password"  # Optional - for secured ES
```

## Docker Setup

If you haven't set up Elasticsearch in Docker yet, add this to your `docker-compose.yml`:

```yaml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    container_name: booksan-elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - booksan-network

volumes:
  elasticsearch_data:
```

## Setup Process

### 1. Start Docker Services

```bash
# Start all services including Elasticsearch
pnpm run docker:start

# Check if Elasticsearch is running
curl http://localhost:9200
```

### 2. Build and Start Application

```bash
# Build the application
pnpm run build

# Start in development mode
pnpm run start:dev
```

### 3. Initialize Elasticsearch Index

The Elasticsearch index will be automatically created when the application starts. You can verify this by checking the logs.

### 4. Migrate Venue Data

Run the migration script to populate Elasticsearch with venue data from PostgreSQL:

```bash
# Migrate all published venues
pnpm run migrate:venues

# Clear index and migrate (fresh start)
pnpm run es:reindex

# Dry run (validate data without indexing)
pnpm run migrate:venues --dry-run

# Validate venue coordinates
pnpm run es:validate

# Test search functionality
pnpm run es:test
```

## API Endpoints

### Public Search Endpoints

#### Search Venues
```http
GET /venues/search?keyword=tennis&lat=10.7769&lon=106.7009&maxDistance=5km&limit=20
```

**Query Parameters:**
- `keyword` (optional): Search term for venue names, addresses, descriptions
- `lat` (optional): Latitude for location-based search
- `lon` (optional): Longitude for location-based search
- `maxDistance` (optional): Maximum distance for location search (default: 50km)
- `sport` (optional): Filter by sport type (TENNIS, BADMINTON, etc.)
- `isPublished` (optional): Filter by publication status (default: true)
- `sortBy` (optional): Sort by relevance, distance, created_at, name
- `sortOrder` (optional): asc or desc
- `limit` (optional): Number of results (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

**Example Response:**
```json
{
  "data": {
    "data": [
      {
        "venue": {
          "id": "venue_id",
          "name": "Tennis Court Central",
          "address": "123 Main Street",
          "location": {
            "lat": 10.7769,
            "lon": 106.7009
          },
          "courts": [
            {
              "id": "court_id",
              "name": "Court 1",
              "sport": "TENNIS",
              "indoor": false,
              "isActive": true
            }
          ]
        },
        "score": 2.5,
        "distance": 1250
      }
    ],
    "total": 15,
    "maxScore": 3.2,
    "meta": {
      "limit": 20,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### Get Venue by ID
```http
GET /venues/{venue_id}
```

### Admin Endpoints (Requires Authentication)

#### Reindex Single Venue
```http
POST /venues/{venue_id}/reindex
Authorization: Bearer {jwt_token}
```

#### Reindex All Venues
```http
POST /venues/reindex-all
Authorization: Bearer {jwt_token}
```

#### Get Index Statistics
```http
GET /venues/admin/stats
Authorization: Bearer {jwt_token}
```

## Search Features

### 1. Keyword Search
- **Name Boost**: Venue names have 3x weight
- **Address**: Standard weight
- **Description**: 0.5x weight
- **Fuzzy Matching**: Automatic typo tolerance

### 2. Location-Based Search
- **Distance Sorting**: Sort venues by distance from coordinates
- **Distance Filtering**: Filter venues within specified radius
- **Geo-distance Calculation**: Accurate distance calculations

### 3. Sport Filtering
- Filter venues by available sports in active courts
- Supports all sport types: TENNIS, BADMINTON, SQUASH, etc.

### 4. Publication Filtering
- Only show published venues by default
- Admin can search unpublished venues

## Development Scripts

### Migration Commands
```bash
# Basic migration
pnpm run migrate:venues

# Custom batch size
pnpm run migrate:venues --batch-size 50

# Include all venues (not just published)
pnpm run migrate:venues --all

# Clear index before migration
pnpm run migrate:venues --clear-index

# Dry run
pnpm run migrate:venues --dry-run

# Show help
pnpm run migrate:venues --help
```

### Utility Commands
```bash
# Validate coordinates
pnpm run es:validate

# Test search functionality
pnpm run es:test

# Full reindex
pnpm run es:reindex
```

## Monitoring

### Health Check
The application includes a health check service to monitor Elasticsearch status.

### Index Statistics
Use the admin endpoint `/venues/admin/stats` to get detailed index statistics:
- Document count
- Index size
- Mapping information

### Logging
All Elasticsearch operations are logged with appropriate levels:
- `LOG`: General operations and success messages
- `DEBUG`: Detailed operation information
- `WARN`: Non-critical issues (e.g., missing coordinates)
- `ERROR`: Failed operations with detailed error information

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure Elasticsearch is running: `curl http://localhost:9200`
   - Check Docker containers: `docker ps`
   - Verify environment variables

2. **Index Not Created**
   - Check application logs for errors
   - Verify Elasticsearch permissions
   - Try manual index creation via migration script

3. **Search Returns No Results**
   - Verify data was migrated: `pnpm run es:test`
   - Check if venues are published
   - Validate search parameters

4. **Poor Search Relevance**
   - Check venue data quality (names, addresses)
   - Verify coordinates are present
   - Consider adjusting field weights in the service

### Debug Commands
```bash
# Check Elasticsearch status
curl http://localhost:9200/_cluster/health

# Check venue index
curl http://localhost:9200/venues/_search?size=5

# Get index mapping
curl http://localhost:9200/venues/_mapping

# Get index stats
curl http://localhost:9200/venues/_stats
```

## Performance Optimization

### Index Settings
- Single shard for development
- No replicas for local development
- Custom analyzers for Vietnamese text

### Search Optimization
- Use pagination for large result sets
- Limit distance searches to reasonable ranges
- Use appropriate field boosting

### Bulk Operations
- Default batch size: 100 venues
- Adjustable via command line parameters
- Progress monitoring and error handling

## Security Considerations

- Public search endpoints are rate-limited
- Admin endpoints require JWT authentication
- Sensitive data is not indexed
- Optional authentication support for secured Elasticsearch clusters
