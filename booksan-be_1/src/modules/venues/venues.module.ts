import { Module } from '@nestjs/common';
import {
  VenueSearchController,
  FacilityProfileController,
  VenueSitemapController,
  PlayerVenueController,
  OwnerVenueController,
} from './controllers';
import { VenueSearchService, FacilityProfileService } from './services';
import {
  VenueRepository,
  FacilityProfileRepository,
  FacilityPageTemplateRepository,
} from './repositories';
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
  controllers: [
    VenueSearchController,
    FacilityProfileController,
    VenueSitemapController,
    PlayerVenueController,
    OwnerVenueController,
  ],
  providers: [
    VenueSearchService,
    FacilityProfileService,
    VenueRepository,
    FacilityProfileRepository,
    FacilityPageTemplateRepository,
    SearchVenuesUseCase,
    GetVenueByIdUseCase,
    ReindexVenueUseCase,
    ReindexAllVenuesUseCase,
    GetIndexStatsUseCase,
  ],
  exports: [
    VenueSearchService,
    FacilityProfileService,
    VenueRepository,
    FacilityProfileRepository,
    FacilityPageTemplateRepository,
    SearchVenuesUseCase,
    GetVenueByIdUseCase,
    ReindexVenueUseCase,
    ReindexAllVenuesUseCase,
    GetIndexStatsUseCase,
  ],
})
export class VenuesModule {}
