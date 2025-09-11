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
import { OwnerProfile } from '@/modules/auth/repositories';

@ApiTags('Owner Auth')
@Controller('owner/auth')
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
  @ApiOperation({ summary: 'Owner signup' })
  @ApiResponse({
    status: 201,
    description: 'Owner registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async signup(@Body() dto: SignupDto): Promise<{ data: AuthResponseDto }> {
    const data = await this.signupUseCase.execute({
      ...dto,
      role: 'OWNER',
    });
    return { data };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Owner login' })
  @ApiResponse({
    status: 200,
    description: 'Owner logged in successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 404, description: 'Owner facility not found' })
  async login(@Body() dto: OwnerLoginDto): Promise<{ data: AuthResponseDto }> {
    const data = await this.ownerLoginUseCase.execute(dto);
    return { data };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Owner logout' })
  @ApiResponse({ status: 204, description: 'Owner logged out successfully' })
  @ApiBearerAuth()
  logout(): Promise<void> {
    // In a real implementation, you might want to blacklist the token
    // For now, we just return success since JWT tokens are stateless
    return Promise.resolve();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current owner profile with facility info' })
  @ApiResponse({
    status: 200,
    description: 'Owner profile retrieved successfully',
    type: OwnerProfile,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiBearerAuth()
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
      } as OwnerProfile 
    };
  }

  // OAuth endpoints for owners
  @Public()
  @Get('google')
  @ApiOperation({ summary: 'Get Google OAuth URL for owners' })
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
  @ApiOperation({ summary: 'Handle Google OAuth callback for owners' })
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
  @ApiOperation({ summary: 'Get Facebook OAuth URL for owners' })
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
  @ApiOperation({ summary: 'Handle Facebook OAuth callback for owners' })
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
  @ApiOperation({ summary: 'Get Zalo OAuth URL for owners' })
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
  @ApiOperation({ summary: 'Login with Zalo for owners' })
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
