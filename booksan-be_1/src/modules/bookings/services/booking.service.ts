import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BookingRepository } from '@/repositories/booking.repository';
import {
  BookingResponseDto,
  BookingStatsResponseDto,
  BookingsPageResponseDto,
} from '../dto/booking-response.dto';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingFiltersDto } from '../dto/booking-filters.dto';
import { BookingViewType } from '../dto/booking-request.dto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingRepository: BookingRepository,
  ) {}

  async createBooking(
    createBookingDto: CreateBookingDto,
    facilityId: string,
  ): Promise<BookingResponseDto> {
    const {
      courtId,
      playerId,
      slots,
      unitPrice,
      totalPrice,
      slotMinutes,
      isRecurrence,
    } = createBookingDto;

    // Verify court belongs to facility
    const court = await this.prisma.court.findFirst({
      where: { id: courtId, facilityId },
    });

    if (!court) {
      throw new NotFoundException(
        'Court not found or does not belong to this facility',
      );
    }

    // Verify player exists
    const player = await this.prisma.user.findFirst({
      where: { id: playerId, role: 'PLAYER' },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    // Prepare booking data
    const bookingData = {
      playerId,
      facilityId,
      courtId,
      startAt: slots[0].startTime,
      endAt: slots[slots.length - 1].endTime,
      slotMinutes: slotMinutes || court.slotMinutes,
      unitPrice,
      totalPrice,
      isRecurrence: isRecurrence || false,
      status: 'CONFIRMED' as const,
    };

    // Prepare slot data
    const slotData = slots.map(slot => ({
      bookingId: '', // Will be set by the repository
      courtId,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime),
      status: 'CONFIRMED' as const,
      createdBy: playerId, // Owner creating for player
    }));

    // Create booking with slots using repository
    const booking = await this.bookingRepository.createBookingWithSlots(
      bookingData,
      slotData,
    );

    return this.mapToBookingResponse(booking);
  }

  async getBookingsByCourtAndDate(
    courtId: string,
    startDate: Date,
    endDate: Date,
    facilityId: string,
  ): Promise<BookingResponseDto[]> {
    // Verify court belongs to facility
    const court = await this.prisma.court.findFirst({
      where: { id: courtId, facilityId },
    });

    if (!court) {
      throw new NotFoundException(
        'Court not found or does not belong to this facility',
      );
    }

    const bookings = await this.bookingRepository.findBookingsByCourtAndDate(
      courtId,
      startDate,
      endDate,
      facilityId,
    );

    return bookings.map(booking => this.mapToBookingResponse(booking));
  }

  async getBookingsByFacility(
    facilityId: string,
    filters: BookingFiltersDto,
    viewType?: BookingViewType,
    viewDate?: Date,
  ): Promise<BookingsPageResponseDto> {
    const result = await this.bookingRepository.findBookingsByFacility(
      facilityId,
      filters,
      viewType,
      viewDate,
    );

    return {
      bookings: result.bookings.map(booking =>
        this.mapToBookingResponse(booking),
      ),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async cancelBookingSlot(
    bookingSlotId: string,
    facilityId: string,
    cancelReason: string,
    cancelledBy: string,
  ): Promise<void> {
    // Verify booking slot belongs to facility
    const bookingSlot = await this.bookingRepository.findBookingSlotByFacility(
      bookingSlotId,
      facilityId,
    );

    if (!bookingSlot) {
      throw new NotFoundException(
        'Booking slot not found or does not belong to this facility',
      );
    }

    await this.bookingRepository.updateBookingSlot(bookingSlotId, {
      status: 'CANCELLED',
      cancelReason,
      cancelledBy,
      cancelledAt: new Date().toISOString(),
    });

    // Update parent booking status if all slots are cancelled
    const booking = await this.bookingRepository.findBookingWithSlots(
      bookingSlot.bookingId,
    );

    if (
      booking &&
      booking.bookingSlots?.every(slot => slot.status === 'CANCELLED')
    ) {
      await this.bookingRepository.updateBookingStatus(booking.id, 'CANCELLED');
    }
  }

  async getBookingStats(
    facilityId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<BookingStatsResponseDto> {
    return this.bookingRepository.getBookingStats(
      facilityId,
      startDate,
      endDate,
    );
  }

  private mapToBookingResponse(booking: any): BookingResponseDto {
    return {
      id: booking.id,
      playerId: booking.playerId,
      facilityId: booking.facilityId,
      courtId: booking.courtId,
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      slotMinutes: booking.slotMinutes,
      unitPrice: booking.unitPrice,
      totalPrice: booking.totalPrice,
      isRecurrence: booking.isRecurrence,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
      slots: booking.bookingSlots?.map((slot: any) => ({
        id: slot.id,
        bookingId: slot.bookingId,
        courtId: slot.courtId,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        cancelReason: slot.cancelReason,
        cancelledBy: slot.cancelledBy,
        cancelledAt: slot.cancelledAt,
        createdAt: slot.createdAt,
        updatedAt: slot.updatedAt,
      })),
      participants: booking.participants?.map((participant: any) => ({
        id: participant.id,
        userId: participant.userId,
        role: participant.role,
        status: participant.status,
        user: participant.user
          ? {
              id: participant.user.id,
              fullname: participant.user.fullname,
              email: participant.user.email,
              phone: participant.user.phone,
            }
          : undefined,
      })),
      player: booking.player
        ? {
            id: booking.player.id,
            fullname: booking.player.fullname,
            email: booking.player.email,
            phone: booking.player.phone,
          }
        : undefined,
      court: booking.court
        ? {
            id: booking.court.id,
            name: booking.court.name,
            sport: booking.court.sport,
            surface: booking.court.surface,
            indoor: booking.court.indoor,
          }
        : undefined,
      facility: booking.facility
        ? {
            id: booking.facility.id,
            name: booking.facility.name,
          }
        : undefined,
    };
  }
}
