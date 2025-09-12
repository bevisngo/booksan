import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserProfile } from '@/repositories/auth.repository';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserProfile => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
