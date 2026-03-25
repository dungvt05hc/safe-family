import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps {
  className?: string
  children: ReactNode
}

/**
 * Card — the base white rounded surface used for all content panels.
 * Compose with CardHeader, CardContent, CardFooter as needed.
 *
 * @example
 *   <Card>
 *     <CardHeader><CardTitle>Members</CardTitle></CardHeader>
 *     <CardContent>…</CardContent>
 *   </Card>
 */
export function Card({ className, children }: CardProps) {
  return (
    <div className={cn('rounded-2xl border border-gray-100 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

// ─── CardHeader ───────────────────────────────────────────────────────────────

export function CardHeader({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── CardTitle ────────────────────────────────────────────────────────────────

export function CardTitle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <h2 className={cn('text-sm font-semibold text-gray-800 leading-snug', className)}>
      {children}
    </h2>
  )
}

// ─── CardContent ─────────────────────────────────────────────────────────────

export function CardContent({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}

// ─── CardFooter ──────────────────────────────────────────────────────────────

export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border-t border-gray-100 px-5 py-3', className)}>
      {children}
    </div>
  )
}
