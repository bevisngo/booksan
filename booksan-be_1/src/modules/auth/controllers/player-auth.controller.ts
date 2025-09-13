import {
  Controller,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Get,
  Query,
} from '@nestjs/common';
import {
  SignupDto,
  LoginDto,
  OAuthCallbackDto,
  ZaloLoginDto,
  AuthResponseDto,
} from '@/modules/auth/dto';
import {
  SignupUseCase,
  LoginUseCase,
  OAuthLoginUseCase,
  GetCurrentUserUseCase,
} from '@/modules/auth/use-cases';
import { OAuthService } from '@/modules/auth/services';
import { Public, CurrentUser } from '@/modules/auth/decorators';
import { UserProfile } from '@/repositories/auth.repository';

@Controller('player/auth')
export class PlayerAuthController {
  constructor(
    private readonly signupUseCase: SignupUseCase,
    private readonly loginUseCase: LoginUseCase,
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
      role: 'PLAYER',
    });
    return { data };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<{ data: AuthResponseDto }> {
    const data = await this.loginUseCase.execute({
      ...dto,
      role: 'PLAYER',
    });
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
    @CurrentUser() user: UserProfile,
  ): Promise<{ data: UserProfile }> {
    const data = await this.getCurrentUserUseCase.execute(user.id);
    return { data };
  }

  // OAuth endpoints for players
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
