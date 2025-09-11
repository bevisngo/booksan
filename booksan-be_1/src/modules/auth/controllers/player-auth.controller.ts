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
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
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
import { UserProfile } from '@/modules/auth/repositories';

@ApiTags('Player Auth')
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
  @ApiOperation({ summary: 'Player signup' })
  @ApiResponse({
    status: 201,
    description: 'Player registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
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
  @ApiOperation({ summary: 'Player login' })
  @ApiResponse({
    status: 200,
    description: 'Player logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() dto: LoginDto): Promise<{ data: AuthResponseDto }> {
    const data = await this.loginUseCase.execute({
      ...dto,
      role: 'PLAYER',
    });
    return { data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Player logout' })
  @ApiResponse({ status: 204, description: 'Player logged out successfully' })
  @ApiBearerAuth()
  logout(): Promise<void> {
    // In a real implementation, you might want to blacklist the token
    // For now, we just return success since JWT tokens are stateless
    return Promise.resolve();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current player profile' })
  @ApiResponse({
    status: 200,
    description: 'Player profile retrieved successfully',
    type: UserProfile,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
  async getCurrentUser(
    @CurrentUser() user: UserProfile,
  ): Promise<{ data: UserProfile }> {
    const data = await this.getCurrentUserUseCase.execute(user.id);
    return { data };
  }

  // OAuth endpoints for players
  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Get Google OAuth URL for players' })
  @ApiResponse({
    status: 200,
    description: 'Google OAuth URL retrieved successfully',
  })
  getGoogleAuthUrl(): { data: { url: string } } {
    const url = this.oauthService.getGoogleAuthUrl();
    return { data: { url } };
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Handle Google OAuth callback for players' })
  @ApiResponse({
    status: 200,
    description: 'Google OAuth login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OAuth callback' })
  async googleCallback(
    @Query() dto: OAuthCallbackDto,
  ): Promise<{ data: AuthResponseDto }> {
    const data = await this.oauthLoginUseCase.executeGoogleLogin(dto.code);
    return { data };
  }

  @Public()
  @Get('facebook')
  @ApiOperation({ summary: 'Get Facebook OAuth URL for players' })
  @ApiResponse({
    status: 200,
    description: 'Facebook OAuth URL retrieved successfully',
  })
  getFacebookAuthUrl(): { data: { url: string } } {
    const url = this.oauthService.getFacebookAuthUrl();
    return { data: { url } };
  }

  @Public()
  @Get('facebook/callback')
  @ApiOperation({ summary: 'Handle Facebook OAuth callback for players' })
  @ApiResponse({
    status: 200,
    description: 'Facebook OAuth login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid OAuth callback' })
  async facebookCallback(
    @Query() dto: OAuthCallbackDto,
  ): Promise<{ data: AuthResponseDto }> {
    const data = await this.oauthLoginUseCase.executeFacebookLogin(dto.code);
    return { data };
  }

  @Public()
  @Get('zalo')
  @ApiOperation({ summary: 'Get Zalo OAuth URL for players' })
  @ApiResponse({
    status: 200,
    description: 'Zalo OAuth URL retrieved successfully',
  })
  getZaloAuthUrl(): { data: { url: string } } {
    const url = this.oauthService.getZaloAuthUrl();
    return { data: { url } };
  }

  @Public()
  @Post('zalo/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Zalo for players' })
  @ApiResponse({
    status: 200,
    description: 'Zalo login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid Zalo access token' })
  async zaloLogin(
    @Body() dto: ZaloLoginDto,
  ): Promise<{ data: AuthResponseDto }> {
    const data = await this.oauthLoginUseCase.executeZaloLogin(dto.accessToken);
    return { data };
  }
}
