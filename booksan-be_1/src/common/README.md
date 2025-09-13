# Base Filter System

This document describes the base filter system implemented for all GET list requests in the application. This system provides consistent pagination, filtering, sorting, and search functionality across all endpoints.

## Overview

The base filter system consists of:

1. **BaseFilterDto** - Base DTO class that all filter DTOs should extend
2. **PaginationPipe** - Pipe that transforms query parameters and sets defaults
3. **FilterToPrismaUtil** - Utility class for converting filters to Prisma queries
4. **BasePaginationResponseDto** - Base response class for paginated results

## Key Features

- **Automatic Default Values**: Page defaults to 1, limit defaults to 10
- **Validation**: Ensures page ≥ 1 and limit between 1-100
- **Multiple Pagination Types**: Supports both offset-based and cursor-based pagination
- **Search Functionality**: Built-in search capability across specified fields
- **Sorting**: Configurable sorting with direction
- **Relation Includes**: Optional inclusion of related data
- **Consistent API**: Same query parameters across all endpoints

## Usage

### 1. Creating a Filter DTO

Extend `BaseFilterDto` for your entity-specific filters:

```typescript
// src/modules/example/dto/example.dto.ts
import { BaseFilterDto } from '@/common/dto';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';

export class ExampleFiltersDto extends BaseFilterDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ExamplePaginationResponseDto extends BasePaginationResponseDto<ExampleResponseDto> {
  declare data: ExampleResponseDto[];
}
```

### 2. Updating the Controller

Use the `PaginationPipe` and proper decorators:

```typescript
// src/modules/example/controllers/example.controller.ts
import { PaginationPipe } from '@/common/pipes';

@Controller('examples')
export class ExampleController {
  @Get()
  @UsePipes(new PaginationPipe(ExampleFiltersDto))
  async getExamples(
    @Query() filters: ExampleFiltersDto,
  ): Promise<ExamplePaginationResponseDto> {
    return this.exampleService.getAllExamplesPaginated(filters);
  }
}
```

### 3. Implementing the Service Method

Use the `FilterToPrismaUtil` to convert filters to repository options:

```typescript
// src/modules/example/services/example.service.ts
import { FilterToPrismaUtil } from '@/common/utils';

@Injectable()
export class ExampleService {
  async getAllExamplesPaginated(filters: ExampleFiltersDto): Promise<ExamplePaginationResponseDto> {
    // Build base where clause from filters
    const whereClause: Record<string, any> = {};

    if (filters.status) whereClause.status = filters.status;
    if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;

    // Handle search functionality
    if (filters.search && filters.search.trim()) {
      const searchFields = ['name', 'description']; // Define searchable fields
      const searchClause = FilterToPrismaUtil.buildSearchClause(filters.search, searchFields);
      if (searchClause.length > 0) {
        whereClause.AND = [
          searchClause.length === 1 ? searchClause[0] : { OR: searchClause },
        ];
      }
    }

    // Convert to repository options
    const repositoryOptions = FilterToPrismaUtil.toRepositoryOptions(
      filters,
      whereClause,
      filters.includeRelations ? { relatedEntity: true } : undefined,
    );

    // Set default sort field if not provided
    if (!filters.sortBy) {
      repositoryOptions.orderBy = { createdAt: 'desc' };
    }

    const result = await this.exampleRepository.findMany(repositoryOptions);

    return new ExamplePaginationResponseDto(
      result.data.map(item => this.mapToResponseDto(item)),
      result.meta,
    );
  }
}
```

## API Usage Examples

### Basic Pagination
```bash
GET /api/examples?page=2&limit=20
```

### With Filters
```bash
GET /api/examples?status=active&isActive=true&page=1&limit=10
```

### With Search
```bash
GET /api/examples?search=basketball&page=1&limit=10
```

### With Sorting
```bash
GET /api/examples?sortBy=name&sortDirection=asc&page=1&limit=10
```

### With Relations
```bash
GET /api/examples?includeRelations=true&page=1&limit=10
```

### Cursor-based Pagination
```bash
GET /api/examples?cursor=abc123&limit=10
```

## Response Format

All paginated endpoints return a consistent response format:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Example",
      // ... other fields
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPreviousPage": false,
    "cursor": "next_cursor_value" // Only for cursor-based pagination
  }
}
```

## Default Values

- **page**: 1
- **limit**: 10 (max: 100)
- **sortDirection**: 'asc'
- **includeRelations**: false

## Validation Rules

- `page` must be ≥ 1
- `limit` must be between 1 and 100
- `sortDirection` must be 'asc' or 'desc'
- All query parameters are optional

## Best Practices

1. **Define Searchable Fields**: Always specify which fields should be searchable in your service
2. **Set Default Sorting**: Provide a sensible default sort field if none is specified
3. **Use Proper Relations**: Only include relations when `includeRelations=true`
4. **Entity-Specific Filters**: Add your own filters by extending `BaseFilterDto`
5. **Consistent Naming**: Use consistent field names across your DTOs
6. **Documentation**: Always document your filter parameters with inline comments

## Troubleshooting

### Common Issues

1. **Validation Errors**: Ensure your filter DTO extends `BaseFilterDto` and uses proper decorators
2. **Type Errors**: Make sure to declare the data property in your pagination response DTO
3. **Search Not Working**: Verify you've defined searchable fields in your service
4. **Relations Not Loading**: Check that you're passing the include options correctly

### Performance Considerations

1. **Index Fields**: Ensure filtered and sorted fields are indexed in your database
2. **Limit Relations**: Be careful with deep relation includes as they can impact performance
3. **Search Optimization**: Consider using full-text search for complex search requirements
4. **Cursor Pagination**: Use cursor-based pagination for large datasets

## Example Implementation

The court module serves as a reference implementation of this base filter system. See:

- `src/modules/courts/dto/court.dto.ts` - Filter DTO implementation
- `src/modules/courts/controllers/court.controller.ts` - Controller setup
- `src/modules/courts/services/court.service.ts` - Service implementation
