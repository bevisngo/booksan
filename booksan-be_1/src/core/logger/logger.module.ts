import { Global, Module } from '@nestjs/common';
import { createPinoLogger } from './pino.logger';

@Global()
@Module({
  providers: [{ provide: 'APP_LOGGER', useFactory: createPinoLogger }],
  exports: ['APP_LOGGER'],
})
export class LoggerModule {}
