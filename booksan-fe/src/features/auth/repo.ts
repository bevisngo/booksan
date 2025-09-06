import { api } from '@/lib/fetcher'
import { AuthCacheTags } from './cache'
import type {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
} from './types'

class AuthRepository {
  // Authentication
  async login(data: LoginRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', data)
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/signup', data)
  }

  async logout(): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>('/auth/logout')
    // Clear cache after logout
    return result
  }

  async refreshToken(): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/refresh')
  }

  // User data
  async getCurrentUser(): Promise<User> {
    return api.get('/auth/me', {
      tags: [AuthCacheTags.USER],
      revalidate: 300, // 5 minutes
    })
  }
}

export const authRepo = new AuthRepository()
