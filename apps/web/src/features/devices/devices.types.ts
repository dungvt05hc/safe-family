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
