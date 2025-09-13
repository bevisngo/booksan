import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

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

/**
 * PlayerRoleGuard ensures that only users with PLAYER role can access protected endpoints.
 * This guard should be used on player-specific API endpoints.
 */
@Injectable()
export class PlayerRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== 'PLAYER') {
      throw new ForbiddenException('Access denied. This endpoint is only available for players.');
    }

    return true;
  }
}
