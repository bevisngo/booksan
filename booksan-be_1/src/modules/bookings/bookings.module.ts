import { Module } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BookingRepository } from '@/repositories/booking.repository';
import { AuthModule } from '@/modules/auth';
import { RepositoriesModule } from '@/repositories';

// Services
import { BookingService } from './services';

// Use Cases
import {
  CreateBookingUseCase,
  GetBookingsByCourtUseCase,
  GetBookingsByFacilityUseCase,
  CancelBookingUseCase,
  GetBookingStatsUseCase,
} from './use-cases';

// Controllers
import { PlayerBookingController, OwnerBookingController } from './controllers';

@Module({
  imports: [AuthModule, RepositoriesModule],
  controllers: [PlayerBookingController, OwnerBookingController],
  providers: [
    PrismaService,
    BookingRepository,
    BookingService,
    CreateBookingUseCase,
    GetBookingsByCourtUseCase,
    GetBookingsByFacilityUseCase,
    CancelBookingUseCase,
    GetBookingStatsUseCase,
  ],
  exports: [
    BookingService,
    CreateBookingUseCase,
    GetBookingsByCourtUseCase,
    GetBookingsByFacilityUseCase,
    CancelBookingUseCase,
    GetBookingStatsUseCase,
  ],
})
export class BookingsModule {}
