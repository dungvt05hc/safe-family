// ── Enums (mirror backend) ──────────────────────────────────────────────────

export type DeviceType =
  | 'Smartphone'
  | 'Tablet'
  | 'Laptop'
  | 'Desktop'
  | 'SmartWatch'
  | 'SmartTV'
  | 'GameConsole'
  | 'Other'

export const DEVICE_TYPES: DeviceType[] = [
  'Smartphone',
  'Tablet',
  'Laptop',
  'Desktop',
  'SmartWatch',
  'SmartTV',
  'GameConsole',
  'Other',
]

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

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  Smartphone: 'Smartphone',
  Tablet: 'Tablet',
  Laptop: 'Laptop',
  Desktop: 'Desktop',
  SmartWatch: 'Smart Watch',
  SmartTV: 'Smart TV',
  GameConsole: 'Game Console',
  Other: 'Other',
}

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
  deviceType?: DeviceType
  supportStatus?: SupportStatus
  search?: string
}

// ── API model ───────────────────────────────────────────────────────────────

export interface Device {
  id: string
  familyId: string
  memberId: string | null
  deviceType: DeviceType
  brand: string
  model: string
  osName: string
  osVersion: string
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

export interface DeviceFormValues {
  memberId: string
  deviceType: DeviceType
  brand: string
  model: string
  osName: string
  osVersion: string
  supportStatus: SupportStatus
  screenLockEnabled: boolean
  biometricEnabled: boolean
  backupEnabled: boolean
  findMyDeviceEnabled: boolean
  notes: string
}
