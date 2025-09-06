# Base Repository Pattern

A comprehensive base repository implementation that provides common CRUD operations, pagination, filtering, and advanced query capabilities for all repositories in the application.

## Features

### 🔧 **Core CRUD Operations**
- `findById(id)` - Find single record by ID
- `findMany(options)` - Find multiple records with filtering and pagination
- `create(data)` - Create new record
- `update(id, data)` - Update existing record
- `delete(id)` - Delete record by ID
- `deleteMany(where)` - Delete multiple records

### 🔍 **Query Operations**
- `findFirst(where)` - Find first matching record
- `findUnique(where)` - Find unique record
- `count(where)` - Count records
- `exists(where)` - Check if record exists

### 📦 **Batch Operations**
- `createMany(data[])` - Create multiple records
- `updateMany(where, data)` - Update multiple records

### 🔄 **Advanced Operations**
- `upsert(where, create, update)` - Create or update record
- `findAndUpdate(where, data)` - Find and update record
- `findAndDelete(where)` - Find and delete record

### 📄 **Pagination Support**
- **Offset-based pagination** (page/limit)
- **Cursor-based pagination** (cursor/limit)
- **Pagination metadata** (total, hasNextPage, etc.)

### 🔎 **Search & Filtering**
- **Text search** across multiple fields
- **Advanced filtering** with nested conditions
- **Date range filtering**
- **Sorting** with multiple fields

### 🛡️ **Type Safety**
- **Generic types** for all operations
- **Prisma integration** with full type safety
- **Custom filter types** for each repository

## Usage

### 1. Create a Repository

```typescript
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/common/repositories';

export interface CreateUserData {
  name: string;
  email: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface UserFilters {
  name?: string;
  email?: string;
  role?: string;
}

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  'user'
> {
  protected readonly modelName = 'user' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Add custom methods specific to users
  async findUsersByRole(role: string): Promise<User[]> {
    return this.findMany({ where: { role } }).then(result => result.data);
  }
}
```

### 2. Basic CRUD Operations

```typescript
// Create
const user = await userRepository.create({
  name: 'John Doe',
  email: 'john@example.com',
});

// Find by ID
const user = await userRepository.findById('user-id');

// Update
const updatedUser = await userRepository.update('user-id', {
  name: 'Jane Doe',
});

// Delete
await userRepository.delete('user-id');

// Find many with filters
const users = await userRepository.findMany({
  where: { role: 'admin' },
  orderBy: { createdAt: 'desc' },
});
```

### 3. Pagination

```typescript
// Offset-based pagination
const result = await userRepository.findMany({
  page: 1,
  limit: 10,
  where: { isActive: true },
});

console.log(result.data); // Array of users
console.log(result.meta); // { page: 1, limit: 10, total: 100, totalPages: 10, hasNextPage: true }

// Cursor-based pagination
const result = await userRepository.findMany({
  cursor: 'last-user-id',
  limit: 10,
});
```

### 4. Advanced Filtering

```typescript
// Complex filters
const users = await userRepository.findMany({
  where: {
    role: 'admin',
    createdAt: {
      gte: new Date('2024-01-01'),
      lte: new Date('2024-12-31'),
    },
    OR: [
      { name: { contains: 'John' } },
      { email: { contains: 'john' } },
    ],
  },
  orderBy: [
    { createdAt: 'desc' },
    { name: 'asc' },
  ],
});
```

### 5. Search Functionality

```typescript
// Search across multiple fields
const users = await userRepository.search('john', ['name', 'email'], {
  where: { isActive: true },
  limit: 20,
});
```

### 6. Batch Operations

```typescript
// Create multiple records
const count = await userRepository.createMany([
  { name: 'User 1', email: 'user1@example.com' },
  { name: 'User 2', email: 'user2@example.com' },
]);

// Update multiple records
const updatedCount = await userRepository.updateMany(
  { role: 'guest' },
  { isActive: false }
);
```

### 7. Advanced Operations

```typescript
// Upsert (create or update)
const user = await userRepository.upsert(
  { email: 'john@example.com' },
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'John Updated' }
);

// Find and update
const updatedUser = await userRepository.findAndUpdate(
  { email: 'john@example.com' },
  { name: 'John Updated' }
);

// Find and delete
const deletedUser = await userRepository.findAndDelete(
  { email: 'john@example.com' }
);
```

### 8. Transaction Support

```typescript
// Use transactions
await userRepository.transaction(async (tx) => {
  const user = await tx.user.create({
    data: { name: 'John', email: 'john@example.com' },
  });
  
  await tx.profile.create({
    data: { userId: user.id, bio: 'Hello world' },
  });
});
```

### 9. Raw Queries

```typescript
// Execute raw SQL
const results = await userRepository.rawQuery(
  'SELECT * FROM users WHERE created_at > ?',
  [new Date('2024-01-01')]
);
```

## Query Builder

The `QueryBuilder` class provides utilities for building complex queries:

```typescript
import { QueryBuilder } from '@/common/repositories';

// Build where clause
const where = QueryBuilder.buildWhereClause({
  name: 'John*', // Wildcard search
  age_from: 18,  // Date/number range
  age_to: 65,
  role: ['admin', 'user'], // Array filter
});

// Build search conditions
const searchWhere = QueryBuilder.buildSearchConditions(
  { term: 'john', fields: ['name', 'email'] },
  { isActive: true }
);

// Build complete query
const query = QueryBuilder.buildQuery({
  where: { role: 'admin' },
  orderBy: { field: 'createdAt', direction: 'desc' },
  include: { profile: true },
  skip: 0,
  take: 10,
});
```

## Type Safety

The base repository is fully typed with TypeScript:

```typescript
// All operations are type-safe
const user: User = await userRepository.findById('id');
const users: User[] = await userRepository.findMany({ where: { role: 'admin' } });
const newUser: User = await userRepository.create({ name: 'John', email: 'john@example.com' });
```

## Best Practices

1. **Extend BaseRepository** for all your repositories
2. **Define specific interfaces** for Create/Update/Filter data
3. **Add custom methods** for domain-specific operations
4. **Use transactions** for complex operations
5. **Leverage pagination** for large datasets
6. **Use search functionality** for user-facing queries
7. **Implement proper error handling** in your custom methods

## Examples

See the `AuthRepository` and `VenueRepository` for real-world examples of extending the base repository.
