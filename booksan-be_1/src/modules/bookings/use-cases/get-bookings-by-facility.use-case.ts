import { Injectable } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { BookingsPageResponseDto } from '../dto/booking-response.dto';
import { BookingFiltersDto } from '../dto/booking-filters.dto';
import { BookingViewType } from '../dto/booking-request.dto';

@Injectable()
export class GetBookingsByFacilityUseCase {
  constructor(private readonly bookingService: BookingService) {}

  async execute(
    facilityId: string,
    filters: BookingFiltersDto,
    viewType?: BookingViewType,
    viewDate?: Date,
  ): Promise<BookingsPageResponseDto> {
    return this.bookingService.getBookingsByFacility(
      facilityId,
      filters,
      viewType,
      viewDate,
    );
  }
}
