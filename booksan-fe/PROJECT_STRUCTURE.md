# Booksan Frontend - Project Structure

## 📁 Complete File Tree

```
booksan-fe/
├── .env.example                          # Environment variables template
├── README.md                             # Main documentation
├── PROJECT_STRUCTURE.md                  # This file
├── package.json                          # Dependencies & scripts
├── pnpm-lock.yaml                        # Lock file
├── tsconfig.json                         # TypeScript configuration (strict)
├── tailwind.config.ts                    # Tailwind with design tokens
├── next.config.ts                        # Next.js configuration
├── eslint.config.mjs                     # ESLint (strict, no any)
├── postcss.config.mjs                    # PostCSS configuration
├── vitest.config.ts                      # Vitest configuration
├── playwright.config.ts                  # Playwright E2E configuration
│
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── globals.css                   # Design system & CSS variables
│   │   ├── (public)/                     # Public routes group
│   │   │   ├── layout.tsx                # Public layout (header/footer)
│   │   │   ├── page.tsx                  # Homepage
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx        # Login page
│   │   │   │   ├── register/page.tsx     # Registration page
│   │   │   │   └── forgot-password/page.tsx
│   │   │   ├── venues/
│   │   │   │   └── search/page.tsx       # Public venue search
│   │   │   ├── about/page.tsx            # About page
│   │   │   └── contact/page.tsx          # Contact page
│   │   └── (app)/                        # Private routes group
│   │       ├── layout.tsx                # Private app layout
│   │       ├── dashboard/page.tsx        # User dashboard
│   │       ├── bookings/
│   │       │   ├── page.tsx              # Bookings list
│   │       │   └── [id]/page.tsx         # Booking details
│   │       ├── venues/
│   │       │   ├── page.tsx              # Venue management
│   │       │   └── [id]/page.tsx         # Venue details
│   │       ├── wallet/page.tsx           # Wallet management
│   │       ├── chat/page.tsx             # Chat system
│   │       ├── profile/page.tsx          # User profile
│   │       └── search/page.tsx           # Advanced search
│   │
│   ├── components/
│   │   └── ui/                           # Pure UI components
│   │       ├── button.tsx                # Button component (variants)
│   │       ├── input.tsx                 # Input with error states
│   │       ├── label.tsx                 # Form labels
│   │       ├── card.tsx                  # Card component family
│   │       ├── skeleton.tsx              # Loading skeletons
│   │       └── loading.tsx               # Loading indicators
│   │
│   ├── features/                         # Feature-first architecture
│   │   ├── auth/
│   │   │   ├── types.ts                  # Auth interfaces & types
│   │   │   ├── schema.ts                 # Zod validation schemas
│   │   │   ├── cache.ts                  # Cache invalidation logic
│   │   │   └── repo.ts                   # Data fetching & mutations
│   │   ├── venues/
│   │   │   ├── types.ts                  # Venue interfaces
│   │   │   ├── schema.ts                 # Venue validation
│   │   │   ├── cache.ts                  # Venue cache management
│   │   │   └── repo.ts                   # Venue repository
│   │   ├── bookings/
│   │   │   ├── types.ts                  # Booking interfaces
│   │   │   ├── schema.ts                 # Booking validation
│   │   │   ├── cache.ts                  # Booking cache
│   │   │   └── repo.ts                   # Booking repository
│   │   ├── wallet/                       # Payment & wallet management
│   │   ├── chat/                         # Real-time messaging
│   │   ├── profile/                      # User profile management
│   │   └── search/                       # Advanced search functionality
│   │
│   ├── lib/                              # Shared utilities
│   │   ├── env.ts                        # Environment validation (Zod)
│   │   ├── fetcher.ts                    # HTTP client with caching
│   │   ├── logger.ts                     # Structured logging
│   │   ├── time.ts                       # Date/time utilities
│   │   └── utils.ts                      # General utilities (cn, etc.)
│   │
│   ├── providers/                        # React Context providers
│   │   ├── theme-provider.tsx            # Dark/light theme
│   │   ├── query-provider.tsx            # React Query client
│   │   └── index.tsx                     # Combined providers
│   │
│   ├── middleware.ts                     # Route protection middleware
│   └── types/                            # Global type definitions
│
├── test/                                 # Testing setup
│   ├── setup.ts                          # Test configuration
│   ├── unit/                             # Unit tests
│   │   └── example.test.tsx              # Example component test
│   └── e2e/                              # End-to-end tests
│       └── example.spec.ts               # Example E2E test
│
└── public/                               # Static assets
    ├── favicon.ico
    └── images/
```

## 🏗️ Architecture Patterns

### 1. Feature-First Structure

Each feature is self-contained with:
- **types.ts**: TypeScript interfaces and types
- **schema.ts**: Zod validation schemas for forms and API
- **cache.ts**: Cache invalidation and React Query keys  
- **repo.ts**: Data fetching, mutations, and API calls

### 2. Route Groups

- **(public)**: Accessible without authentication
  - Landing page, auth forms, public venue search
- **(app)**: Requires authentication via middleware
  - Dashboard, bookings, private features

### 3. Component Architecture

- **UI Components**: Pure, reusable components in `components/ui/`
  - No data fetching
  - Consistent API with className props
  - Variant-based styling
- **Feature Components**: Business logic components within features
- **Layout Components**: Route-specific layouts

### 4. Data Flow

```
UI Component → Feature Repository → API → Cache → UI Update
     ↑                                              ↓
   Form Schema ← Validation ← User Input ← Component
```

### 5. State Management

- **Server State**: React Query for API data
- **Client State**: Zustand/Jotai for specific features only
- **Theme State**: React Context
- **Form State**: React Hook Form + Zod

## 🎯 Key Implementation Details

### Middleware Protection

```typescript
// src/middleware.ts
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  // Protect private routes
  if (pathname.startsWith('/(app)')) {
    if (!token) {
      return NextResponse.redirect('/auth/login')
    }
  }
}
```

### Repository Pattern

```typescript
// features/venues/repo.ts
class VenuesRepository {
  async searchVenues(filters: VenueSearchFilters) {
    return api.get('/venues/search', {
      tags: [VenuesCacheTags.SEARCH],
      revalidate: 300,
    })
  }
}
```

### Cache Strategy

```typescript
// features/venues/cache.ts
export const VenuesCacheTags = {
  ALL: 'venues:all',
  DETAIL: (id: string) => `venues:detail:${id}`,
  SEARCH: 'venues:search',
}

export function invalidateVenueDetailCache(venueId: string) {
  revalidateTag(VenuesCacheTags.DETAIL(venueId))
}
```

### Design System

```css
/* src/app/globals.css */
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

@theme inline {
  --color-primary: hsl(var(--primary));
  --color-background: hsl(var(--background));
}
```

## 🔧 Development Guidelines

### Adding New Features

1. Create feature directory: `src/features/[feature-name]/`
2. Define types in `types.ts`
3. Create validation schemas in `schema.ts`
4. Set up caching strategy in `cache.ts`
5. Implement repository in `repo.ts`
6. Add routes under appropriate route group
7. Create UI components as needed

### Component Creation

1. Pure UI components → `src/components/ui/`
2. Feature-specific components → within feature directory
3. Use className prop for styling
4. Implement variants with class-variance-authority
5. Add TypeScript interfaces for all props

### API Integration

1. All API calls go through feature repositories
2. Use structured caching with revalidation tags
3. Implement proper error handling
4. Add loading states and optimistic updates

### Testing Strategy

1. Unit tests for utilities and pure functions
2. Component tests for UI interactions
3. E2E tests for critical user journeys
4. Test error states and edge cases

## 📊 Performance Considerations

### Bundle Optimization

- Lazy loading for heavy components (maps, chat)
- Code splitting by route groups
- Dynamic imports for client-only features
- Tree shaking with ES modules

### Caching Strategy

- Static data: 24 hours (sports, amenities)
- User data: 5 minutes with background revalidation
- Real-time data: 1 minute (availability, bookings)
- Public pages: Static generation where possible

### Loading Performance

- Server Components by default
- Streaming with loading.tsx files
- Skeleton components for content loading
- Image optimization with next/image

This structure provides a scalable, maintainable foundation for the Booksan frontend application while following modern React and Next.js best practices.
