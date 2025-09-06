import { Injectable } from '@nestjs/common';
import { AuthRepository, UserProfile } from '@/modules/auth/repositories';
import {
  JwtService,
  HashService,
  OAuthService,
  OAuthProfile,
} from '@/modules/auth/services';
import { AuthResponseDto } from '@/modules/auth/dto';
import { generateRandomPassword } from '@/common/utils/crypto';

@Injectable()
export class OAuthLoginUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly oauthService: OAuthService,
  ) {}

  async executeGoogleLogin(code: string): Promise<AuthResponseDto> {
    const profile = await this.oauthService.exchangeGoogleCodeForProfile(code);
    return this.processOAuthLogin(profile);
  }

  async executeFacebookLogin(code: string): Promise<AuthResponseDto> {
    const profile =
      await this.oauthService.exchangeFacebookCodeForProfile(code);
    return this.processOAuthLogin(profile);
  }

  async executeZaloLogin(accessToken: string): Promise<AuthResponseDto> {
    const profile =
      await this.oauthService.getZaloProfileFromToken(accessToken);
    return this.processOAuthLogin(profile);
  }

  private async processOAuthLogin(
    profile: OAuthProfile,
  ): Promise<AuthResponseDto> {
    // Try to find existing user by email (if email is provided)
    let existingUser: any = null;
    if (profile.email) {
      existingUser = await this.authRepository.findUserByEmail(profile.email);
    }

    let user: UserProfile;
    if (!existingUser) {
      // Create new user with OAuth profile
      const randomPassword = generateRandomPassword();
      const hashedPassword =
        await this.hashService.hashPassword(randomPassword);

      user = await this.authRepository.createUser({
        fullname: profile.fullname,
        email: profile.email,
        password: hashedPassword, // Random password for OAuth users
      });
    } else {
      // Get user profile from existing user
      const foundUser = await this.authRepository.findUserById(existingUser.id);
      if (!foundUser) {
        throw new Error('User not found after authentication');
      }
      user = foundUser;
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.jwtService.generateTokens({
      sub: user.id,
      email: user.email || '',
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
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
