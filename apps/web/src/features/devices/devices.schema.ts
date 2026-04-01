import { z } from 'zod'

// ── Catalog code field ──────────────────────────────────────────────────────
// Reusable refinement for required catalog dropdown values.
// An empty string means "nothing selected yet".

const catalogCode = (label: string) =>
  z.string().min(1, `${label} is required`)

// ── Device form schema ──────────────────────────────────────────────────────
// Validates the Add / Edit Device form.
// Field order mirrors the dependent dropdown cascade:
//   deviceTypeCode → brandCode → modelCode → osFamilyCode → osVersionCode

export const deviceSchema = z.object({
  /** Optional — links device to a family member. Empty string = unassigned. */
  memberId: z.string().optional().default(''),

  // ── Catalog selections (all required) ─────────────────────────────────────
  deviceTypeCode: catalogCode('Device type'),
  brandCode:      catalogCode('Brand'),
  modelCode:      catalogCode('Model'),
  osFamilyCode:   catalogCode('Operating system'),
  osVersionCode:  catalogCode('OS version'),

  // ── Metadata ──────────────────────────────────────────────────────────────
  supportStatus: z.enum(
    ['Unknown', 'Supported', 'EndOfLife', 'NoLongerReceivingUpdates'] as const,
    { errorMap: () => ({ message: 'Select a support status' }) },
  ),

  // ── Security features ─────────────────────────────────────────────────────
  screenLockEnabled:   z.boolean().default(false),
  biometricEnabled:    z.boolean().default(false),
  backupEnabled:       z.boolean().default(false),
  findMyDeviceEnabled: z.boolean().default(false),

  // ── Free text ─────────────────────────────────────────────────────────────
  notes: z
    .string()
    .max(1000, 'Notes must be 1 000 characters or fewer')
    .optional()
    .default(''),
})

/** Inferred type used by React Hook Form and mutation payloads. */
export type DeviceFormValues = z.infer<typeof deviceSchema>

// ── Default values ──────────────────────────────────────────────────────────
// Centralised so Add and Edit modals start from the same baseline.

export const DEVICE_FORM_DEFAULTS: DeviceFormValues = {
  memberId: '',
  deviceTypeCode: '',
  brandCode: '',
  modelCode: '',
  osFamilyCode: '',
  osVersionCode: '',
  supportStatus: 'Unknown',
  screenLockEnabled: false,
  biometricEnabled: false,
  backupEnabled: false,
  findMyDeviceEnabled: false,
  notes: '',
}
