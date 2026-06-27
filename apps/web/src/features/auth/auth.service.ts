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

  /**
   * Signs in (or auto-registers) via any supported external identity provider.
   * `provider` must match the `ProviderName` of a registered backend verifier
   * (e.g. "Google", "Apple", "Microsoft").
   */
  externalLogin: (provider: string, idToken: string): Promise<AuthUser> =>
    apiClient.post<AuthUser>('/api/auth/external', { provider, idToken }),
}
