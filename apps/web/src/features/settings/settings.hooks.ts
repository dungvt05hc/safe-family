import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from './settings.api'
import type { NotificationSettings, ProfileSettings, ChangePasswordRequest } from './settings.types'

// ── Query keys ────────────────────────────────────────────────────────────────

export const SETTINGS_KEY = ['settings'] as const

// ── Queries ───────────────────────────────────────────────────────────────────

/**
 * Fetches the current user's settings (profile + notifications).
 */
export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn:  settingsApi.getSettings,
    staleTime: 60_000,
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Updates the user's profile (full name, email, phone).
 * Invalidates the settings query on success.
 */
export function useUpdateProfileSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProfileSettings) => settingsApi.updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  })
}

/**
 * Updates the user's notification preferences.
 * Invalidates the settings query on success.
 */
export function useUpdateNotificationSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: NotificationSettings) => settingsApi.updateNotifications(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: SETTINGS_KEY }),
  })
}

/**
 * Changes the user's password.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => settingsApi.changePassword(data),
  })
}

/**
 * Requests a full data export for the authenticated user.
 */
export function useRequestDataExport() {
  return useMutation({
    mutationFn: settingsApi.requestDataExport,
  })
}

/**
 * Requests account deletion. Irreversible — use with a confirmation flow.
 */
export function useRequestAccountDeletion() {
  return useMutation({
    mutationFn: settingsApi.requestAccountDeletion,
  })
}
