import type { FeatureFlags } from '@/lib/featureFlags'
import { FEATURE_FLAGS } from '@/lib/featureFlags'
import { FeatureComingSoon } from '@/components/ui/FeatureComingSoon'

interface FeatureFlagRouteProps {
  /** The flag that must be `true` to render children. */
  flag: keyof FeatureFlags
  children: React.ReactNode
}

/**
 * FeatureFlagRoute — wraps a route element and shows a Coming Soon placeholder
 * when the named feature flag is disabled, keeping the user inside the app
 * layout (sidebar stays accessible).
 *
 * Uses the static `FEATURE_FLAGS` snapshot so the check runs synchronously at
 * render time — no async, no flash of content.
 *
 * Usage in the router:
 *   { path: 'bookings', element: (
 *       <FeatureFlagRoute flag="bookingEnabled">
 *         <BookingFormPage />
 *       </FeatureFlagRoute>
 *   )}
 */
export function FeatureFlagRoute({ flag, children }: FeatureFlagRouteProps) {
  if (!FEATURE_FLAGS[flag]) {
    return <FeatureComingSoon feature={flag} />
  }
  return <>{children}</>
}
