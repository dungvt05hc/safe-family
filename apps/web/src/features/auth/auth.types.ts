/** Mirrors the backend AuthUserResponse DTO. */
export type UserRole = 'User' | 'Admin'

export interface AuthUser {
  id: string
  email: string
  displayName: string
  role: UserRole
  /**
   * True when this sign-in created a brand-new SafeFamily account
   * (first-time Google sign-in). Absent / false for all other flows.
   * Used to route new users to the family-onboarding wizard.
   */
  isNewUser?: boolean
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
