import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { queryClient } from '@/lib/queryClient'
import { router } from './router'

// Set VITE_GOOGLE_CLIENT_ID in your .env file (never hardcode the client ID in source).
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

/**
 * AppProviders composes all top-level providers.
 * Add new providers (e.g. auth context, theme) here.
 */
export function AppProviders() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <MotionConfig reducedMotion="user">
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MotionConfig>
    </GoogleOAuthProvider>
  )
}
