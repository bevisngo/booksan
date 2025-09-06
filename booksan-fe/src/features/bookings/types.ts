export interface Booking {
  id: string
  venueId: string
  venue: {
    id: string
    name: string
    address: string
    images: string[]
  }
  userId: string
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  totalPrice: number
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

export interface CreateBookingRequest {
  venueId: string
  startTime: string
  endTime: string
  notes?: string
}

export interface UpdateBookingRequest {
  status?: 'confirmed' | 'cancelled'
  cancellationReason?: string
}

export interface BookingFilters {
  status?: string[]
  dateRange?: {
    start: string
    end: string
  }
  venueId?: string
  page?: number
  limit?: number
}
