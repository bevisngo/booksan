import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  SignupDto,
  OwnerLoginDto,
  OAuthCallbackDto,
  ZaloLoginDto,
  AuthResponseDto,
} from '@/modules/auth/dto';
import {
  SignupUseCase,
  OwnerLoginUseCase,
  OAuthLoginUseCase,
  GetCurrentUserUseCase,
} from '@/modules/auth/use-cases';
import { OAuthService } from '@/modules/auth/services';
import { Public, CurrentUser } from '@/modules/auth/decorators';
import { JwtAuthGuard, OwnerRoleGuard } from '@/modules/auth/guards';
import { OwnerProfile } from '@/repositories/auth.repository';
import { UserRole } from '@prisma/client';

@Controller('owner/auth')
@UseGuards(JwtAuthGuard, OwnerRoleGuard)
export class OwnerAuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly ownerLoginUseCase: OwnerLoginUseCase,
    private readonly oauthLoginUseCase: OAuthLoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly oauthService: OAuthService,
  ) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() dto: SignupDto): Promise<{ data: AuthResponseDto }> {
    const data = await this.signupUseCase.execute({
      ...dto,
      role: UserRole.OWNER,
    });
    return { data };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: OwnerLoginDto): Promise<{ data: AuthResponseDto }> {
    const data = await this.ownerLoginUseCase.execute(dto);
    return { data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(): Promise<void> {
    // In a real implementation, you might want to blacklist the token
    // For now, we just return success since JWT tokens are stateless
    return Promise.resolve();
  }

  @Get('me')
  async getCurrentUser(
    @CurrentUser() user: OwnerProfile,
  ): Promise<{ data: OwnerProfile }> {
    // Since we have facilityId in JWT, we can get owner with facility
    const data = await this.getCurrentUserUseCase.execute(user.id);
    return {
      data: {
        ...data,
        facilityId: user.facilityId,
        facility: user.facility,
      } as OwnerProfile,
    };
  }

  // OAuth endpoints for owners
  @Public()
  @Get('google')
  getGoogleAuthUrl(): { data: { url: string } } {
    const url = this.oauthService.getGoogleAuthUrl();
    return { data: { url } };
  }

  @Public()
  @Get('google/callback')
  async googleCallback(
    @Query() dto: OAuthCallbackDto,
  ): Promise<{ data: AuthResponseDto }> {
    const data = await this.oauthLoginUseCase.executeGoogleLogin(dto.code);
    return { data };
  }

  @Public()
  @Get('facebook')
  getFacebookAuthUrl(): { data: { url: string } } {
    const url = this.oauthService.getFacebookAuthUrl();
    return { data: { url } };
  }

  @Public()
  @Get('facebook/callback')
  async facebookCallback(
    @Query() dto: OAuthCallbackDto,
  ): Promise<{ data: AuthResponseDto }> {
    const data = await this.oauthLoginUseCase.executeFacebookLogin(dto.code);
    return { data };
  }

  @Public()
  @Get('zalo')
  getZaloAuthUrl(): { data: { url: string } } {
    const url = this.oauthService.getZaloAuthUrl();
    return { data: { url } };
  }

  @Public()
  @Post('zalo/login')
  @HttpCode(HttpStatus.OK)
  async zaloLogin(
    @Body() dto: ZaloLoginDto,
  ): Promise<{ data: AuthResponseDto }> {
    const data = await this.oauthLoginUseCase.executeZaloLogin(dto.accessToken);
    return { data };
  }
}
