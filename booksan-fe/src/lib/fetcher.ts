import { env } from './env'
import { logger } from './logger'

export interface FetcherOptions extends RequestInit {
  baseURL?: string
  timeout?: number
  revalidate?: number | false
  tags?: string[]
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public url: string
  ) {
    super(message)
    this.name = 'FetchError'
  }
}

async function timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`))
    }, timeout)
  })

  try {
    const result = await Promise.race([promise, timeoutPromise])
    if (timeoutHandle) clearTimeout(timeoutHandle)
    return result
  } catch (error) {
    if (timeoutHandle) clearTimeout(timeoutHandle)
    throw error
  }
}

export async function fetcher<T = unknown>(
  url: string,
  options: FetcherOptions = {}
): Promise<T> {
  const {
    baseURL = env.NEXT_PUBLIC_BASE_API,
    timeout = 10000,
    revalidate,
    tags = [],
    ...fetchOptions
  } = options

  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`
  
  const requestInit: RequestInit = {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  }

  // Add Next.js cache options
  if (typeof revalidate !== 'undefined') {
    requestInit.next = {
      revalidate,
      tags,
      ...requestInit.next,
    }
  }

  try {
    logger.debug('Fetching:', { url: fullUrl, options: requestInit })

    const fetchPromise = fetch(fullUrl, requestInit)
    const response = await timeoutPromise(fetchPromise, timeout)

    if (!response.ok) {
      throw new FetchError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        fullUrl
      )
    }

    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      logger.debug('Fetch response:', { url: fullUrl, data })
      return data
    }

    return response.text() as T
  } catch (error) {
    logger.error('Fetch error:', { url: fullUrl, error })
    throw error
  }
}

// Convenience methods
export const api = {
  get: <T = unknown>(url: string, options?: Omit<FetcherOptions, 'method'>) =>
    fetcher<T>(url, { ...options, method: 'GET' }),

  post: <T = unknown>(url: string, data?: unknown, options?: Omit<FetcherOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : null
    return fetcher<T>(url, {
      ...options,
      method: 'POST',
      body,
    })
  },

  put: <T = unknown>(url: string, data?: unknown, options?: Omit<FetcherOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : null
    return fetcher<T>(url, {
      ...options,
      method: 'PUT',
      body,
    })
  },

  patch: <T = unknown>(url: string, data?: unknown, options?: Omit<FetcherOptions, 'method' | 'body'>) => {
    const body = data ? JSON.stringify(data) : null
    return fetcher<T>(url, {
      ...options,
      method: 'PATCH',
      body,
    })
  },

  delete: <T = unknown>(url: string, options?: Omit<FetcherOptions, 'method'>) =>
    fetcher<T>(url, { ...options, method: 'DELETE' }),
}

// Cache tag helpers
export const CacheTags = {
  USER: 'user',
  VENUES: 'venues',
  BOOKINGS: 'bookings',
  PROFILE: 'profile',
  CHAT: 'chat',
  WALLET: 'wallet',
} as const

export type CacheTag = typeof CacheTags[keyof typeof CacheTags]
