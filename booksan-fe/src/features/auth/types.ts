// Authentication types based on the API guide

export interface User {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN' | 'OWNER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export interface SignupRequest {
  fullname: string;
  email?: string;
  phone?: string;
  password: string;
  passwordConfirm?: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  data: {
    accessToken: string;
  };
}

export interface MeResponse {
  data: User;
}

// OAuth types
export interface OAuthUrlResponse {
  data: {
    url: string;
  };
}

export interface GoogleCallbackRequest {
  code: string;
}

export interface FacebookCallbackRequest {
  code: string;
}

export interface ZaloLoginRequest {
  accessToken: string;
}

// Error response type
export interface AuthErrorResponse {
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
  statusCode: number;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  signup: (userData: SignupRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  getCurrentUser: () => Promise<User | null>;
  // OAuth methods
  getGoogleAuthUrl: () => Promise<OAuthUrlResponse>;
  handleGoogleCallback: (code: string) => Promise<AuthResponse>;
  getFacebookAuthUrl: () => Promise<OAuthUrlResponse>;
  handleFacebookCallback: (code: string) => Promise<AuthResponse>;
  getZaloAuthUrl: () => Promise<OAuthUrlResponse>;
  loginWithZalo: (accessToken: string) => Promise<AuthResponse>;
}

// Auth state types
export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}