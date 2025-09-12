import { Module } from '@nestjs/common';
import { CourtController, PlayerCourtController, OwnerCourtController } from './controllers';
import { CourtService } from './services';
import {
  CreateCourtUseCase,
  UpdateCourtUseCase,
  GetCourtByIdUseCase,
  GetCourtsByFacilityUseCase,
  DeleteCourtUseCase,
  GetCourtStatsUseCase,
} from './use-cases';
import { FacilitiesModule } from '@/modules/facilities';
import { RepositoriesModule } from '@/repositories';
import { AuthModule } from '@/modules/auth';

@Module({
  imports: [FacilitiesModule, RepositoriesModule, AuthModule],
  controllers: [CourtController, PlayerCourtController, OwnerCourtController],
  providers: [
    CourtService,
    CreateCourtUseCase,
    UpdateCourtUseCase,
    GetCourtByIdUseCase,
    GetCourtsByFacilityUseCase,
    DeleteCourtUseCase,
    GetCourtStatsUseCase,
  ],
  exports: [
    CourtService,
    CreateCourtUseCase,
    UpdateCourtUseCase,
    GetCourtByIdUseCase,
    GetCourtsByFacilityUseCase,
    DeleteCourtUseCase,
    GetCourtStatsUseCase,
  ],
})
export class CourtsModule {}
