import { CurrentUser } from '@/modules/auth/decorators';
import { JwtAuthGuard, PlayerRoleGuard } from '@/modules/auth/guards';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  BookingResponseDto,
  BookingsPageResponseDto,
} from '../dto/booking-response.dto';
import { BookingFiltersDto } from '../dto/booking-filters.dto';

// Player profile interface (assumed from auth structure)
interface PlayerProfile {
  id: string;
  email: string | null;
  phone: string | null;
  role: string | null;
}

@Controller('player/bookings')
@UseGuards(JwtAuthGuard, PlayerRoleGuard)
export class PlayerBookingController {
  constructor() {}

  // Dummy API: Get player's bookings
  @Get()
  getMyBookings(
    @CurrentUser() user: PlayerProfile,
    @Query() filters: BookingFiltersDto,
  ): BookingsPageResponseDto {
    // TODO: Implement real logic later
    return {
      bookings: [
        {
          id: 'dummy-booking-1',
          playerId: user.id,
          facilityId: 'dummy-facility-1',
          courtId: 'dummy-court-1',
          status: 'CONFIRMED',
          startAt: '2024-01-15T10:00:00Z',
          endAt: '2024-01-15T11:00:00Z',
          slotMinutes: 60,
          unitPrice: 50000,
          totalPrice: 50000,
          isRecurrence: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          court: {
            id: 'dummy-court-1',
            name: 'Court 1',
            sport: 'TENNIS',
            surface: 'HARD',
            indoor: false,
          },
          facility: {
            id: 'dummy-facility-1',
            name: 'Dummy Tennis Club',
          },
        },
      ],
      total: 1,
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages: 1,
    };
  }

  // Dummy API: Get specific booking details
  @Get(':id')
  getBookingById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: PlayerProfile,
  ): BookingResponseDto {
    // TODO: Implement real logic later
    return {
      id,
      playerId: user.id,
      facilityId: 'dummy-facility-1',
      courtId: 'dummy-court-1',
      status: 'CONFIRMED',
      startAt: '2024-01-15T10:00:00Z',
      endAt: '2024-01-15T11:00:00Z',
      slotMinutes: 60,
      unitPrice: 50000,
      totalPrice: 50000,
      isRecurrence: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      slots: [
        {
          id: 'dummy-slot-1',
          bookingId: id,
          courtId: 'dummy-court-1',
          startTime: new Date('2024-01-15T10:00:00Z'),
          endTime: new Date('2024-01-15T11:00:00Z'),
          status: 'CONFIRMED',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      court: {
        id: 'dummy-court-1',
        name: 'Court 1',
        sport: 'TENNIS',
        surface: 'HARD',
        indoor: false,
      },
      facility: {
        id: 'dummy-facility-1',
        name: 'Dummy Tennis Club',
      },
    };
  }

  // Dummy API: Get available time slots for a court
  @Get('courts/:courtId/available-slots')
  getAvailableSlots(
    @Param('courtId', ParseUUIDPipe) courtId: string,
    @Query('date') date?: string,
  ): {
    slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
    }>;
  } {
    // TODO: Implement real logic later
    const baseDate = date ? new Date(date) : new Date();
    const slots: Array<{
      startTime: string;
      endTime: string;
      available: boolean;
    }> = [];

    // Generate hourly slots from 8 AM to 10 PM
    for (let hour = 8; hour <= 22; hour++) {
      const startTime = new Date(baseDate);
      startTime.setHours(hour, 0, 0, 0);

      const endTime = new Date(baseDate);
      endTime.setHours(hour + 1, 0, 0, 0);

      slots.push({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        available: Math.random() > 0.3, // Random availability for demo
      });
    }

    return { slots };
  }

  // Dummy API: Create a booking request (players can request, owners approve)
  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  requestBooking(): { message: string; requestId: string } {
    // TODO: Implement real logic later
    return {
      message:
        'Booking request submitted successfully. Awaiting owner approval.',
      requestId: 'dummy-request-' + Math.random().toString(36).substr(2, 9),
    };
  }

  // Dummy API: Cancel own booking (if allowed by facility policy)
  @Post(':id/cancel-request')
  @HttpCode(HttpStatus.OK)
  requestCancellation(): { message: string } {
    // TODO: Implement real logic later
    return {
      message:
        'Cancellation request submitted successfully. Awaiting owner approval.',
    };
  }
}
