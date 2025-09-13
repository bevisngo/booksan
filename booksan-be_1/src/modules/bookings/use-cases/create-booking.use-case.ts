import { Injectable } from '@nestjs/common';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingResponseDto } from '../dto/booking-response.dto';

@Injectable()
export class CreateBookingUseCase {
  constructor(private readonly bookingService: BookingService) {}

  async execute(
    createBookingDto: CreateBookingDto,
    facilityId: string,
  ): Promise<BookingResponseDto> {
    return this.bookingService.createBooking(createBookingDto, facilityId);
  }
}
