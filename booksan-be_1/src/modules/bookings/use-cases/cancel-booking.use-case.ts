import { Injectable } from '@nestjs/common';
import { BookingService } from '../services/booking.service';

@Injectable()
export class CancelBookingUseCase {
  constructor(private readonly bookingService: BookingService) {}

  async execute(
    bookingSlotId: string,
    facilityId: string,
    cancelReason: string,
    cancelledBy: string,
  ): Promise<void> {
    return this.bookingService.cancelBookingSlot(
      bookingSlotId,
      facilityId,
      cancelReason,
      cancelledBy,
    );
  }
}
