import { useMatches } from 'react-router-dom'

/**
 * RouteHandle — metadata object that any route can attach via its `handle` key.
 *
 * Usage in router.tsx:
 *   { path: 'assessment/wizard', element: <AssessmentWizardPage />, handle: { hideFooter: true } }
 */
export interface RouteHandle {
  /**
   * When true, AppShell will suppress the global AppFooter for this route.
   * Use this for wizard flows, full-screen tools, or payment callbacks where
   * the persistent footer would be distracting.
   */
  hideFooter?: boolean
}

/**
 * useHideFooter — returns true if the deepest matched route has declared
 * `handle.hideFooter: true`.
 *
 * Consumed by AppShell so individual routes can opt out of the footer without
 * prop drilling through every layout wrapper.
 */
export function useHideFooter(): boolean {
  const matches = useMatches()
  // Walk from deepest to shallowest — first match with an opinion wins
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle as RouteHandle | undefined
    if (handle?.hideFooter !== undefined) {
      return handle.hideFooter
    }
  }
  return false
}
