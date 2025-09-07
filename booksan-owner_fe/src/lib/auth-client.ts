'use client';

import type { AuthResponse } from './auth';

export class AuthServiceClient {
  async login(credentials: {
    email?: string;
    phone?: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await fetch('/api/auth/owner/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Owner login failed');
    }

    return result;
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}

export const authServiceClient = new AuthServiceClient();
