import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Shared shell for Login and Register pages.
 * Provides the gradient background, SafeFamily branding header, rounded card,
 * and an optional footer note (e.g. "Don't have an account? Sign up").
 */
export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/20 px-4 py-10">
      <div className="w-full max-w-[420px]">

        {/* Branding header */}
        <div className="mb-7 flex flex-col items-center gap-2.5 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-200">
            <ShieldCheck className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-gray-900">SafeFamily</p>
            <p className="mt-0.5 text-sm text-gray-500">{title}</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-gray-200 bg-white px-7 py-7 shadow-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <p className="mt-5 text-center text-sm text-gray-500">{footer}</p>
        )}
      </div>
    </div>
  )
}
