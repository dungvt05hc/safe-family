// ── Enums (mirror backend) ──────────────────────────────────────────────────

export type SupportStatus =
  | 'Unknown'
  | 'Supported'
  | 'EndOfLife'
  | 'NoLongerReceivingUpdates'

export const SUPPORT_STATUSES: SupportStatus[] = [
  'Unknown',
  'Supported',
  'EndOfLife',
  'NoLongerReceivingUpdates',
]

// ── Display labels ──────────────────────────────────────────────────────────

export const SUPPORT_STATUS_LABELS: Record<SupportStatus, string> = {
  Unknown: 'Unknown',
  Supported: 'Supported',
  EndOfLife: 'End of Life',
  NoLongerReceivingUpdates: 'No Longer Receiving Updates',
}

// ── Summary & filter types ──────────────────────────────────────────────────

export interface DeviceSummary {
  total: number
  withoutScreenLock: number
  withoutBackup: number
  withoutBiometric: number
  endOfLife: number
  withoutFindMyDevice: number
}

export interface DeviceFilters {
  memberId?: string
  deviceTypeCode?: string
  supportStatus?: SupportStatus
  search?: string
}

// ── API model (matches DeviceResponse on backend) ───────────────────────────

export interface Device {
  id: string
  familyId: string
  memberId: string | null
  deviceTypeCode: string
  deviceTypeName: string
  brandCode: string
  brandName: string
  modelCode: string
  modelName: string
  osFamilyCode: string
  osFamilyName: string
  osVersionCode: string
  osVersionName: string
  supportStatus: SupportStatus
  screenLockEnabled: boolean
  biometricEnabled: boolean
  backupEnabled: boolean
  findMyDeviceEnabled: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// ── Form values ─────────────────────────────────────────────────────────────
// Canonical definition lives in devices.schema.ts (derived from Zod).
// Re-exported here so existing consumers keep working with one import path.

export type { DeviceFormValues } from './devices.schema'
