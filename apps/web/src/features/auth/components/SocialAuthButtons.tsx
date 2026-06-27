import type { ComponentType } from 'react'
import { GoogleSignInButton } from './GoogleSignInButton'

// ── Social button contract ────────────────────────────────────────────────────

/** Props shared by every social provider button component. */
export interface SocialButtonProps {
  mode?: 'signin' | 'signup'
  redirectTo?: string
}

// ── Provider registry ─────────────────────────────────────────────────────────
//
// Each entry is a React component that handles one provider's full auth flow
// (SDK popup, token exchange, loading state, error state).
//
// To add a new provider:
//   1. Create the button component (e.g. `AppleSignInButton.tsx`) following the
//      same `SocialButtonProps` contract.
//   2. Register the backend verifier (see `AppleTokenVerifier : IExternalTokenVerifier`).
//   3. Uncomment (or add) the entry below — nothing else needs to change.
//
const ENABLED_PROVIDERS: ComponentType<SocialButtonProps>[] = [
  GoogleSignInButton,
  // AppleSignInButton,
  // FacebookSignInButton,
  // MicrosoftSignInButton,
]

// ── Composite component ───────────────────────────────────────────────────────

/**
 * Renders all enabled social sign-in buttons in a consistent layout.
 * Import this instead of individual provider buttons so pages stay
 * unaware of which providers are active.
 */
export function SocialAuthButtons({ mode = 'signin', redirectTo }: SocialButtonProps) {
  return (
    <div className="space-y-3">
      {ENABLED_PROVIDERS.map((Button) => (
        <Button
          key={Button.displayName ?? Button.name}
          mode={mode}
          redirectTo={redirectTo}
        />
      ))}
    </div>
  )
}
