// ── API shapes (match ChecklistItemDto / UpdateChecklistStatusRequest) ────────

/** Backend enum values returned as strings by the API */
export type ChecklistStatus   = 'Pending' | 'Completed' | 'Dismissed'
export type ChecklistPriority = 1 | 2 | 3  // 1 = High, 2 = Medium, 3 = Low

/** Matches ChecklistItemDto from ChecklistDtos.cs */
export interface ChecklistItem {
  id:          string
  title:       string
  description: string
  /** String version of ChecklistCategory enum, e.g. "AccountSecurity" */
  category:    string
  status:      ChecklistStatus
  /** 1 = High, 2 = Medium, 3 = Low */
  priority:    ChecklistPriority
  sourceType:  string
  sourceId:    string | null
}

/** Matches UpdateChecklistStatusRequest record */
export interface UpdateChecklistStatusRequest {
  status: ChecklistStatus
}

// ── Filter types ──────────────────────────────────────────────────────────────

export type PriorityFilter = 'All' | '1' | '2' | '3'
export type StatusFilter   = 'All' | ChecklistStatus
export type CategoryFilter = 'All' | string

export interface ChecklistFilters {
  search:   string
  priority: PriorityFilter
  status:   StatusFilter
  category: CategoryFilter
}

// ── Display helpers ───────────────────────────────────────────────────────────

import type { BadgeVariant } from '@/components/ui'

export const PRIORITY_LABEL: Record<ChecklistPriority, string> = {
  1: 'High',
  2: 'Medium',
  3: 'Low',
}

export const PRIORITY_BADGE: Record<ChecklistPriority, BadgeVariant> = {
  1: 'danger',
  2: 'warning',
  3: 'info',
}

export const STATUS_LABEL: Record<ChecklistStatus, string> = {
  Pending:   'To Do',
  Completed: 'Done',
  Dismissed: 'Skipped',
}

export const STATUS_BADGE: Record<ChecklistStatus, BadgeVariant> = {
  Pending:   'neutral',
  Completed: 'success',
  Dismissed: 'purple',
}

/** Maps raw API category strings to human-readable display labels */
export const CATEGORY_LABEL: Record<string, string> = {
  AccountSecurity: 'Account Security',
  DeviceHygiene:   'Devices',
  BackupRecovery:  'Backup',
  PrivacySharing:  'Privacy',
  ScamReadiness:   'Scam Readiness',
  General:         'General',
}

/** All distinct categories that can appear, for the filter select */
export const ALL_CATEGORIES = Object.keys(CATEGORY_LABEL)

export const DEFAULT_FILTERS: ChecklistFilters = {
  search:   '',
  priority: 'All',
  status:   'All',
  category: 'All',
}
