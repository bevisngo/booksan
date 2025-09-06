import { revalidateTag } from 'next/cache'

export const AuthCacheTags = {
  USER: 'auth:user',
  SESSION: 'auth:session',
  PROFILE: 'auth:profile',
} as const

export type AuthCacheTag = typeof AuthCacheTags[keyof typeof AuthCacheTags]

// Cache invalidation functions
export function invalidateUserCache() {
  revalidateTag(AuthCacheTags.USER)
}

export function invalidateSessionCache() {
  revalidateTag(AuthCacheTags.SESSION)
}

export function invalidateProfileCache() {
  revalidateTag(AuthCacheTags.PROFILE)
}

export function invalidateAllAuthCache() {
  Object.values(AuthCacheTags).forEach(tag => {
    revalidateTag(tag)
  })
}

// Query keys for React Query
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}
