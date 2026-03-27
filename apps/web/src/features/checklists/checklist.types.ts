// ── API shapes (match ChecklistItemDto / UpdateChecklistStatusRequest) ────────

/** Backend enum values returned as strings by the API */
export type ChecklistStatus   = 'Pending' | 'Completed' | 'Dismissed' | 'InProgress'
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
  dueAt:       string | null
  helpUrl:     string | null
}

/** Matches ChecklistSummaryDto from ChecklistDtos.cs */
export interface ChecklistSummary {
  totalTasks:        number
  highPriorityTasks: number
  inProgressTasks:   number
  completedTasks:    number
}

/** Matches UpdateChecklistStatusRequest record */
export interface UpdateChecklistStatusRequest {
  status: ChecklistStatus
}

// ── Filter types ──────────────────────────────────────────────────────────────

export type PriorityFilter = 'All' | '1' | '2' | '3'
export type StatusFilter   = 'All' | ChecklistStatus

/** Query params sent to GET /api/checklists (mirrors ChecklistQueryParams on backend) */
export interface ChecklistApiFilters {
  severity?: string
  status?:   string
  category?: string
  search?:   string
}
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
  Pending:    'To Do',
  InProgress: 'In Progress',
  Completed:  'Done',
  Dismissed:  'Skipped',
}

export const STATUS_BADGE: Record<ChecklistStatus, BadgeVariant> = {
  Pending:    'neutral',
  InProgress: 'info',
  Completed:  'success',
  Dismissed:  'purple',
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
