import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as ESModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';
import { ElasticsearchHealthService } from './elasticsearch.health';
import { getElasticsearchConfig } from './elasticsearch.config';

@Global()
@Module({
  imports: [
    ESModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getElasticsearchConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [ElasticsearchService, ElasticsearchHealthService],
  exports: [ElasticsearchService, ElasticsearchHealthService],
})
export class ElasticsearchModule {}
