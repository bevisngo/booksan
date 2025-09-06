import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class JwtService {
  constructor(
    private readonly nestJwtService: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  generateTokens(payload: Omit<JwtPayload, 'type'>) {
    const accessToken = this.nestJwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      },
    );

    const refreshToken = this.nestJwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN'),
      },
    );

    return { accessToken, refreshToken };
  }

  verifyAccessToken(token: string): JwtPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  verifyRefreshToken(token: string): JwtPayload {
    return this.nestJwtService.verify(token, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
  }

  generateAccessToken(payload: Omit<JwtPayload, 'type'>): string {
    return this.nestJwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      },
    );
  }
}
