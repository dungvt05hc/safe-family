import { apiClient } from '@/lib/api-client'
import type { AuthUser, LoginFormValues, RegisterFormValues } from './auth.types'

export const authService = {
  me: (): Promise<AuthUser> =>
    apiClient.get<AuthUser>('/api/auth/me'),

  login: (data: LoginFormValues): Promise<AuthUser> =>
    apiClient.post<AuthUser>('/api/auth/login', data),

  register: (data: RegisterFormValues): Promise<AuthUser> =>
    apiClient.post<AuthUser>('/api/auth/register', data),

  logout: (): Promise<void> =>
    apiClient.post<void>('/api/auth/logout'),
}
