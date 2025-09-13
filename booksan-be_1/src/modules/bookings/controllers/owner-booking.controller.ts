import { CurrentUser } from '@/modules/auth/decorators';
import { JwtAuthGuard, OwnerRoleGuard } from '@/modules/auth/guards';
import { OwnerProfile } from '@/repositories/auth.repository';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  BookingResponseDto,
  BookingsPageResponseDto,
  BookingStatsResponseDto,
} from '../dto/booking-response.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingFiltersDto } from '../dto/booking-filters.dto';
import {
  GetBookingsQueryDto,
  CancelBookingDto,
  BookingViewType,
} from '../dto/booking-request.dto';
import {
  CreateBookingUseCase,
  GetBookingsByCourtUseCase,
  GetBookingsByFacilityUseCase,
  CancelBookingUseCase,
  GetBookingStatsUseCase,
} from '../use-cases';

@Controller('owner/bookings')
@UseGuards(JwtAuthGuard, OwnerRoleGuard)
export class OwnerBookingController {
  constructor(
    private readonly createBookingUseCase: CreateBookingUseCase,
    private readonly getBookingsByCourtUseCase: GetBookingsByCourtUseCase,
    private readonly getBookingsByFacilityUseCase: GetBookingsByFacilityUseCase,
    private readonly cancelBookingUseCase: CancelBookingUseCase,
    private readonly getBookingStatsUseCase: GetBookingStatsUseCase,
  ) {}

  // Create booking for a player (owner creates on behalf of player)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @CurrentUser() user: OwnerProfile,
  ): Promise<BookingResponseDto> {
    const facilityId = user.facilityId;
    return this.createBookingUseCase.execute(createBookingDto, facilityId);
  }

  // Get bookings for owner's facility with pagination (bookings page - day/week views only)
  @Get()
  async getFacilityBookings(
    @CurrentUser() user: OwnerProfile,
    @Query() filters: BookingFiltersDto,
    @Query() query: GetBookingsQueryDto,
  ): Promise<BookingsPageResponseDto> {
    const facilityId = user.facilityId;

    // For bookings page, only allow day and week views
    let viewType: BookingViewType | undefined;
    let viewDate: Date | undefined;

    if (
      query.view &&
      (query.view === BookingViewType.DAY ||
        query.view === BookingViewType.WEEK)
    ) {
      viewType = query.view;
      viewDate = query.startDate ? new Date(query.startDate) : new Date();
    }

    return this.getBookingsByFacilityUseCase.execute(
      facilityId,
      filters,
      viewType,
      viewDate,
    );
  }

  // Get bookings for a specific court (court detail page - all 3 views: day/week/month)
  @Get('courts/:courtId')
  async getCourtBookings(
    @Param('courtId', ParseUUIDPipe) courtId: string,
    @CurrentUser() user: OwnerProfile,
    @Query() query: GetBookingsQueryDto,
  ): Promise<BookingResponseDto[]> {
    const facilityId = user.facilityId;
    const viewType = query.view || BookingViewType.DAY;
    const viewDate = query.startDate ? new Date(query.startDate) : new Date();

    return this.getBookingsByCourtUseCase.execute(
      courtId,
      facilityId,
      viewType,
      viewDate,
    );
  }

  // Cancel a booking slot
  @Post('slots/:slotId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelBookingSlot(
    @Param('slotId', ParseUUIDPipe) slotId: string,
    @Body() cancelDto: CancelBookingDto,
    @CurrentUser() user: OwnerProfile,
  ): Promise<{ message: string }> {
    const facilityId = user.facilityId;

    await this.cancelBookingUseCase.execute(
      slotId,
      facilityId,
      cancelDto.reason,
      user.id,
    );

    return { message: 'Booking slot cancelled successfully' };
  }

  // Get booking statistics for dashboard
  @Get('stats')
  async getBookingStats(
    @CurrentUser() user: OwnerProfile,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<BookingStatsResponseDto> {
    const facilityId = user.facilityId;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.getBookingStatsUseCase.execute(facilityId, start, end);
  }

  // Get booking analytics by time periods
  @Get('analytics/by-time')
  getBookingAnalyticsByTime(
    @CurrentUser() user: OwnerProfile,
    @Query('period') period: 'day' | 'week' | 'month' = 'day',
  ): {
    labels: string[];
    data: number[];
    revenue: number[];
  } {
    // TODO: Implement analytics aggregation
    // This would aggregate bookings by hour/day/week based on period

    // Dummy implementation for now
    const labels: string[] = [];
    const data: number[] = [];
    const revenue: number[] = [];

    if (period === 'day') {
      // Hours in a day
      for (let i = 0; i < 24; i++) {
        labels.push(`${i}:00`);
        data.push(Math.floor(Math.random() * 10));
        revenue.push(Math.floor(Math.random() * 500000));
      }
    } else if (period === 'week') {
      // Days in a week
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      days.forEach(day => {
        labels.push(day);
        data.push(Math.floor(Math.random() * 50));
        revenue.push(Math.floor(Math.random() * 2000000));
      });
    } else {
      // Weeks in a month
      for (let i = 1; i <= 4; i++) {
        labels.push(`Week ${i}`);
        data.push(Math.floor(Math.random() * 200));
        revenue.push(Math.floor(Math.random() * 8000000));
      }
    }

    return { labels, data, revenue };
  }

  // Get popular time slots
  @Get('analytics/popular-slots')
  getPopularTimeSlots(): {
    timeSlots: Array<{
      hour: number;
      count: number;
      revenue: number;
    }>;
  } {
    // TODO: Implement real analytics

    // Dummy data for popular time slots
    const timeSlots: Array<{
      hour: number;
      count: number;
      revenue: number;
    }> = [];
    for (let hour = 6; hour <= 23; hour++) {
      timeSlots.push({
        hour,
        count: Math.floor(Math.random() * 100),
        revenue: Math.floor(Math.random() * 1000000),
      });
    }

    return { timeSlots };
  }

  // Get court utilization rates
  @Get('analytics/court-utilization')
  getCourtUtilization(): {
    courts: Array<{
      courtId: string;
      courtName: string;
      utilizationRate: number;
      totalBookings: number;
      revenue: number;
    }>;
  } {
    // TODO: Implement real analytics

    // Dummy data for court utilization
    const courts = [
      {
        courtId: 'court-1',
        courtName: 'Court 1',
        utilizationRate: 75.5,
        totalBookings: 45,
        revenue: 2250000,
      },
      {
        courtId: 'court-2',
        courtName: 'Court 2',
        utilizationRate: 68.2,
        totalBookings: 38,
        revenue: 1900000,
      },
    ];

    return { courts };
  }
}
