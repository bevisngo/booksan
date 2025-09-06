import { fetcher, FetcherOptions } from './fetcher';

// Client-side authenticated fetcher
export async function authFetcher<T = unknown>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  // Get token from localStorage (client-side only)
  let token: string | null = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('accessToken');
  }

  // Add authorization header if token exists
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  return fetcher<T>(url, {
    ...options,
    headers,
  });
}

// Convenience methods for authenticated requests
export const authApi = {
  get: <T = unknown>(url: string, options?: Omit<FetcherOptions, 'method'>) =>
    authFetcher<T>(url, { ...options, method: 'GET' }),

  post: <T = unknown>(url: string, data?: unknown, options?: Omit<FetcherOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : null;
    return authFetcher<T>(url, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put: <T = unknown>(url: string, data?: unknown, options?: Omit<FetcherOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : null;
    return authFetcher<T>(url, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  patch: <T = unknown>(url: string, data?: unknown, options?: Omit<FetcherOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : null;
    return authFetcher<T>(url, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  delete: <T = unknown>(url: string, options?: Omit<FetcherOptions, 'method'>) =>
    authFetcher<T>(url, { ...options, method: 'DELETE' }),
};
