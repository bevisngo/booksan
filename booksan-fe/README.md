# Booksan Frontend - Player Web App

A modern Next.js App Router application for booking sports venues, built with TypeScript, TailwindCSS, and a feature-first architecture.

## 🏗️ Architecture Overview

This project follows a clean, feature-first architecture that prioritizes maintainability, scalability, and developer experience.

### Key Principles

- **Feature-First Structure**: Each feature (auth, bookings, venues, etc.) is self-contained with its own types, schemas, caching, and repository logic
- **Server Components by Default**: Leverages Next.js App Router with Server Components for optimal performance
- **Route-Based Architecture**: Separates public routes `/(public)` from private routes `/(app)` with middleware protection
- **Type Safety**: Strict TypeScript configuration with no `any` types allowed
- **Design System**: CSS variables mapped to Tailwind for theming and consistency

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (landing, auth)
│   ├── (app)/             # Private routes (dashboard, bookings)
│   ├── globals.css        # Global styles with design tokens
│   └── layout.tsx         # Root layout with providers
├── components/
│   └── ui/               # Pure, reusable UI components
├── features/             # Feature-first modules
│   ├── auth/
│   ├── bookings/
│   ├── venues/
│   ├── wallet/
│   ├── chat/
│   ├── profile/
│   └── search/
│       ├── types.ts      # TypeScript interfaces
│       ├── schema.ts     # Zod validation schemas
│       ├── cache.ts      # Cache invalidation logic
│       └── repo.ts       # Data fetching & mutations
├── lib/                  # Shared utilities
│   ├── env.ts           # Environment validation
│   ├── fetcher.ts       # HTTP client with caching
│   ├── logger.ts        # Logging utility
│   ├── time.ts          # Date/time utilities
│   └── utils.ts         # General utilities
├── providers/            # React Context providers
│   ├── theme-provider.tsx
│   ├── query-provider.tsx
│   └── index.tsx
├── middleware.ts         # Route protection
└── types/               # Global type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository>
cd booksan-fe
pnpm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

3. **Start development server:**
```bash
pnpm dev
```

The app will be available at `http://localhost:8081`

### Available Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix linting issues
pnpm type-check       # Run TypeScript compiler

# Testing
pnpm test             # Run unit tests with Vitest
pnpm test:ui          # Run tests with UI
pnpm test:e2e         # Run E2E tests with Playwright
pnpm test:e2e:ui      # Run E2E tests with UI
```

## 🎨 Design System

### CSS Variables

The design system uses CSS variables for colors, spacing, and typography, mapped to Tailwind utilities:

```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
```

### Theme Support

- Light/Dark mode with system preference detection
- Consistent spacing scale using CSS variables
- Typography system with custom font loading
- Color palette with semantic naming

### Components

Pure UI components in `components/ui/` with:
- Consistent API using `className` props
- Variant-based styling with `class-variance-authority`
- Accessibility features built-in
- TypeScript interfaces for all props

## 🏛️ Feature Architecture

### Repository Pattern

Each feature uses a repository class for data operations:

```typescript
// features/venues/repo.ts
class VenuesRepository {
  async searchVenues(filters: VenueSearchFilters): Promise<VenueSearchResult> {
    return api.get('/venues/search', {
      tags: [VenuesCacheTags.SEARCH],
      revalidate: 300,
    })
  }
}
```

### Cache Management

Structured cache invalidation with Next.js:

```typescript
// features/venues/cache.ts
export const VenuesCacheTags = {
  ALL: 'venues:all',
  DETAIL: (id: string) => `venues:detail:${id}`,
  SEARCH: 'venues:search',
} as const

export function invalidateVenueDetailCache(venueId: string) {
  revalidateTag(VenuesCacheTags.DETAIL(venueId))
}
```

### Schema Validation

Zod schemas for runtime validation and TypeScript inference:

```typescript
// features/auth/schema.ts
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>
```

## 🔒 Security & Performance

### Route Protection

Middleware-based authentication for private routes:
- Public routes: `/(public)/*` - accessible without authentication
- Private routes: `/(app)/*` - require valid session
- Automatic redirects to login with return URLs

### Performance Optimizations

- **Server Components**: Default rendering strategy for better performance
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js Image component with WebP/AVIF
- **Caching Strategy**: Differentiated cache times for different data types
- **Bundle Analysis**: Optional webpack bundle analyzer

### Type Safety

- Strict TypeScript configuration
- No `any` types allowed in production code
- Runtime validation with Zod schemas
- Environment variable validation

## 🧪 Testing Strategy

### Unit Testing (Vitest)

- Component testing with React Testing Library
- Utility function testing
- Mock strategies for external dependencies

### E2E Testing (Playwright)

- Critical user journeys
- Multi-browser testing
- Mobile responsiveness testing
- Accessibility testing

### Test Organization

```
test/
├── unit/           # Unit tests alongside source
├── e2e/           # End-to-end test scenarios
└── setup.ts       # Test configuration & mocks
```

## 🌐 State Management

### Server State (React Query)

- API data caching and synchronization
- Background refetching
- Optimistic updates
- Error boundary integration

### Client State (Minimal)

- Zustand/Jotai for specific features only
- Theme state in React Context
- Form state with native form handling

### State Philosophy

- **Server state first**: Most data lives on the server
- **Minimal client state**: Only UI-specific state on client
- **Feature isolation**: Each feature manages its own state

## 🚢 Deployment

### Production Build

```bash
pnpm build
pnpm start
```

### Environment Variables

Required for production:
- `NEXT_PUBLIC_API_URL`: Backend API endpoint
- `NEXTAUTH_SECRET`: Authentication secret
- `DATABASE_URL`: Database connection string

### Docker Support

```dockerfile
# Example Dockerfile structure
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

### Code Style

- ESLint with strict TypeScript rules
- Prettier for consistent formatting
- Import organization with automatic sorting
- Conventional commit messages

### Pull Request Process

1. Create feature branch from `main`
2. Implement changes with tests
3. Run full test suite
4. Submit PR with description
5. Code review and merge

### Development Workflow

1. **Feature Development**: Create new features in `src/features/`
2. **Component Creation**: Pure UI components in `src/components/ui/`
3. **Type Definitions**: Shared types in `src/types/`
4. **Testing**: Unit tests for utilities, E2E for user flows

## 📚 Additional Resources

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zod Documentation](https://zod.dev/)
- [Playwright Documentation](https://playwright.dev/)

## 🐛 Common Issues

### Development

- **Port conflicts**: App runs on port 8081 by default
- **Environment variables**: Copy `.env.example` to `.env.local`
- **Type errors**: Run `pnpm type-check` for detailed TypeScript errors

### Build Issues

- **Memory issues**: Increase Node.js memory: `NODE_OPTIONS="--max-old-space-size=4096"`
- **Import errors**: Check path aliases in `tsconfig.json`

## 📄 License

This project is proprietary software. All rights reserved.