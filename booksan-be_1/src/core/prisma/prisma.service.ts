import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    // Handle graceful shutdown with proper event handling
    const gracefulShutdown = async () => {
      try {
        await this.$disconnect();
        await app.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle different shutdown signals
    process.on('SIGTERM', () => {
      gracefulShutdown().catch(console.error);
    });
    process.on('SIGINT', () => {
      gracefulShutdown().catch(console.error);
    });

    // Handle beforeExit for cleanup
    process.on('beforeExit', () => {
      gracefulShutdown().catch(console.error);
    });
  }

  // Helper method to check database connection
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }

  // Helper method for transactions with error handling
  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(fn, {
      maxWait: 5000, // 5 seconds
      timeout: 10000, // 10 seconds
    });
  }
}
