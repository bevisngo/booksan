// Note: Token refresh is handled by the browser automatically via cookies
// No need to import server-side auth service here

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
    // Use NextJS API routes as middleware instead of calling backend directly
    this.baseUrl = '/api';
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
    };

    let response = await fetch(url, config);

    // Handle token refresh for 401 errors
    // Note: Token refresh is handled automatically by the browser via HTTP-only cookies
    // If we get a 401, the user needs to re-authenticate
    if (response.status === 401) {
      // Redirect to login page or handle authentication error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
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

    const config: RequestInit = {
      method: 'POST',
      headers: {
        ...options?.headers,
      },
      credentials: 'include',
      body: formData,
      ...options,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);
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
