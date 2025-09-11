import { Module } from '@nestjs/common';
import { CourtController, PlayerCourtController, OwnerCourtController } from './controllers';
import { CourtService } from './services';
import { CourtRepository } from './repositories';
import {
  CreateCourtUseCase,
  UpdateCourtUseCase,
  GetCourtByIdUseCase,
  GetCourtsByFacilityUseCase,
  DeleteCourtUseCase,
  GetCourtStatsUseCase,
} from './use-cases';
import { VenuesModule } from '@/modules/venues';
import { PrismaModule } from '@/core/prisma/prisma.module';
import { AuthModule } from '@/modules/auth';

@Module({
  imports: [VenuesModule, PrismaModule, AuthModule],
  controllers: [CourtController, PlayerCourtController, OwnerCourtController],
  providers: [
    CourtService,
    CourtRepository,
    CreateCourtUseCase,
    UpdateCourtUseCase,
    GetCourtByIdUseCase,
    GetCourtsByFacilityUseCase,
    DeleteCourtUseCase,
    GetCourtStatsUseCase,
  ],
  exports: [
    CourtService,
    CourtRepository,
    CreateCourtUseCase,
    UpdateCourtUseCase,
    GetCourtByIdUseCase,
    GetCourtsByFacilityUseCase,
    DeleteCourtUseCase,
    GetCourtStatsUseCase,
  ],
})
export class CourtsModule {}
