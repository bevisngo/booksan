import { cookies } from 'next/headers';
import type { User, AuthResponse } from './auth';

export class AuthServiceServer {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.getAccessToken();
      if (!token) return null;

      const response = await fetch(`${this.baseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

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
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Login failed');
    }

    // Set HTTP-only cookies
    await this.setTokens(result.data.accessToken, result.data.refreshToken);

    return result;
  }

  async logout(): Promise<void> {
    try {
      const token = await this.getAccessToken();
      if (token) {
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
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
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens();
        return false;
      }

      const result = await response.json();
      await this.setTokens(result.data.accessToken, refreshToken);
      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearTokens();
      return false;
    }
  }
}

export const authServiceServer = new AuthServiceServer();
