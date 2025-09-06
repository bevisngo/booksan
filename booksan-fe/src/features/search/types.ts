// Enums matching the backend DTO
export enum Sport {
  TENNIS = 'TENNIS',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  BADMINTON = 'BADMINTON',
  VOLLEYBALL = 'VOLLEYBALL',
  SWIMMING = 'SWIMMING',
  TABLE_TENNIS = 'TABLE_TENNIS',
  SQUASH = 'SQUASH',
  GOLF = 'GOLF',
  CRICKET = 'CRICKET',
  HOCKEY = 'HOCKEY',
  RUGBY = 'RUGBY',
  BASEBALL = 'BASEBALL',
  SOFTBALL = 'SOFTBALL',
  TRACK_AND_FIELD = 'TRACK_AND_FIELD',
  GYM = 'GYM',
  YOGA = 'YOGA',
  PILATES = 'PILATES',
  MARTIAL_ARTS = 'MARTIAL_ARTS',
  DANCE = 'DANCE',
  OTHER = 'OTHER'
}

export enum SortBy {
  RELEVANCE = 'relevance',
  DISTANCE = 'distance',
  PRICE = 'price',
  RATING = 'rating',
  NAME = 'name',
  CREATED_AT = 'created_at'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// Search parameters matching the backend DTO
export interface SearchVenuesParams {
  keyword?: string
  lat?: number
  lon?: number
  maxDistance?: string
  sport?: Sport
  isPublished?: boolean
  sortBy?: SortBy
  sortOrder?: SortOrder
  limit?: number
  offset?: number
}

// Search result item interface
export interface SearchResultItem {
  venue: Venue
  score: number
}

// Search result metadata interface
export interface SearchMeta {
  limit: number
  offset: number
  hasMore: boolean
}

// Search result interface matching API response
export interface SearchVenuesResponse {
  data: SearchResultItem[]
  maxScore: number
  meta: SearchMeta
  total: number
  nextCursor?: string
}

// Court interface for venue courts
export interface Court {
  id: string
  name: string
  sport: Sport
  indoor: boolean
  isActive: boolean
}

// Location interface for venue coordinates
export interface VenueLocation {
  lat: number
  lon: number
}

// Venue interface matching API response
export interface Venue {
  id: string
  name: string
  address: string
  courts: Court[]
  createdAt: string
  isPublished: boolean
  location: VenueLocation
  ownerId: string
  updatedAt: string
  // Optional fields that might be added later
  description?: string
  phone?: string
  email?: string
  website?: string
  images?: string[]
  amenities?: string[]
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  reviewCount?: number
  distance?: number // Distance in km when location is provided
}

// Location interface for geolocation
export interface Location {
  latitude: number
  longitude: number
  accuracy?: number
  timestamp?: number
}

// Search filters for UI
export interface SearchFilters {
  query?: string
  location?: Location
  maxDistance: string
  sport?: Sport
  isPublished: boolean
  sortBy: SortBy
  sortOrder: SortOrder
  limit: number
  offset: number
}

// Geolocation error types
export interface GeolocationError {
  code: number
  message: string
}

export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const

// Server Action types
export interface ServerActionResult<T> {
  success: boolean
  data?: T
  error?: string
}

export interface VenueSearchResult {
  venues: Venue[]
  total: number
  nextCursor?: string
  hasMore: boolean
}
