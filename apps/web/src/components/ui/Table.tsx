import {
  type ReactNode,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  type HTMLAttributes,
} from 'react'
import { cn } from '@/lib/utils'

type Align = 'left' | 'center' | 'right'

// ─── TableContainer ──────────────────────────────────────────────────────────

/**
 * Outer wrapper with border, rounded corners, and overflow clipping.
 * Use this as the parent of every data table.
 */
export function TableContainer({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      {children}
    </div>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

export function Table({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <table className={cn('min-w-full divide-y divide-gray-200 text-sm', className)}>
      {children}
    </table>
  )
}

// ─── Thead ────────────────────────────────────────────────────────────────────

export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50">{children}</thead>
}

// ─── Tbody ────────────────────────────────────────────────────────────────────

export function Tbody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
}

// ─── Th ──────────────────────────────────────────────────────────────────────

export interface ThProps extends ThHTMLAttributes<HTMLTableCellElement> {
  align?: Align
}

export function Th({ align = 'left', className, children, ...rest }: ThProps) {
  return (
    <th
      scope="col"
      className={cn(
        'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500',
        align === 'right'  && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...rest}
    >
      {children}
    </th>
  )
}

// ─── Tr ──────────────────────────────────────────────────────────────────────

export interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Extra: makes the row look clickable when an onClick is present */
  clickable?: boolean
}

export function Tr({ className, children, onClick, clickable, ...rest }: TrProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'transition-colors hover:bg-gray-50',
        (onClick ?? clickable) && 'cursor-pointer',
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  )
}

// ─── Td ──────────────────────────────────────────────────────────────────────

export interface TdProps extends TdHTMLAttributes<HTMLTableDataCellElement> {
  align?: Align
}

export function Td({ align = 'left', className, children, ...rest }: TdProps) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-gray-700',
        align === 'right'  && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  )
}
