import type {
  ChangePasswordRequest,
  NotificationSettings,
  ProfileSettings,
  UserSettings,
} from './settings.types'

// ── Mock data ─────────────────────────────────────────────────────────────────
// TODO: Replace with real API calls once backend endpoints are ready.
// e.g. getSettings: () => apiClient.get<UserSettings>('/api/settings')

const MOCK_SETTINGS: UserSettings = {
  profile: {
    fullName: 'Alex Johnson',
    email:    'alex@example.com',
    phone:    '+61 400 000 000',
  },
  notifications: {
    emailNotifications: true,
    bookingUpdates:     true,
    incidentAlerts:     true,
    reminders:          false,
  },
}

// ── API functions ─────────────────────────────────────────────────────────────

const delay = (ms = 600) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const settingsApi = {
  /** GET /api/settings */
  getSettings: async (): Promise<UserSettings> => {
    await delay(400)
    return { ...MOCK_SETTINGS, profile: { ...MOCK_SETTINGS.profile }, notifications: { ...MOCK_SETTINGS.notifications } }
  },

  /** PUT /api/settings/profile */
  updateProfile: async (data: ProfileSettings): Promise<ProfileSettings> => {
    await delay()
    Object.assign(MOCK_SETTINGS.profile, data)
    return { ...MOCK_SETTINGS.profile }
  },

  /** PUT /api/settings/notifications */
  updateNotifications: async (data: NotificationSettings): Promise<NotificationSettings> => {
    await delay()
    Object.assign(MOCK_SETTINGS.notifications, data)
    return { ...MOCK_SETTINGS.notifications }
  },

  /** POST /api/settings/change-password */
  changePassword: async (_data: ChangePasswordRequest): Promise<void> => {
    await delay(800)
    // TODO: return apiClient.post('/api/settings/change-password', data)
  },

  /** POST /api/settings/request-data-export */
  requestDataExport: async (): Promise<void> => {
    await delay(700)
    // TODO: return apiClient.post('/api/settings/request-data-export')
  },

  /** POST /api/settings/request-account-deletion */
  requestAccountDeletion: async (): Promise<void> => {
    await delay(800)
    // TODO: return apiClient.post('/api/settings/request-account-deletion')
  },
}
