import { Module } from '@nestjs/common';
import { PlayerCourtController, OwnerCourtController } from './controllers';
import { CourtService } from './services';
import {
  CreateCourtUseCase,
  UpdateCourtUseCase,
  GetCourtByIdUseCase,
  GetCourtsByFacilityUseCase,
  DeleteCourtUseCase,
  GetCourtStatsUseCase,
  GetAllCourtsUseCase,
} from './use-cases';
import { FacilitiesModule } from '@/modules/facilities';
import { RepositoriesModule } from '@/repositories';
import { AuthModule } from '@/modules/auth';

@Module({
  imports: [FacilitiesModule, RepositoriesModule, AuthModule],
  controllers: [PlayerCourtController, OwnerCourtController],
  providers: [
    CourtService,
    CreateCourtUseCase,
    UpdateCourtUseCase,
    GetCourtByIdUseCase,
    GetCourtsByFacilityUseCase,
    DeleteCourtUseCase,
    GetCourtStatsUseCase,
    GetAllCourtsUseCase,
  ],
  exports: [
    CourtService,
    CreateCourtUseCase,
    UpdateCourtUseCase,
    GetCourtByIdUseCase,
    GetCourtsByFacilityUseCase,
    DeleteCourtUseCase,
    GetCourtStatsUseCase,
    GetAllCourtsUseCase,
  ],
})
export class CourtsModule {}
