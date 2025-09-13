export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';

export interface Player {
  id: string;
  fullname: string;
  email?: string;
  phone?: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  status: BookingStatus;

  // Court and timing
  courtId: string;
  courtName: string;
  date: string; // ISO date string
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  duration: number; // minutes

  // Player information
  player: Player;

  // Pricing
  basePrice: number;
  totalAmount: number;

  // Metadata
  notes?: string;
  cancelReason?: string;
  isPaid?: boolean;
  createdAt: string;
  updatedAt: string;

  // Owner information
  ownerId: string;
}

export interface CreateBookingData {
  courtId: string;
  playerId?: string; // If existing player
  playerData?: {
    fullname: string;
    email?: string;
    phone?: string;
  };
  date: string;
  startTime: string;
  duration: number;
  notes?: string;
}

export interface UpdateBookingData {
  date?: string;
  startTime?: string;
  duration?: number;
  notes?: string;
  status?: BookingStatus;
}

export interface BookingFilters {
  search?: string; // Search in player name, email, phone, booking code
  courtId?: string;
  status?: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface BookingsResponse {
  bookings: Booking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PriceSimulation {
  basePrice: number;
  totalAmount: number;
  breakdown: {
    duration: number;
    pricePerHour: number;
    subtotal: number;
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  existingBookingId?: string;
}

export interface AvailabilityResponse {
  date: string;
  courtId: string;
  slots: TimeSlot[];
}

export const BOOKING_STATUSES = [
  { value: 'PENDING' as BookingStatus, label: 'Pending', color: 'orange' },
  { value: 'CONFIRMED' as BookingStatus, label: 'Confirmed', color: 'green' },
  { value: 'CANCELED' as BookingStatus, label: 'Canceled', color: 'red' },
  { value: 'COMPLETED' as BookingStatus, label: 'Completed', color: 'blue' },
] as const;
