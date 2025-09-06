# Prisma ORM Setup Guide

This project uses Prisma as the ORM (Object-Relational Mapping) tool for database operations.

## 🚀 Quick Start

### 1. Environment Setup
Create a `.env` file in your project root with the following content:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/booksan_db?schema=public"
PORT=3000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 2. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Or create and run migrations (for production)
npm run db:migrate
```

### 3. Seed Database
```bash
npm run db:seed
```

## 📚 Available Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database (development)
- `npm run db:migrate` - Create and run migrations
- `npm run db:migrate:deploy` - Deploy migrations to production
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

## 🏗️ Database Models

### User
- **Fields**: id, email, name, password, role, createdAt, updatedAt
- **Roles**: USER, ADMIN, VENUE_OWNER
- **Relations**: Has many bookings and venues (if owner)

### Venue
- **Fields**: id, name, description, address, capacity, pricePerHour, isActive, ownerId, createdAt, updatedAt
- **Relations**: Belongs to owner (User), has many bookings

### Booking
- **Fields**: id, startTime, endTime, totalPrice, status, userId, venueId, createdAt, updatedAt
- **Status**: PENDING, CONFIRMED, CANCELLED, COMPLETED
- **Relations**: Belongs to user and venue

## 🔧 Usage in NestJS

### 1. Inject PrismaService
```typescript
import { PrismaService } from '../core/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { bookings: true }
    });
  }
}
```

### 2. Complex Queries
```typescript
// Find venues with available time slots
const availableVenues = await this.prisma.venue.findMany({
  where: {
    isActive: true,
    bookings: {
      none: {
        OR: [
          {
            startTime: { lte: new Date('2024-12-20T12:00:00Z') },
            endTime: { gte: new Date('2024-12-20T09:00:00Z') }
          }
        ]
      }
    }
  },
  include: {
    owner: {
      select: { name: true, email: true }
    }
  }
});
```

### 3. Transactions
```typescript
const result = await this.prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: { email: 'user@example.com', name: 'John Doe' }
  });
  
  const venue = await tx.venue.create({
    data: { name: 'Meeting Room', ownerId: user.id }
  });
  
  return { user, venue };
});
```

## 🛡️ Best Practices

1. **Always use transactions** for operations that modify multiple records
2. **Include only necessary fields** using `select` or `include`
3. **Use proper indexing** on frequently queried fields
4. **Handle errors gracefully** with try-catch blocks
5. **Validate input data** before database operations

## 🔍 Prisma Studio

Open Prisma Studio to visually explore and edit your database:
```bash
npm run db:studio
```

## 📝 Migration Workflow

1. **Development**: Use `db:push` for quick schema changes
2. **Production**: Use `db:migrate` to create proper migration files
3. **Deployment**: Use `db:migrate:deploy` to apply migrations

## 🚨 Troubleshooting

### Common Issues

1. **Client not generated**: Run `npm run db:generate`
2. **Schema sync issues**: Run `npm run db:push` or `npm run db:migrate`
3. **Connection errors**: Check your `DATABASE_URL` in `.env`
4. **Type errors**: Regenerate Prisma client after schema changes

### Reset Database
```bash
# Drop and recreate database (⚠️ DESTRUCTIVE)
npx prisma migrate reset

# Or drop all tables
npx prisma db push --force-reset
```

## 📖 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [NestJS + Prisma Integration](https://docs.nestjs.com/techniques/database)
