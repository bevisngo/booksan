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
 * OwnerRoleGuard ensures that only users with OWNER or ADMIN role can access protected endpoints.
 * This guard should be used on owner-specific API endpoints.
 */
@Injectable()
export class OwnerRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Access denied. This endpoint is only available for owners and administrators.',
      );
    }

    return true;
  }
}
