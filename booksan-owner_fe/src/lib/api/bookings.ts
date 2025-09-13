import { apiClient } from '@/lib/api';
import { AuthCookieService } from '@/lib/cookie-service';
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
    const endpoint = `/owner/bookings${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<BookingsResponse>(endpoint);
  }

  static async getCourtBookings(
    courtId: string, 
    filters: { view?: 'day' | 'week' | 'month'; startDate?: string } = {}
  ): Promise<any[]> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/owner/bookings/courts/${courtId}${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<any[]>(endpoint);
  }

  static async getBooking(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/bookings/${id}`);
  }

  static async createBooking(data: CreateBookingData): Promise<Booking> {
    return apiClient.post<Booking>('/owner/bookings', data);
  }

  static async updateBooking(id: string, data: UpdateBookingData): Promise<Booking> {
    return apiClient.put<Booking>(`/bookings/${id}`, data);
  }

  static async cancelBooking(slotId: string, reason: string): Promise<void> {
    return apiClient.post(`/owner/bookings/slots/${slotId}/cancel`, { reason });
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
    
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
    const accessToken = AuthCookieService.getAccessToken();

    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to export bookings');
    }

    return response.blob();
  }

}

export const bookingApi = BookingApi;
