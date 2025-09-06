import { Module } from '@nestjs/common';
import { VenueSearchController } from './controllers';
import { VenueSearchService } from './services';
import { VenueRepository } from './repositories';
import {
  SearchVenuesUseCase,
  GetVenueByIdUseCase,
  ReindexVenueUseCase,
  ReindexAllVenuesUseCase,
  GetIndexStatsUseCase,
} from './use-cases';
import { AuthModule } from '@/modules/auth';

@Module({
  imports: [AuthModule],
  controllers: [VenueSearchController],
  providers: [
    VenueSearchService,
    VenueRepository,
    SearchVenuesUseCase,
    GetVenueByIdUseCase,
    ReindexVenueUseCase,
    ReindexAllVenuesUseCase,
    GetIndexStatsUseCase,
  ],
  exports: [
    VenueSearchService,
    VenueRepository,
    SearchVenuesUseCase,
    GetVenueByIdUseCase,
    ReindexVenueUseCase,
    ReindexAllVenuesUseCase,
    GetIndexStatsUseCase,
  ],
})
export class VenuesModule {}
