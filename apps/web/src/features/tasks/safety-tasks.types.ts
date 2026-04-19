// ── API shapes (match SafetyTaskDto / UpdateSafetyTaskStatusRequest) ──────────

/** Backend enum values returned as strings */
export type TaskStatus     = 'Pending' | 'InProgress' | 'Completed' | 'Dismissed' | 'Superseded'
export type TaskPriority   = 'High' | 'Medium' | 'Low'
export type TaskPhase      = 'Immediate' | 'Next7Days' | 'Next30Days' | 'Ongoing' | 'Recurring'
export type TaskCategory   = 'AccountSecurity' | 'DeviceHygiene' | 'PrivacySharing' | 'BackupRecovery' | 'ScamReadiness' | 'NetworkSecurity' | 'FamilySafety'
export type TaskSourceType = 'AccountRule' | 'DeviceRule' | 'FreeCheck' | 'FamilySafetyPlan' | 'IncidentRecoveryPack' | 'AnnualPlan' | 'Manual'
export type TaskTargetType = 'Family' | 'FamilyMember' | 'Device' | 'Account'

/** Matches SafetyTaskDto from SafetyTaskDtos.cs */
export interface SafetyTask {
  id:                 string
  familyId:           string
  sourceType:         string
  sourceId:           string | null
  targetType:         string
  targetId:           string | null
  targetLabel:        string | null
  title:              string
  description:        string
  whyThisMatters:     string | null
  guidanceMarkdown:   string | null
  helpLink:           string | null
  category:           string
  priority:           TaskPriority
  phase:              TaskPhase
  status:             TaskStatus
  sortOrder:          number
  dueAt:              string | null
  isPremium:          boolean
  isGenerated:        boolean
  generationKey:      string | null
  supersededByTaskId: string | null
  completedAt:        string | null
  skippedAt:          string | null
  createdAt:          string
  updatedAt:          string
}

/** Matches SafetyTaskSummaryDto */
export interface SafetyTaskSummary {
  totalTasks:        number
  completedTasks:    number
  /** Phase=Immediate tasks still pending or in-progress */
  criticalRemaining: number
  /** Priority=High tasks still pending or in-progress */
  highRemaining:     number
  tasksInProgress:   number
}

/** Matches UpdateSafetyTaskStatusRequest */
export interface UpdateSafetyTaskStatusRequest {
  status: TaskStatus
  notes?: string
}

// ── Filter types ──────────────────────────────────────────────────────────────

export type TaskStatusFilter   = 'All' | TaskStatus
export type TaskPriorityFilter = 'All' | TaskPriority
export type TaskPhaseFilter    = 'All' | TaskPhase
export type TaskCategoryFilter = 'All' | string

/** Query params sent to GET /api/tasks */
export interface SafetyTaskApiFilters {
  status?:     string
  priority?:   string
  phase?:      string
  category?:   string
  sourceType?: string
  targetType?: string
  targetId?:   string
  search?:     string
}

export interface SafetyTaskFilters {
  search:   string
  status:   TaskStatusFilter
  priority: TaskPriorityFilter
  phase:    TaskPhaseFilter
  category: TaskCategoryFilter
}

export const DEFAULT_TASK_FILTERS: SafetyTaskFilters = {
  search:   '',
  status:   'All',
  priority: 'All',
  phase:    'All',
  category: 'All',
}

// ── Display helpers ───────────────────────────────────────────────────────────

import type { BadgeVariant } from '@/components/ui'

export const PHASE_LABEL: Record<TaskPhase, string> = {
  Immediate:  'Act Now',
  Next7Days:  'This Week',
  Next30Days: 'This Month',
  Ongoing:    'Ongoing',
  Recurring:  'Recurring',
}

export const PRIORITY_BADGE: Record<TaskPriority, BadgeVariant> = {
  High:   'danger',
  Medium: 'warning',
  Low:    'neutral',
}

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  High:   'High',
  Medium: 'Medium',
  Low:    'Low',
}

export const STATUS_BADGE: Record<TaskStatus, BadgeVariant> = {
  Pending:    'info',
  InProgress: 'purple',
  Completed:  'success',
  Dismissed:  'neutral',
  Superseded: 'neutral',
}

export const STATUS_LABEL: Record<TaskStatus, string> = {
  Pending:    'To Do',
  InProgress: 'In Progress',
  Completed:  'Done',
  Dismissed:  'Dismissed',
  Superseded: 'Superseded',
}

export const CATEGORY_LABEL: Record<string, string> = {
  AccountSecurity: 'Account Security',
  DeviceHygiene:   'Device Hygiene',
  PrivacySharing:  'Privacy & Sharing',
  BackupRecovery:  'Backup & Recovery',
  ScamReadiness:   'Scam Readiness',
  NetworkSecurity: 'Network Security',
  FamilySafety:    'Family Safety',
}

export const PHASE_COLOR: Record<TaskPhase, string> = {
  Immediate:  'text-red-600 bg-red-50',
  Next7Days:  'text-amber-600 bg-amber-50',
  Next30Days: 'text-blue-600 bg-blue-50',
  Ongoing:    'text-gray-600 bg-gray-100',
  Recurring:  'text-violet-600 bg-violet-50',
}
