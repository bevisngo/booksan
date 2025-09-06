export interface Venue {
  id: string
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  phone: string
  email: string
  website?: string
  images: string[]
  amenities: string[]
  sports: Sport[]
  priceRange: {
    min: number
    max: number
  }
  rating: number
  reviewCount: number
  ownerId: string
  owner: VenueOwner
  hours: VenueHours[]
  bookingSettings: BookingSettings
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
  updatedAt: string
}

export interface Sport {
  id: string
  name: string
  icon: string
  category: string
}

export interface VenueOwner {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

export interface VenueHours {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  openTime: string // HH:mm format
  closeTime: string // HH:mm format
  isOpen: boolean
}

export interface BookingSettings {
  advanceBookingDays: number
  cancellationPolicy: 'flexible' | 'moderate' | 'strict'
  minimumBookingDuration: number // in minutes
  maximumBookingDuration: number // in minutes
  requiresApproval: boolean
  allowInstantBooking: boolean
}

export interface VenueSearchFilters {
  query?: string
  location?: {
    latitude: number
    longitude: number
    radius: number // in km
  }
  sports?: string[]
  priceRange?: {
    min: number
    max: number
  }
  amenities?: string[]
  availableDate?: string
  availableTime?: {
    start: string
    end: string
  }
  rating?: number
  sortBy?: 'distance' | 'price' | 'rating' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface VenueSearchResult {
  venues: Venue[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters: VenueSearchFilters
}

export interface CreateVenueRequest {
  name: string
  description: string
  address: string
  latitude: number
  longitude: number
  phone: string
  email: string
  website?: string
  images: string[]
  amenities: string[]
  sports: string[]
  priceRange: {
    min: number
    max: number
  }
  hours: VenueHours[]
  bookingSettings: BookingSettings
}

export interface UpdateVenueRequest extends Partial<CreateVenueRequest> {
  status?: 'active' | 'inactive'
}

export interface VenueAvailability {
  date: string
  timeSlots: TimeSlot[]
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
  price: number
  bookingId?: string
}

export interface VenueReview {
  id: string
  venueId: string
  userId: string
  user: {
    name: string
    avatar?: string
  }
  rating: number
  comment: string
  images?: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateReviewRequest {
  rating: number
  comment: string
  images?: string[]
}

export interface VenueStats {
  totalBookings: number
  totalRevenue: number
  averageRating: number
  occupancyRate: number
  popularTimes: Array<{
    hour: number
    bookingCount: number
  }>
  monthlyStats: Array<{
    month: string
    bookings: number
    revenue: number
  }>
}
