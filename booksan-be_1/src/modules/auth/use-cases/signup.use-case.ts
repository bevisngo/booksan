import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthRepository } from '@/modules/auth/repositories';
import { JwtService, HashService } from '@/modules/auth/services';
import { SignupDto, AuthResponseDto } from '@/modules/auth/dto';

@Injectable()
export class SignupUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: SignupDto): Promise<AuthResponseDto> {
    // Validate input
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    // Check if user already exists
    if (dto.email) {
      const emailExists = await this.authRepository.emailExists(dto.email);
      if (emailExists) {
        throw new ConflictException('Email already registered');
      }
    }

    if (dto.phone) {
      const phoneExists = await this.authRepository.phoneExists(dto.phone);
      if (phoneExists) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Hash password
    const hashedPassword = await this.hashService.hashPassword(dto.password);

    // Create user
    const user = await this.authRepository.createUser({
      fullname: dto.fullname,
      email: dto.email || undefined,
      phone: dto.phone,
      password: hashedPassword,
    });

    // Generate access token
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email || '',
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
