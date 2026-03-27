// ── Profile ───────────────────────────────────────────────────────────────────

export interface ProfileSettings {
  fullName: string
  email:    string
  phone:    string
}

// ── Notifications ─────────────────────────────────────────────────────────────

export interface NotificationSettings {
  emailNotifications: boolean
  bookingUpdates:     boolean
  incidentAlerts:     boolean
  reminders:          boolean
}

// ── Aggregated user settings ──────────────────────────────────────────────────

export interface UserSettings {
  profile:       ProfileSettings
  notifications: NotificationSettings
}

// ── Mutation request shapes ───────────────────────────────────────────────────

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword:     string
  confirmPassword: string
}

// ── Privacy action response ───────────────────────────────────────────────────

export interface PrivacyActionResponse {
  message:     string
  requestedAt: string  // ISO-8601 timestamp
}

// ── Tab navigation ────────────────────────────────────────────────────────────

export type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy' | 'danger'

export const SETTINGS_TABS: { id: SettingsTab; label: string }[] = [
  { id: 'profile',       label: 'Profile' },
  { id: 'security',      label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy',       label: 'Privacy' },
  { id: 'danger',        label: 'Danger Zone' },
]
