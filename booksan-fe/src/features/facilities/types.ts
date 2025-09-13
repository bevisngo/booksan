export interface Facility {
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
  owner: FacilityOwner
  hours: FacilityHours[]
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

export interface FacilityOwner {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
}

export interface FacilityHours {
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

export interface FacilitySearchFilters {
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

export interface FacilitySearchResult {
  facilities: Facility[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  filters: FacilitySearchFilters
}

export interface CreateFacilityRequest {
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
  hours: FacilityHours[]
  bookingSettings: BookingSettings
}

export interface UpdateFacilityRequest extends Partial<CreateFacilityRequest> {
  status?: 'active' | 'inactive'
}

export interface FacilityAvailability {
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

export interface FacilityReview {
  id: string
  facilityId: string
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

export interface FacilityStats {
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
