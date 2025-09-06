import {
  AuthResponse,
  SignupRequest,
  LoginRequest,
  RefreshResponse,
  MeResponse,
  OAuthUrlResponse,
  User,
} from "./types";

class AuthService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl || process.env.NEXT_PUBLIC_BASE_API || "http://localhost:8000/v1";
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  }

  clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }

  // API request helper with automatic token refresh
  async apiRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAccessToken();

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    let response = await fetch(url, config);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request with new token
        const newToken = this.getAccessToken();
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${newToken}`,
        };
        response = await fetch(url, config);
      }
    }

    return response;
  }

  // Authentication methods
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    const response = await this.apiRequest("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    } else {
      throw new Error(data.message || "Signup failed");
    }
    return data;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    } else {
      throw new Error(data.message || "Login failed");
    }
    return data;
  }

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data: RefreshResponse = await response.json();
        this.setTokens(data.data.accessToken, refreshToken);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch {
      this.clearTokens();
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.apiRequest("/auth/me");
      if (response.ok) {
        const data: MeResponse = await response.json();
        return data.data;
      } else if (response.status === 401) {
        // Token is invalid or expired
        this.clearTokens();
        return null;
      } else {
        // Other error, don't clear tokens
        return null;
      }
    } catch (error) {
      // Network error or other issue, don't clear tokens
      console.error("Failed to get current user:", error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.apiRequest("/auth/logout", { method: "POST" });
    } catch {
      // Continue with logout even if API call fails
      // API call failed, but we still clear local tokens
    } finally {
      this.clearTokens();
    }
  }

  // OAuth methods
  async getGoogleAuthUrl(): Promise<OAuthUrlResponse> {
    const response = await this.apiRequest("/auth/google");
    return response.json();
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await this.apiRequest(
      `/auth/google/callback?code=${code}`
    );
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    } else {
      throw new Error(data.message || "Google authentication failed");
    }
    return data;
  }

  async getFacebookAuthUrl(): Promise<OAuthUrlResponse> {
    const response = await this.apiRequest("/auth/facebook");
    return response.json();
  }

  async handleFacebookCallback(code: string): Promise<AuthResponse> {
    const response = await this.apiRequest(
      `/auth/facebook/callback?code=${code}`
    );
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    } else {
      throw new Error(data.message || "Facebook authentication failed");
    }
    return data;
  }

  async getZaloAuthUrl(): Promise<OAuthUrlResponse> {
    const response = await this.apiRequest("/auth/zalo");
    return response.json();
  }

  async loginWithZalo(accessToken: string): Promise<AuthResponse> {
    const response = await this.apiRequest("/auth/zalo/login", {
      method: "POST",
      body: JSON.stringify({ accessToken }),
    });
    const data = await response.json();
    if (response.ok) {
      this.setTokens(data.data.accessToken, data.data.refreshToken);
    } else {
      throw new Error(data.message || "Zalo authentication failed");
    }
    return data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Check if user is properly authenticated with valid token and user data
  isFullyAuthenticated(): boolean {
    return this.isAuthenticated() && !!this.getStoredUser();
  }

  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  setStoredUser(user: User): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("user", JSON.stringify(user));
  }

  clearStoredUser(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("user");
  }

  // set cookie auth-token
  setCookieAuthToken(token: string): void {
    if (typeof window === "undefined") return;
    document.cookie = `auth-token=${token}; path=/`;
  }

  // clear cookie auth-token
  clearCookieAuthToken(): void {
    if (typeof window === "undefined") return;
    document.cookie = `auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default AuthService;
