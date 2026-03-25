/** Mirrors the backend AuthUserResponse DTO. */
export type UserRole = 'User' | 'Admin'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: UserRole
}

export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  email: string
  displayName: string
  password: string
}
