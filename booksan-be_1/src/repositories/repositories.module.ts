import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/prisma/prisma.module';
import {
  AuthRepository,
  FacilityRepository,
  FacilityProfileRepository,
  FacilityPageTemplateRepository,
  CourtRepository,
} from './index';

@Module({
  imports: [PrismaModule],
  providers: [
    AuthRepository,
    FacilityRepository,
    FacilityProfileRepository,
    FacilityPageTemplateRepository,
    CourtRepository,
  ],
  exports: [
    AuthRepository,
    FacilityRepository,
    FacilityProfileRepository,
    FacilityPageTemplateRepository,
    CourtRepository,
  ],
})
export class RepositoriesModule {}
