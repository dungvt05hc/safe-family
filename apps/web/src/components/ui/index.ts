/**
 * SafeFamily Design System — UI component barrel.
 *
 * Import everything from here rather than from individual files:
 *   import { Button, Badge, Card, CardHeader, Alert } from '@/components/ui'
 */

// ─── Primitives ───────────────────────────────────────────────────────────────

export { Button }           from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button'

export { Badge }            from './Badge'
export type { BadgeProps, BadgeVariant } from './Badge'

export { Spinner, LoadingState } from './Spinner'
export type { SpinnerProps, SpinnerSize } from './Spinner'

export { Alert }            from './Alert'
export type { AlertProps, AlertVariant } from './Alert'

// ─── Layout surfaces ─────────────────────────────────────────────────────────

export { Card, CardHeader, CardTitle, CardContent, CardFooter } from './Card'
export type { CardProps } from './Card'

export { SectionHeader }    from './SectionHeader'
export type { SectionHeaderProps } from './SectionHeader'

// ─── Data display ─────────────────────────────────────────────────────────────

export { TableContainer, Table, Thead, Tbody, Th, Tr, Td } from './Table'
export type { ThProps, TrProps, TdProps } from './Table'

// ─── Empty states ─────────────────────────────────────────────────────────────

export { EmptyState }       from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export {
  NoFamilyMembersEmpty,
  NoAccountsEmpty,
  NoDevicesEmpty,
  NoIncidentsEmpty,
  NoBookingsEmpty,
} from './entity-empty-states'
