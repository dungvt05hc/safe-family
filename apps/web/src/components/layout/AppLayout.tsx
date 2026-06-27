import { Outlet } from 'react-router-dom'
import { AppShell } from './AppShell'

interface AppLayoutProps {
  /**
   * Directly suppress the global footer for this layout instance.
   * Prefer route-level control via `handle: { hideFooter: true }` in router.tsx.
   */
  hideFooter?: boolean
}

export function AppLayout({ hideFooter }: AppLayoutProps) {
  return (
    <AppShell hideFooter={hideFooter}>
      <Outlet />
    </AppShell>
  )
}
