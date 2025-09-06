import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface OAuthProfile {
  id: string;
  email: string;
  fullname: string;
  provider: 'google' | 'facebook' | 'zalo';
}

// Define response interfaces for OAuth providers
interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleProfileResponse {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface FacebookTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface FacebookProfileResponse {
  id: string;
  name: string;
  email?: string;
}

interface ZaloProfileResponse {
  id: string;
  name: string;
  email?: string;
  error?: {
    code: number;
    message: string;
  };
}

@Injectable()
export class OAuthService {
  constructor(private readonly configService: ConfigService) {}

  getGoogleAuthUrl(): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new BadRequestException('Google OAuth not configured');
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${appUrl}/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  getFacebookAuthUrl(): string {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    if (!appId) {
      throw new BadRequestException('Facebook OAuth not configured');
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: `${appUrl}/auth/facebook/callback`,
      response_type: 'code',
      scope: 'email,public_profile',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
  }

  getZaloAuthUrl(): string {
    const appId = this.configService.get<string>('ZALO_APP_ID');
    if (!appId) {
      throw new BadRequestException('Zalo OAuth not configured');
    }

    const appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';
    const params = new URLSearchParams({
      app_id: appId,
      redirect_uri: `${appUrl}/auth/zalo/callback`,
      response_type: 'code',
      scope: 'id,name,email',
    });

    return `https://oauth.zaloapp.com/v4/permission?${params}`;
  }

  async exchangeGoogleCodeForProfile(code: string): Promise<OAuthProfile> {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth not properly configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${this.configService.get<string>('APP_URL') || 'http://localhost:3000'}/auth/google/callback`,
      }),
    });

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    if (!tokenResponse.ok) {
      throw new BadRequestException('Failed to exchange Google code for token');
    }

    // Get user profile
    const profileResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`,
    );

    const profile = (await profileResponse.json()) as GoogleProfileResponse;
    if (!profileResponse.ok) {
      throw new BadRequestException('Failed to fetch Google user profile');
    }

    return {
      id: profile.id,
      email: profile.email,
      fullname: profile.name,
      provider: 'google',
    };
  }

  async exchangeFacebookCodeForProfile(code: string): Promise<OAuthProfile> {
    const appId = this.configService.get<string>('FACEBOOK_APP_ID');
    const appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET');

    if (!appId || !appSecret) {
      throw new BadRequestException('Facebook OAuth not properly configured');
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${appId}&client_secret=${appSecret}&code=${code}&` +
        `redirect_uri=${this.configService.get<string>('APP_URL') || 'http://localhost:3000'}/auth/facebook/callback`,
    );

    const tokenData = (await tokenResponse.json()) as FacebookTokenResponse;
    if (!tokenResponse.ok) {
      throw new BadRequestException(
        'Failed to exchange Facebook code for token',
      );
    }

    // Get user profile
    const profileResponse = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${tokenData.access_token}`,
    );

    const profile = (await profileResponse.json()) as FacebookProfileResponse;
    if (!profileResponse.ok) {
      throw new BadRequestException('Failed to fetch Facebook user profile');
    }

    return {
      id: profile.id,
      email: profile.email || '',
      fullname: profile.name,
      provider: 'facebook',
    };
  }

  async getZaloProfileFromToken(accessToken: string): Promise<OAuthProfile> {
    const profileResponse = await fetch(
      `https://graph.zalo.me/v2.0/me?fields=id,name,email&access_token=${accessToken}`,
    );

    const profile = (await profileResponse.json()) as ZaloProfileResponse;
    if (!profileResponse.ok || profile.error) {
      throw new BadRequestException('Failed to fetch Zalo user profile');
    }

    return {
      id: profile.id,
      email: profile.email || '',
      fullname: profile.name,
      provider: 'zalo',
    };
  }
}
