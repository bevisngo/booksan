import { IsEmail, IsString, MinLength, ValidateIf } from 'class-validator';

export class SignupDto {
  @IsString()
  @MinLength(2)
  fullname: string;

  @ValidateIf((o: SignupDto) => !o.phone)
  @IsEmail()
  email?: string;

  @ValidateIf((o: SignupDto) => !o.email)
  @IsString()
  @MinLength(10)
  phone?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(6)
  passwordConfirm?: string;
}
