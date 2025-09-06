import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/core/prisma/prisma.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { ElasticsearchModule } from '@/core/elasticsearch';
import { AuthModule } from '@/modules/auth';
import { VenuesModule } from '@/modules/venues';
import { envSchema } from '@/config/schema.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
    }),
    PrismaModule,
    LoggerModule,
    ElasticsearchModule,
    AuthModule,
    VenuesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
