import { createContext, useContext, useMemo } from 'react'
import { useMyEntitlements } from './hooks/useMyEntitlements'
import type { EntitlementType } from './entitlements.types'

// ── Context ───────────────────────────────────────────────────────────────────

interface EntitlementContextValue {
  /** Returns true when the family has a currently-active entitlement of the given type. */
  hasEntitlement: (type: EntitlementType) => boolean
  /** True while the initial entitlements fetch is in-flight. */
  isLoading: boolean
}

const EntitlementContext = createContext<EntitlementContextValue>({
  hasEntitlement: () => false,
  isLoading: false,
})

// ── Provider ──────────────────────────────────────────────────────────────────

/**
 * EntitlementProvider must wrap any authenticated subtree that needs to check
 * feature access. It fetches `/api/me/entitlements` once on mount and memoises
 * the `hasEntitlement` helper so downstream components never trigger re-renders
 * unless the entitlement list itself changes.
 *
 * Place inside ProtectedRoute so it only runs for authenticated users.
 */
export function EntitlementProvider({ children }: { children: React.ReactNode }) {
  const { data: entitlements = [], isLoading } = useMyEntitlements()

  const value = useMemo<EntitlementContextValue>(() => ({
    hasEntitlement: (type) =>
      entitlements.some((e) => e.entitlementType === type && e.isActive),
    isLoading,
  }), [entitlements, isLoading])

  return (
    <EntitlementContext.Provider value={value}>
      {children}
    </EntitlementContext.Provider>
  )
}

// ── Consumer hook ─────────────────────────────────────────────────────────────

/**
 * Returns the entitlement checker from the nearest EntitlementProvider.
 *
 * @example
 *   const { hasEntitlement } = useEntitlements()
 *   if (!hasEntitlement('FamilySafetyPlanAccess')) return <LockedFeature ... />
 */
export function useEntitlements(): EntitlementContextValue {
  return useContext(EntitlementContext)
}
