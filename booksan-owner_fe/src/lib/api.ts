import { AuthCookieService } from './cookie-service';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    // Call backend API directly
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/v1';
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get access token from cookie (client-side)
    const accessToken = typeof window !== 'undefined' ? AuthCookieService.getAccessToken() : null;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    let response = await fetch(url, config);

    // Handle 401 errors - redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
      return Promise.reject(new ApiError(401, 'Authentication required'));
    }

    const result: ApiResponse<T> = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        response.status,
        result.message || result.error || 'Request failed',
        result
      );
    }

    return (result.data || result) as T;
  }

  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }

  async uploadFile(
    endpoint: string,
    file: File,
    options?: RequestInit
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    // Get access token from cookie (client-side)
    const accessToken = typeof window !== 'undefined' ? AuthCookieService.getAccessToken() : null;

    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options?.headers,
      },
      credentials: 'include',
      body: formData,
      ...options,
    };

    let response = await fetch(`${this.baseUrl}${endpoint}`, config);

    // Handle 401 errors - redirect to login
    if (response.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
      return Promise.reject(new ApiError(401, 'Authentication required'));
    }

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new ApiError(
        response.status,
        result.message || 'Upload failed',
        result
      );
    }

    return (result.data || result) as any;
  }


}

export const apiClient = new ApiClient();
