import { apiClient } from '@/lib/api-client'
import type {
  ChangePasswordRequest,
  NotificationSettings,
  PrivacyActionResponse,
  ProfileSettings,
  UserSettings,
} from './settings.types'

// ── Backend response shapes ───────────────────────────────────────────────────

interface BackendProfile {
  id:       string
  fullName: string
  email:    string
  phone:    string | null
}

interface BackendNotifications {
  emailNotificationsEnabled:    boolean
  bookingUpdatesEnabled:        boolean
  incidentAlertsEnabled:        boolean
  reminderNotificationsEnabled: boolean
}

interface BackendSettingsResponse {
  profile:       BackendProfile
  notifications: BackendNotifications
}

// ── Mapping helpers ───────────────────────────────────────────────────────────

function toNotificationSettings(n: BackendNotifications): NotificationSettings {
  return {
    emailNotifications: n.emailNotificationsEnabled,
    bookingUpdates:     n.bookingUpdatesEnabled,
    incidentAlerts:     n.incidentAlertsEnabled,
    reminders:          n.reminderNotificationsEnabled,
  }
}

function toProfileSettings(p: BackendProfile): ProfileSettings {
  return {
    fullName: p.fullName,
    email:    p.email,
    phone:    p.phone ?? '',
  }
}

// ── API ───────────────────────────────────────────────────────────────────────

export const settingsApi = {
  /** GET /api/settings */
  getSettings: (): Promise<UserSettings> =>
    apiClient.get<BackendSettingsResponse>('/api/settings').then((r) => ({
      profile:       toProfileSettings(r.profile),
      notifications: toNotificationSettings(r.notifications),
    })),

  /** PUT /api/settings/profile */
  updateProfile: (data: ProfileSettings): Promise<ProfileSettings> =>
    apiClient
      .put<BackendProfile>('/api/settings/profile', {
        fullName: data.fullName,
        phone:    data.phone || null,
      })
      .then(toProfileSettings),

  /** PUT /api/settings/notifications */
  updateNotifications: (data: NotificationSettings): Promise<NotificationSettings> =>
    apiClient
      .put<BackendNotifications>('/api/settings/notifications', {
        emailNotificationsEnabled:    data.emailNotifications,
        bookingUpdatesEnabled:        data.bookingUpdates,
        incidentAlertsEnabled:        data.incidentAlerts,
        reminderNotificationsEnabled: data.reminders,
      })
      .then(toNotificationSettings),

  /** POST /api/settings/change-password — returns 204 No Content */
  changePassword: (data: ChangePasswordRequest): Promise<void> =>
    apiClient.post('/api/settings/change-password', {
      currentPassword:    data.currentPassword,
      newPassword:        data.newPassword,
      confirmNewPassword: data.confirmPassword,
    }),

  /** POST /api/settings/request-data-export */
  requestDataExport: (): Promise<PrivacyActionResponse> =>
    apiClient.post<PrivacyActionResponse>('/api/settings/request-data-export'),

  /** POST /api/settings/request-account-deletion */
  requestAccountDeletion: (): Promise<PrivacyActionResponse> =>
    apiClient.post<PrivacyActionResponse>('/api/settings/request-account-deletion'),
}

