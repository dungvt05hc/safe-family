// ── Enums (mirror backend) ─────────────────────────────────────────────────

export type AccountType =
  | 'Email'
  | 'SocialMedia'
  | 'Banking'
  | 'Shopping'
  | 'Streaming'
  | 'Gaming'
  | 'Government'
  | 'Healthcare'
  | 'Insurance'
  | 'Utility'
  | 'Work'
  | 'Other'

export const ACCOUNT_TYPES: AccountType[] = [
  'Email',
  'SocialMedia',
  'Banking',
  'Shopping',
  'Streaming',
  'Gaming',
  'Government',
  'Healthcare',
  'Insurance',
  'Utility',
  'Work',
  'Other',
]

export type TwoFactorStatus = 'Unknown' | 'Enabled' | 'Disabled'
export const TWO_FACTOR_STATUSES: TwoFactorStatus[] = ['Unknown', 'Enabled', 'Disabled']

export type RecoveryStatus = 'Unknown' | 'Set' | 'NotSet'
export const RECOVERY_STATUSES: RecoveryStatus[] = ['Unknown', 'Set', 'NotSet']

// ── Display labels ─────────────────────────────────────────────────────────

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  Email: 'Email',
  SocialMedia: 'Social Media',
  Banking: 'Banking',
  Shopping: 'Shopping',
  Streaming: 'Streaming',
  Gaming: 'Gaming',
  Government: 'Government',
  Healthcare: 'Healthcare',
  Insurance: 'Insurance',
  Utility: 'Utility',
  Work: 'Work',
  Other: 'Other',
}

export const TWO_FACTOR_LABELS: Record<TwoFactorStatus, string> = {
  Unknown: 'Unknown',
  Enabled: 'Enabled',
  Disabled: 'Disabled',
}

export const RECOVERY_LABELS: Record<RecoveryStatus, string> = {
  Unknown: 'Unknown',
  Set: 'Set',
  NotSet: 'Not set',
}

// ── Summary & filter types ─────────────────────────────────────────────────

export interface AccountSummary {
  total: number
  without2Fa: number
  missingRecoveryEmail: number
  missingRecoveryPhone: number
  suspicious: number
}

export interface AccountFilters {
  memberId?: string
  accountType?: AccountType
  search?: string
}

// ── API model ──────────────────────────────────────────────────────────────

export interface Account {
  id: string
  familyId: string
  memberId: string | null
  accountType: AccountType
  maskedIdentifier: string
  twoFactorStatus: TwoFactorStatus
  recoveryEmailStatus: RecoveryStatus
  recoveryPhoneStatus: RecoveryStatus
  suspiciousActivityFlag: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ── Form values ────────────────────────────────────────────────────────────

export interface AccountFormValues {
  memberId: string
  accountType: AccountType
  maskedIdentifier: string
  twoFactorStatus: TwoFactorStatus
  recoveryEmailStatus: RecoveryStatus
  recoveryPhoneStatus: RecoveryStatus
  suspiciousActivityFlag: boolean
  notes: string
}
