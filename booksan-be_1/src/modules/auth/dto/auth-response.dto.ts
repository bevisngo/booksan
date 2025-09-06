import { UserRole } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    fullname: string;
    email: string | null;
    phone?: string | null;
    role: UserRole;
  };
}

export class RefreshResponseDto {
  accessToken: string;
}
