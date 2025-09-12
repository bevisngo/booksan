import { Module } from '@nestjs/common';
import { FacilityProfileController } from './controllers';
import { FacilityProfileService } from './services';
import { RepositoriesModule } from '@/repositories';
import { AuthModule } from '@/modules/auth';

@Module({
  imports: [RepositoriesModule, AuthModule],
  controllers: [
    FacilityProfileController,
  ],
  providers: [
    FacilityProfileService,
  ],
  exports: [
    FacilityProfileService,
  ],
})
export class FacilitiesModule {}
