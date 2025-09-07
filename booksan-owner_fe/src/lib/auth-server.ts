import { cookies } from 'next/headers';
import type { User, AuthResponse } from './auth';

export class AuthServiceServer {
  async getCurrentUser(): Promise<User | null> {
    const cookieHeader = await this.getCookieHeader();
    console.log('cookie header', cookieHeader);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000/v1'}/api/auth/me`,
        {
          headers: {
            Cookie: await this.getCookieHeader(),
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await this.logout();
        }
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async login(credentials: {
    email?: string;
    phone?: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000/v1'}/api/auth/owner/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Owner login failed');
    }

    // Set HTTP-only cookies
    await this.setTokens(result.data.accessToken, result.data.refreshToken);

    return result;
  }

  async logout(): Promise<void> {
    try {
      console.log('logout');
      await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000/v1'}/api/auth/logout`,
        {
          method: 'POST',
          headers: {
            Cookie: await this.getCookieHeader(),
          },
        }
      );
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await this.clearTokens();
    }
  }

  private async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('accessToken')?.value || null;
  }

  private async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('refreshToken')?.value || null;
  }

  private async setTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  private async clearTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
  }

  async refreshAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:8000/v1'}/api/auth/refresh`,
        {
          method: 'POST',
          headers: {
            Cookie: await this.getCookieHeader(),
          },
        }
      );

      if (!response.ok) {
        console.log('token refresh failed');
        await this.clearTokens();
        return false;
      }

      const result = await response.json();
      await this.setTokens(result.data.accessToken, result.data.refreshToken);
      return true;
    } catch (error) {
      console.log('token refresh error');
      console.error('Token refresh error:', error);
      await this.clearTokens();
      return false;
    }
  }

  private async getCookieHeader(): Promise<string> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    const refreshToken = cookieStore.get('refreshToken')?.value;

    const cookieStrings: string[] = [];
    if (accessToken) cookieStrings.push(`accessToken=${accessToken}`);
    if (refreshToken) cookieStrings.push(`refreshToken=${refreshToken}`);

    return cookieStrings.join('; ');
  }
}

export const authServiceServer = new AuthServiceServer();
