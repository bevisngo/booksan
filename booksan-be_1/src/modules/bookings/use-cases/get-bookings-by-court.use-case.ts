import { Injectable } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { BookingResponseDto } from '../dto/booking-response.dto';
import { BookingViewType } from '../dto/booking-request.dto';

@Injectable()
export class GetBookingsByCourtUseCase {
  constructor(private readonly bookingService: BookingService) {}

  async execute(
    courtId: string,
    facilityId: string,
    viewType: BookingViewType = BookingViewType.DAY,
    viewDate: Date = new Date(),
  ): Promise<BookingResponseDto[]> {
    const { startDate, endDate } = this.getDateRangeForView(viewType, viewDate);
    return this.bookingService.getBookingsByCourtAndDate(
      courtId,
      startDate,
      endDate,
      facilityId,
    );
  }

  private getDateRangeForView(
    viewType: BookingViewType,
    viewDate: Date,
  ): { startDate: Date; endDate: Date } {
    const startOfDay = new Date(viewDate);
    startOfDay.setHours(0, 0, 0, 0);

    switch (viewType) {
      case BookingViewType.DAY: {
        const endOfDay = new Date(viewDate);
        endOfDay.setHours(23, 59, 59, 999);
        return { startDate: startOfDay, endDate: endOfDay };
      }

      case BookingViewType.WEEK: {
        const startOfWeek = new Date(startOfDay);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return { startDate: startOfWeek, endDate: endOfWeek };
      }

      case BookingViewType.MONTH: {
        const startOfMonth = new Date(
          viewDate.getFullYear(),
          viewDate.getMonth(),
          1,
        );
        const endOfMonth = new Date(
          viewDate.getFullYear(),
          viewDate.getMonth() + 1,
          0,
        );
        endOfMonth.setHours(23, 59, 59, 999);

        return { startDate: startOfMonth, endDate: endOfMonth };
      }

      default:
        return {
          startDate: startOfDay,
          endDate: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        };
    }
  }
}
