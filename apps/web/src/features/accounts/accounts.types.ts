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
