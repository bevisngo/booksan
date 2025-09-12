import { IsEmail, IsString, MinLength, ValidateIf, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @ValidateIf((o: LoginDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o: LoginDto) => !o.email)
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
