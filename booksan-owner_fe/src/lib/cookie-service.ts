'use client';

export class CookieService {
  /**
   * Set a cookie with the given name, value, and options
   */
  static setCookie(
    name: string,
    value: string,
    options: {
      expires?: Date | number; // Date object or days from now
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: 'strict' | 'lax' | 'none';
      httpOnly?: boolean; // Note: httpOnly cannot be set from client-side
    } = {}
  ): void {
    if (typeof document === 'undefined') return;

    const {
      expires,
      path = '/',
      domain,
      secure = process.env.NODE_ENV === 'production',
      sameSite = 'lax',
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    // Handle expires
    if (expires) {
      let expirationDate: Date;
      if (typeof expires === 'number') {
        // If it's a number, treat it as days from now
        expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + expires * 24 * 60 * 60 * 1000);
      } else {
        expirationDate = expires;
      }
      cookieString += `; expires=${expirationDate.toUTCString()}`;
    }

    // Add other options
    if (path) cookieString += `; path=${path}`;
    if (domain) cookieString += `; domain=${domain}`;
    if (secure) cookieString += `; secure`;
    if (sameSite) cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  }

  /**
   * Get a cookie value by name
   */
  static getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }
    return null;
  }

  /**
   * Remove a cookie by name
   */
  static removeCookie(name: string, path: string = '/'): void {
    if (typeof document === 'undefined') return;

    // Set the cookie with an expiration date in the past
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
  }

  /**
   * Check if a cookie exists
   */
  static hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Get all cookies as an object
   */
  static getAllCookies(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const [name, value] = cookie.split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }

  /**
   * Clear all cookies (for the current domain and path)
   */
  static clearAllCookies(): void {
    if (typeof document === 'undefined') return;

    const cookies = this.getAllCookies();
    Object.keys(cookies).forEach(name => {
      this.removeCookie(name);
    });
  }
}

// Auth-specific cookie helpers
export class AuthCookieService {
  private static readonly ACCESS_TOKEN_KEY = 'accessToken';
  private static readonly TOKEN_EXPIRY_DAYS = 30;

  /**
   * Set access token cookie
   */
  static setAccessToken(token: string): void {
    CookieService.setCookie(this.ACCESS_TOKEN_KEY, token, {
      expires: this.TOKEN_EXPIRY_DAYS,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  /**
   * Get access token from cookie
   */
  static getAccessToken(): string | null {
    return CookieService.getCookie(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Remove access token cookie
   */
  static removeAccessToken(): void {
    CookieService.removeCookie(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Check if access token exists
   */
  static hasAccessToken(): boolean {
    return CookieService.hasCookie(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Clear all auth-related cookies
   */
  static clearAuthCookies(): void {
    this.removeAccessToken();
  }
}
