import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { queryClient } from '@/lib/queryClient'
import { router } from './router'

/**
 * AppProviders composes all top-level providers.
 * Add new providers (e.g. auth context, theme) here.
 */
export function AppProviders() {
  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </MotionConfig>
  )
}
