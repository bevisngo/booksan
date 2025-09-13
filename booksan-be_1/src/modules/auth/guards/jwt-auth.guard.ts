import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService } from '@/modules/auth/services';
import { AuthRepository } from '@/repositories';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Define the request interface with user property
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string | null;
    phone: string | null;
    role: string | null;
    facilityId?: string | null;
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      const payload = this.jwtService.verifyAccessToken(token);

      // Verify user still exists
      // const user = await this.authRepository.findUserById(payload.sub);
      // if (!user) {
      //   throw new UnauthorizedException('User not found');
      // }

      // Attach user to request

      if (!payload.sub || !payload.role) {
        throw new UnauthorizedException('Invalid access token');
      }

      request.user = {
        id: payload.sub,
        email: payload.email || null,
        phone: payload.phone || null,
        role: payload.role || null,
        facilityId: payload.facilityId || null,
      };
      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private extractTokenFromHeader(
    request: AuthenticatedRequest,
  ): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
