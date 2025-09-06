import { api } from '@/lib/fetcher'
import { BookingsCacheTags } from './cache'
import type { Booking, CreateBookingRequest, UpdateBookingRequest, BookingFilters } from './types'

class BookingsRepository {
  async getBookings(filters: BookingFilters = {}): Promise<{ bookings: Booking[]; total: number }> {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status.join(','))
    if (filters.dateRange) {
      params.append('startDate', filters.dateRange.start)
      params.append('endDate', filters.dateRange.end)
    }
    if (filters.venueId) params.append('venueId', filters.venueId)
    params.append('page', (filters.page || 1).toString())
    params.append('limit', (filters.limit || 20).toString())

    return api.get(`/bookings?${params.toString()}`, {
      tags: [BookingsCacheTags.ALL],
      revalidate: 60,
    })
  }

  async getBookingById(id: string): Promise<Booking> {
    return api.get(`/bookings/${id}`, {
      tags: [BookingsCacheTags.DETAIL(id)],
      revalidate: 60,
    })
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    return api.post('/bookings', data, {
      tags: [BookingsCacheTags.ALL],
    })
  }

  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    return api.patch(`/bookings/${id}`, data, {
      tags: [BookingsCacheTags.DETAIL(id), BookingsCacheTags.ALL],
    })
  }

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const updateData: UpdateBookingRequest = { status: 'cancelled' }
    if (reason) {
      updateData.cancellationReason = reason
    }
    return this.updateBooking(id, updateData)
  }
}

export const bookingsRepo = new BookingsRepository()
