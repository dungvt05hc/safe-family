import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { settingsApi } from './settings.api'
import type { NotificationSettings, ProfileSettings, ChangePasswordRequest } from './settings.types'
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from '@/lib/i18n'

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

// ── Language preference ───────────────────────────────────────────────────────

/**
 * Returns the current resolved language code and a setter that:
 *   1. Applies the language change immediately via i18next.
 *   2. Persists the choice to localStorage (handled automatically by i18next's
 *      LanguageDetector with `caches: ['localStorage']`, key `sf-language`).
 *
 * TODO: when the backend exposes a user-settings endpoint for language
 * preference, add a mutation call inside `setLanguage` after the
 * `i18n.changeLanguage()` call:
 *   await settingsApi.updateLanguagePreference({ language: code })
 */
export function useLanguagePreference() {
  const { i18n } = useTranslation()
  const currentCode = (
    (i18n.resolvedLanguage ?? i18n.language ?? 'en').slice(0, 2)
  ) as SupportedLanguageCode

  function setLanguage(code: SupportedLanguageCode) {
    i18n.changeLanguage(code)
    // Future: sync to backend here
  }

  return { currentCode, setLanguage, languages: SUPPORTED_LANGUAGES }
}
