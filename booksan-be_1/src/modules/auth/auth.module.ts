import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

// Controllers
import {
  AuthController,
  PlayerAuthController,
  OwnerAuthController,
} from './controllers';

// Services
import { JwtService, HashService, OAuthService } from './services';

// Use Cases
import {
  SignupUseCase,
  LoginUseCase,
  OwnerLoginUseCase,
  OAuthLoginUseCase,
  GetCurrentUserUseCase,
} from './use-cases';

// Guards
import { JwtAuthGuard, RolesGuard } from './guards';

// Repositories Module
import { RepositoriesModule } from '@/repositories';

@Module({
  imports: [
    RepositoriesModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],
  controllers: [AuthController, PlayerAuthController, OwnerAuthController],
  providers: [
    // Services
    JwtService,
    HashService,
    OAuthService,

    // Use Cases
    SignupUseCase,
    LoginUseCase,
    OwnerLoginUseCase,
    OAuthLoginUseCase,
    GetCurrentUserUseCase,

    // Guards
    JwtAuthGuard,
    RolesGuard,

    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [
    JwtService,
    HashService,
    OAuthService,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
