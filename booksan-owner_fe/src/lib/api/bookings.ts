import { apiClient } from '@/lib/api';
import type {
  Booking,
  CreateBookingData,
  UpdateBookingData,
  BookingFilters,
  BookingsResponse,
  PriceSimulation,
  AvailabilityResponse,
} from '@/types/booking';

export class BookingApi {
  static async getBookings(filters: BookingFilters = {}): Promise<BookingsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/bookings${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<BookingsResponse>(endpoint);
  }

  static async getBooking(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  }

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    return apiClient.post<Booking>('/bookings', data);
  }

  static async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  }

  static async cancelBooking(id: string, reason: string): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}/cancel`, { reason });
  }

  static async simulatePrice(data: {
    courtId: string;
    date: string;
    startTime: string;
    duration: number;
  }): Promise<PriceSimulation> {
    return apiClient.post<PriceSimulation>('/bookings/simulate-price', data);
  }

  static async getAvailability(courtId: string, date: string): Promise<AvailabilityResponse> {
    return apiClient.get<AvailabilityResponse>(`/bookings/availability/${courtId}/${date}`);
  }

  static async markAsPaid(id: string, paid: boolean): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}/payment`, { isPaid: paid });
  }

  static async exportBookingsCSV(filters: BookingFilters = {}): Promise<Blob> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/bookings/export${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${apiClient['baseUrl']}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${await this.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export bookings');
    }

    return response.blob();
  }

  private static async getToken(): Promise<string | null> {
    // This would normally get the token from cookies
    // For now, we'll return null and let the apiClient handle it
    return null;
  }
}

export const bookingApi = BookingApi;
