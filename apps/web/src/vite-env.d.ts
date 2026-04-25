/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string

  // Feature flags — 'true' to enable; absent / 'false' to disable.
  readonly VITE_FEATURE_BOOKING_ENABLED?: string
  readonly VITE_FEATURE_PLANS_ENABLED?: string
  readonly VITE_FEATURE_PAYMENTS_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
