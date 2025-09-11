import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthRepository } from '@/modules/auth/repositories';
import { JwtService, HashService } from '@/modules/auth/services';
import { LoginDto, AuthResponseDto } from '@/modules/auth/dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // Validate input
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    // Find user
    let user;
    if (dto.email) {
      user = await this.authRepository.findUserByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.authRepository.findUserByPhone(dto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.hashService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
