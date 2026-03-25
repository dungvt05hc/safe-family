import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

// ─── Style maps ──────────────────────────────────────────────────────────────

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary:   'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400',
  outline:   'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-400',
  ghost:     'text-gray-600 hover:bg-gray-100 focus:ring-gray-400',
  danger:    'bg-red-600 text-white shadow-sm hover:bg-red-700 focus:ring-red-500',
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'rounded-md px-3 py-1.5 text-xs gap-1.5',
  md: 'rounded-lg px-4 py-2   text-sm gap-2',
  lg: 'rounded-xl px-5 py-2.5 text-base gap-2.5',
}

// ─── Component ───────────────────────────────────────────────────────────────

// ButtonProps extends HTMLMotionProps so callers can also pass framer-motion
// props (e.g. whileHover, layout) directly when needed.
export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Replaces content with a spinner and disables interaction */
  loading?: boolean
  // Narrow children back to ReactNode — HTMLMotionProps widens it to
  // MotionValue<string|number> which is not valid in standard JSX.
  children?: React.ReactNode
}

/**
 * Button — the primary interactive element used across all pages.
 *
 * @example
 *   <Button onClick={save}>Save</Button>
 *   <Button variant="outline" size="sm">Cancel</Button>
 *   <Button variant="danger" loading={isDeleting}>Delete</Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading = false, disabled, className, children, ...rest }, ref) => (
    <motion.button
      ref={ref}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.015 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <svg
          className="h-3.5 w-3.5 animate-spin shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  ),
)

Button.displayName = 'Button'
