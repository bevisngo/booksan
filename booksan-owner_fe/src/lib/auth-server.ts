import { cookies } from 'next/headers';
import type { User, AuthResponse } from './auth';

export class AuthServiceServer {
  async getCurrentUser(): Promise<User | null> {
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
    await this.setAccessToken(result.data.accessToken);

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

  private async setAccessToken(accessToken: string): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }

  private async clearTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('accessToken');
  }


  private async getCookieHeader(): Promise<string> {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    const cookieStrings: string[] = [];
    if (accessToken) cookieStrings.push(`accessToken=${accessToken}`);

    return cookieStrings.join('; ');
  }
}

export const authServiceServer = new AuthServiceServer();
