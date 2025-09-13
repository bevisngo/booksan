import { Injectable } from '@nestjs/common';
import {
  Booking,
  BookingSlot,
  BookingStatus,
  User,
  Court,
  Facility,
} from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/shared/repositories';
import { BookingFiltersDto } from '@/modules/bookings/dto/booking-filters.dto';
import { BookingViewType } from '@/modules/bookings/dto/booking-request.dto';

export interface CreateBookingData {
  playerId: string;
  facilityId: string;
  courtId: string;
  startAt: string;
  endAt: string;
  slotMinutes: number;
  unitPrice: number;
  totalPrice: number;
  isRecurrence?: boolean;
  status?: BookingStatus;
}

export interface UpdateBookingData {
  status?: BookingStatus;
  startAt?: string;
  endAt?: string;
  slotMinutes?: number;
  unitPrice?: number;
  totalPrice?: number;
  isRecurrence?: boolean;
}

export interface BookingFilters {
  id?: string;
  playerId?: string;
  facilityId?: string;
  courtId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface CreateBookingSlotData {
  bookingId: string;
  courtId: string;
  startTime: Date;
  endTime: Date;
  status?: BookingStatus;
  createdBy: string;
}

export interface UpdateBookingSlotData {
  status?: BookingStatus;
  cancelReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
}

export interface BookingSlotFilters {
  id?: string;
  bookingId?: string;
  courtId?: string;
  status?: BookingStatus;
  startTime?: {
    gte?: Date;
    lte?: Date;
  };
}

type BookingWithRelations = Booking & {
  player?: User;
  court?: Court;
  facility?: Facility;
  bookingSlots?: BookingSlot[];
  participants?: Array<{
    id: string;
    userId: string;
    role: string;
    status: string;
    user?: User;
  }>;
};

type BookingSlotWithRelations = BookingSlot & {
  booking?: Booking;
  court?: Court;
  cancelledByUser?: User | null;
};

@Injectable()
export class BookingRepository extends BaseRepository<
  Booking,
  CreateBookingData,
  UpdateBookingData,
  BookingFilters,
  'booking'
> {
  protected readonly modelName = 'booking' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Booking operations
  async createBookingWithSlots(
    bookingData: CreateBookingData,
    slots: CreateBookingSlotData[],
  ): Promise<BookingWithRelations> {
    return this.prisma.booking.create({
      data: {
        ...bookingData,
        bookingSlots: {
          create: slots,
        },
      },
      include: {
        player: true,
        court: true,
        facility: true,
        bookingSlots: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findBookingsByCourtAndDate(
    courtId: string,
    startDate: Date,
    endDate: Date,
    facilityId: string,
  ): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: {
        courtId,
        facilityId,
        bookingSlots: {
          some: {
            startTime: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
      include: {
        player: true,
        court: true,
        facility: true,
        bookingSlots: {
          where: {
            startTime: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: {
            startTime: 'asc',
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findBookingsByFacility(
    facilityId: string,
    filters: BookingFiltersDto,
    viewType?: BookingViewType,
    viewDate?: Date,
  ): Promise<{
    bookings: BookingWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 20,
      courtId,
      status,
      search,
      startDate,
      endDate,
    } = filters;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      facilityId,
    };

    if (courtId) {
      where.courtId = courtId;
    }

    if (status) {
      where.status = status;
    }

    // Handle view-based date filtering
    if (viewType && viewDate) {
      const dateFilters = this.getDateFiltersForView(viewType, viewDate);
      where.bookingSlots = {
        some: {
          startTime: dateFilters,
        },
      };
    } else if (startDate || endDate) {
      where.bookingSlots = {
        some: {
          startTime: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) }),
          },
        },
      };
    }

    if (search) {
      where.OR = [
        {
          player: {
            fullname: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          court: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [bookings, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: limit,
        include: {
          player: true,
          court: true,
          facility: true,
          bookingSlots: {
            orderBy: {
              startTime: 'asc',
            },
          },
          participants: {
            include: {
              user: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.booking.count({ where }),
    ]);

    return {
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookingStats(
    facilityId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
  }> {
    const where: any = { facilityId };

    if (startDate || endDate) {
      where.bookingSlots = {
        some: {
          startTime: {
            ...(startDate && { gte: startDate }),
            ...(endDate && { lte: endDate }),
          },
        },
      };
    }

    const [bookings, stats] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        include: {
          bookingSlots: true,
        },
      }),
      this.prisma.booking.groupBy({
        by: ['status'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    const totalBookings = bookings.length;
    const confirmedBookings =
      stats.find(s => s.status === 'CONFIRMED')?._count.id || 0;
    const cancelledBookings =
      stats.find(s => s.status === 'CANCELLED')?._count.id || 0;
    const pendingBookings =
      stats.find(s => s.status === 'PENDING')?._count.id || 0;
    const totalRevenue = stats.reduce(
      (sum, s) => sum + (s._sum.totalPrice || 0),
      0,
    );

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      totalRevenue,
      averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
    };
  }

  // Booking slot operations
  async findBookingSlotById(
    id: string,
  ): Promise<BookingSlotWithRelations | null> {
    return this.prisma.bookingSlot.findUnique({
      where: { id },
      include: {
        booking: true,
        court: true,
        cancelledByUser: true,
      },
    });
  }

  async findBookingSlotByFacility(
    slotId: string,
    facilityId: string,
  ): Promise<BookingSlotWithRelations | null> {
    return this.prisma.bookingSlot.findFirst({
      where: {
        id: slotId,
        booking: {
          facilityId,
        },
      },
      include: {
        booking: true,
        court: true,
        cancelledByUser: true,
      },
    });
  }

  async updateBookingSlot(
    id: string,
    data: UpdateBookingSlotData,
  ): Promise<BookingSlot> {
    return this.prisma.bookingSlot.update({
      where: { id },
      data,
    });
  }

  async findBookingWithSlots(
    bookingId: string,
  ): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        player: true,
        court: true,
        facility: true,
        bookingSlots: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  }

  // Helper methods
  private getDateFiltersForView(viewType: BookingViewType, viewDate: Date) {
    const startOfDay = new Date(viewDate);
    startOfDay.setHours(0, 0, 0, 0);

    switch (viewType) {
      case BookingViewType.DAY: {
        const endOfDay = new Date(viewDate);
        endOfDay.setHours(23, 59, 59, 999);
        return {
          gte: startOfDay,
          lte: endOfDay,
        };
      }

      case BookingViewType.WEEK: {
        const startOfWeek = new Date(startOfDay);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return {
          gte: startOfWeek,
          lte: endOfWeek,
        };
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

        return {
          gte: startOfMonth,
          lte: endOfMonth,
        };
      }

      default:
        return {
          gte: startOfDay,
          lte: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        };
    }
  }
}
