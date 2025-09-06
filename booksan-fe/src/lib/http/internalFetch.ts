import { env } from '@/lib/env'

interface InternalFetchOptions extends RequestInit {
  timeout?: number
}

export class InternalFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public url: string
  ) {
    super(message)
    this.name = 'InternalFetchError'
  }
}

/**
 * Internal fetch helper for server-to-server communication with NestJS backend
 * Only available on the server side - never exposes backend URL to browser
 */
export async function internalFetch<T = unknown>(
  endpoint: string,
  options: InternalFetchOptions = {}
): Promise<T> {
  // Only allow this function to run on the server
  if (typeof window !== 'undefined') {
    throw new Error('internalFetch can only be used on the server side')
  }

  const {
    timeout = 10000,
    ...fetchOptions
  } = options

  const baseUrl = env.NEXT_PUBLIC_BASE_API
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
      cache: 'no-store', // Always fresh data for server actions
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Booksan-Frontend/1.0',
        ...fetchOptions.headers,
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new InternalFetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        url
      )
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      return await response.json()
    }

    return (await response.text()) as T
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof InternalFetchError) {
      throw error
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    
    throw new Error(`Internal fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Convenience methods for different HTTP verbs
export const internalApi = {
  get: <T = unknown>(url: string, options?: Omit<InternalFetchOptions, 'method'>) =>
    internalFetch<T>(url, { ...options, method: 'GET' }),

  post: <T = unknown>(url: string, data?: unknown, options?: Omit<InternalFetchOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : undefined
    return internalFetch<T>(url, {
      ...options,
      method: 'POST',
      ...(body && { body }),
    })
  },

  put: <T = unknown>(url: string, data?: unknown, options?: Omit<InternalFetchOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : undefined
    return internalFetch<T>(url, {
      ...options,
      method: 'PUT',
      ...(body && { body }),
    })
  },

  patch: <T = unknown>(url: string, data?: unknown, options?: Omit<InternalFetchOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : undefined
    return internalFetch<T>(url, {
      ...options,
      method: 'PATCH',
      ...(body && { body }),
    })
  },

  delete: <T = unknown>(url: string, options?: Omit<InternalFetchOptions, 'method'>) =>
    internalFetch<T>(url, { ...options, method: 'DELETE' }),
}
