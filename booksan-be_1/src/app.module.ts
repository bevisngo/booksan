import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/core/prisma/prisma.module';
import { LoggerModule } from '@/core/logger/logger.module';
import { ElasticsearchModule } from '@/core/elasticsearch';
import { RepositoriesModule } from '@/repositories';
import { AuthModule } from '@/modules/auth';
import { FacilitiesModule } from '@/modules/facilities';
import { CourtsModule } from '@/modules/courts';
import { BookingsModule } from '@/modules/bookings';
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
    RepositoriesModule,
    AuthModule,
    FacilitiesModule,
    CourtsModule,
    BookingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
