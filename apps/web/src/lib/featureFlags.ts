/**
 * Centralized feature flag helper.
 *
 * All VITE_FEATURE_* env vars are read here. Components should import
 * `useFeatureFlags` (for reactive reads inside React) or `FEATURE_FLAGS`
 * (for static reads outside React, e.g. router-level guards).
 *
 * Flags default to `false` when the env var is absent so that unreleased
 * features are safely hidden in production builds.
 */

function parseBool(value: string | undefined): boolean {
  return value === 'true' || value === '1'
}

/** Immutable snapshot — safe to use outside React (e.g. router guards). */
export const FEATURE_FLAGS = {
  bookingEnabled:  parseBool(import.meta.env.VITE_FEATURE_BOOKING_ENABLED),
  plansEnabled:    parseBool(import.meta.env.VITE_FEATURE_PLANS_ENABLED),
  paymentsEnabled: parseBool(import.meta.env.VITE_FEATURE_PAYMENTS_ENABLED),
} as const

export type FeatureFlags = typeof FEATURE_FLAGS

/**
 * React hook — returns the current feature flags.
 * Returns the same stable object on every render (no re-renders triggered).
 */
export function useFeatureFlags(): FeatureFlags {
  return FEATURE_FLAGS
}
