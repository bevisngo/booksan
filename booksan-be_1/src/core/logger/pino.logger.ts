import { LoggerService } from '@nestjs/common';
import pinoHttp from 'pino-http';

export function createPinoLogger(): LoggerService {
  const pino = pinoHttp({
    autoLogging: true,
    transport:
      process.env.NODE_ENV === 'development'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });
  return {
    log: (msg, ...args) => pino.logger.info({ args }, msg),
    error: (msg, ...args) => pino.logger.error({ args }, msg),
    warn: (msg, ...args) => pino.logger.warn({ args }, msg),
    debug: (msg, ...args) => pino.logger.debug({ args }, msg),
    verbose: (msg, ...args) => pino.logger.trace({ args }, msg),
  };
}
