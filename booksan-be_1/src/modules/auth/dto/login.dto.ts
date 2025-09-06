import { IsEmail, IsString, MinLength, ValidateIf } from 'class-validator';

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
}
