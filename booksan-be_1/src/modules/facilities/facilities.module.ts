import { Module } from '@nestjs/common';
import { FacilityProfileController, FacilityController } from './controllers';
import { FacilityProfileService } from './services';
import { RepositoriesModule } from '@/repositories';
import { AuthModule } from '@/modules/auth';
import { ElasticsearchModule } from '@/core/elasticsearch/elasticsearch.module';

@Module({
  imports: [RepositoriesModule, AuthModule, ElasticsearchModule],
  controllers: [FacilityProfileController, FacilityController],
  providers: [FacilityProfileService],
  exports: [FacilityProfileService],
})
export class FacilitiesModule {}
