import { Injectable } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { BookingStatsResponseDto } from '../dto/booking-response.dto';

@Injectable()
export class GetBookingStatsUseCase {
  constructor(private readonly bookingService: BookingService) {}

  async execute(
    facilityId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BookingStatsResponseDto> {
    return this.bookingService.getBookingStats(facilityId, startDate, endDate);
  }
}
