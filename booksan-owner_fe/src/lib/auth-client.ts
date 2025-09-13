'use client';

import type { AuthResponse } from './auth';
import { AuthCookieService } from './cookie-service';

export class AuthServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
  }

  async login(credentials: {
    email?: string;
    phone?: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/owner/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Owner login failed');
    }

    // Set access token cookie with proper configuration
    AuthCookieService.setAccessToken(result.data.accessToken);

    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear auth cookies on logout
      AuthCookieService.clearAuthCookies();
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${this.baseUrl}/owner/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${AuthCookieService.getAccessToken()}`,
        },
      });

      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid access token)
   */
  isAuthenticated(): boolean {
    return AuthCookieService.hasAccessToken();
  }

  /**
   * Get the current access token
   */
  getAccessToken(): string | null {
    return AuthCookieService.getAccessToken();
  }

  /**
   * Clear all authentication data
   */
  clearAuth(): void {
    AuthCookieService.clearAuthCookies();
  }
}

export const authServiceClient = new AuthServiceClient();
