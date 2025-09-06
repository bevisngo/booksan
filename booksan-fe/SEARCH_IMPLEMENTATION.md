# Search & Filter Implementation with Infinite Scroll

## Overview

This implementation provides a complete search and filter system with infinite scroll using Next.js App Router and Server Actions. The backend URL is never exposed to the browser, and the first page is SSR for SEO.

## Architecture

### 🔧 **Server-Side Components**

#### 1. **Internal Fetch Helper** (`/src/lib/http/internalFetch.ts`)
- Server-to-server communication with NestJS backend
- Never exposes backend URL to browser
- Includes timeout, error handling, and proper headers
- Only works on server side (throws error if called in browser)

#### 2. **Search Params Utilities** (`/src/lib/search/params.ts`)
- Parse and validate search parameters
- Convert to API parameters for NestJS
- Build canonical URLs for SEO
- Handle parameter clamping (radius max 50km, etc.)
- Generate page titles and descriptions

#### 3. **SEO Structured Data** (`/src/lib/seo/structuredData.ts`)
- Generate JSON-LD for ItemList and BreadcrumbList
- OpenGraph and Twitter Card metadata
- Venue-specific structured data
- Breadcrumb navigation

#### 4. **Server Actions** (`/src/app/(search)/actions.ts`)
- `fetchInitialVenues()` - SSR initial page
- `fetchNextVenuesPage()` - Infinite scroll pagination
- `searchVenuesWithFilters()` - New search with filters
- Cursor-based pagination support

### 🎨 **Client-Side Components**

#### 1. **VenueListClient** (`/src/components/venue/VenueListClient.tsx`)
- Infinite scroll using IntersectionObserver
- Loading states with skeleton UI
- Error handling with retry functionality
- Cursor-based pagination
- Automatic loading when user scrolls near bottom

#### 2. **SearchFilters** (`/src/components/venue/SearchFilters.tsx`)
- URL-based filter state management
- Debounced text search
- Immediate updates for dropdowns/switches
- Filter reset functionality
- Visual indicator for active filters

#### 3. **SearchFiltersWrapper** (`/src/components/venue/SearchFiltersWrapper.tsx`)
- Client wrapper for filter state management
- Separates server and client concerns

### 🛣️ **Routing Structure**

#### Search Route: `/venues/search/page.tsx`
- `/venues` - Redirects to `/venues/search`
- `/venues/search` - Main search page with all filters
- All filtering is done via query parameters

#### Query Parameters
- `q` - Text search
- `sport` - Sport filter (enum validated)
- `city` - City filter
- `district` - District filter  
- `lat`, `lng` - Location coordinates (triggers noindex)
- `radius_km` - Search radius (default 10, max 50)
- `open_now` - Currently open filter
- `price_min`, `price_max` - Price range
- `sort` - Sort order (default, distance, price_asc, price_desc, rating_desc)
- `page` - Page number for SEO pagination
- `cursor` - Cursor for infinite scroll

## 🚀 **Features**

### ✅ **SEO Optimization**
- **SSR First Page**: Page 1 is server-rendered with full HTML
- **Canonical URLs**: Clean URLs without sensitive data
- **No-Index Rule**: Pages with lat/lng coordinates are noindexed
- **JSON-LD**: ItemList and BreadcrumbList structured data
- **Meta Tags**: Dynamic titles, descriptions, OpenGraph, Twitter Cards
- **Breadcrumbs**: Hierarchical navigation structure

### ✅ **Performance**
- **Infinite Scroll**: Smooth pagination without full page reloads
- **Cursor Pagination**: Efficient database queries
- **Server Actions**: Fast server-to-server communication
- **Skeleton Loading**: Improved perceived performance
- **Debounced Search**: Reduced API calls for text input

### ✅ **Security**
- **Hidden Backend**: NestJS URL never exposed to browser
- **Server-Only Fetch**: Internal API calls only work server-side
- **Parameter Validation**: All inputs validated and clamped
- **Error Handling**: Graceful degradation on failures

### ✅ **User Experience**
- **Real-time Filters**: Immediate URL updates and results
- **Progressive Loading**: Load more content as user scrolls
- **Filter State**: Filters persist in URL for sharing/bookmarking
- **Error Recovery**: Retry buttons for failed requests
- **Loading States**: Clear visual feedback during operations

## 📱 **Usage Examples**

### Basic Search
```
GET /venues/search
→ Shows all venues, SSR page 1
```

### Sport Filter
```
GET /venues/search?sport=tennis
→ Shows tennis venues, SSR page 1
```

### Location + Query Parameters
```
GET /venues/search?sport=tennis&city=london&q=indoor&price_max=100&open_now=true
→ Indoor tennis venues in London under $100, currently open
```

### With Coordinates (No-Index)
```
GET /venues/search?lat=51.5074&lng=-0.1278&radius_km=5
→ Venues within 5km of coordinates (noindex for privacy)
```

## 🔄 **Data Flow**

### 1. **Initial Page Load (SSR)**
1. User visits `/venues/search?sport=tennis&city=london`
2. `generateMetadata()` builds SEO metadata
3. `fetchInitialVenues()` gets page 1 from NestJS
4. Page renders with venues + structured data
5. Client hydrates with infinite scroll capability

### 2. **Filter Change**
1. User changes filter (e.g., price range)
2. URL updates immediately
3. Browser navigates to new URL
4. SSR renders new page 1 with updated filters
5. Client hydrates with new data

### 3. **Infinite Scroll**
1. User scrolls near bottom
2. IntersectionObserver triggers
3. `fetchNextVenuesPage()` called with cursor
4. More venues appended to existing list
5. Process repeats until no more results

## 🎯 **Key Benefits**

- **SEO-Friendly**: First page always SSR with proper metadata
- **Fast Loading**: Infinite scroll prevents full page reloads
- **Secure**: Backend URL never exposed to browser
- **Scalable**: Cursor-based pagination handles large datasets
- **User-Friendly**: Filters persist in URL for sharing
- **Mobile-Optimized**: Touch-friendly infinite scroll
- **Accessible**: Proper ARIA labels and keyboard navigation

## 📁 **File Structure**

```
src/
├── app/(search)/
│   ├── actions.ts                    # Server Actions
│   └── venues/
│       ├── page.tsx                  # Redirect to search
│       └── search/
│           └── page.tsx              # Main search page
├── components/venue/
│   ├── VenueListClient.tsx          # Infinite scroll component
│   ├── SearchFilters.tsx            # Filter controls
│   └── SearchFiltersWrapper.tsx     # Client wrapper
├── lib/
│   ├── http/
│   │   └── internalFetch.ts         # Server-to-server fetch
│   ├── search/
│   │   └── params.ts                # Parameter utilities
│   └── seo/
│       └── structuredData.ts        # SEO structured data
└── features/search/
    └── types.ts                     # TypeScript interfaces
```

This implementation provides a production-ready search system that combines the best of SSR for SEO with modern UX patterns like infinite scroll, all while maintaining security by never exposing backend URLs to the browser.
