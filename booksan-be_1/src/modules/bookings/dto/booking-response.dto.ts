export class BookingSlotResponseDto {
  id: string;
  bookingId: string;
  courtId: string;
  startTime: Date;
  endTime: Date;
  status: string;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingParticipantResponseDto {
  id: string;
  userId: string;
  role: string;
  status: string;
  user?: {
    id: string;
    fullname: string;
    email?: string;
    phone?: string;
  };
}

export class BookingResponseDto {
  id: string;
  playerId: string;
  facilityId: string;
  courtId: string;
  status: string;
  startAt: string;
  endAt: string;
  slotMinutes: number;
  unitPrice: number;
  totalPrice: number;
  isRecurrence: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  slots?: BookingSlotResponseDto[];
  participants?: BookingParticipantResponseDto[];
  player?: {
    id: string;
    fullname: string;
    email?: string;
    phone?: string;
  };
  court?: {
    id: string;
    name: string;
    sport: string;
    surface?: string;
    indoor: boolean;
  };
  facility?: {
    id: string;
    name: string;
  };
}

export class BookingStatsResponseDto {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
}

export class BookingsPageResponseDto {
  bookings: BookingResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
