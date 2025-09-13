import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/prisma/prisma.module';
import {
  AuthRepository,
  FacilityRepository,
  FacilityProfileRepository,
  FacilityPageTemplateRepository,
  CourtRepository,
  BookingRepository,
} from './index';

@Module({
  imports: [PrismaModule],
  providers: [
    AuthRepository,
    FacilityRepository,
    FacilityProfileRepository,
    FacilityPageTemplateRepository,
    CourtRepository,
    BookingRepository,
  ],
  exports: [
    AuthRepository,
    FacilityRepository,
    FacilityProfileRepository,
    FacilityPageTemplateRepository,
    CourtRepository,
    BookingRepository,
  ],
})
export class RepositoriesModule {}
