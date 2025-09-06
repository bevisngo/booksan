import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthRepository } from '@/modules/auth/repositories';
import { JwtService } from '@/modules/auth/services';
import { RefreshTokenDto, RefreshResponseDto } from '@/modules/auth/dto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RefreshTokenDto): Promise<RefreshResponseDto> {
    try {
      // Verify refresh token
      const payload = this.jwtService.verifyRefreshToken(dto.refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Verify user still exists
      const user = await this.authRepository.findUserById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const accessToken = this.jwtService.generateAccessToken({
        sub: user.id,
        email: user.email || '',
        role: user.role,
      });

      return { accessToken };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
