import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { AuthRepository, FacilityRepository } from '@/repositories';
import { JwtService, HashService } from '@/modules/auth/services';
import { OwnerLoginDto, AuthResponseDto } from '@/modules/auth/dto';

@Injectable()
export class OwnerLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly facilityRepository: FacilityRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: OwnerLoginDto): Promise<AuthResponseDto> {
    // Validate input
    if (!dto.email && !dto.phone) {
      throw new BadRequestException('Either email or phone is required');
    }

    // Find user with OWNER role
    let user: User | null = null;
    if (dto.email) {
      user = await this.authRepository.findUserByEmailAndRole(
        dto.email,
        UserRole.OWNER,
      );
    } else if (dto.phone) {
      user = await this.authRepository.findUserByPhoneAndRole(
        dto.phone,
        UserRole.OWNER,
      );
    }

    if (!user) {
      throw new UnauthorizedException(
        'Owner account not found or invalid credentials',
      );
    }

    // Verify password
    const isPasswordValid = await this.hashService.comparePassword(
      dto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Get owner's facilities
    const facilities = await this.facilityRepository.findByOwnerId(user.id);
    const facilityId = facilities.length > 0 ? facilities[0].id : null;

    // Generate access token
    const accessToken = this.jwtService.generateAccessToken({
      sub: user.id,
      email: user.email || '',
      role: user.role,
      facilityId: facilityId || '',
      phone: user.phone || '',
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
