import { z } from 'zod'

// ── Profile ───────────────────────────────────────────────────────────────────
// Email is display-only — the backend does not allow email changes here.

export interface ProfileSchemaMessages {
  fullNameMin:  string
  phoneInvalid: string
}

export const makeProfileSchema = (m: ProfileSchemaMessages) =>
  z.object({
    fullName: z.string().min(2, m.fullNameMin),
    phone:    z.string().min(8, m.phoneInvalid).or(z.literal('')).optional(),
  })

export type ProfileFormValues = z.infer<ReturnType<typeof makeProfileSchema>>

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  bookingUpdates:     z.boolean(),
  incidentAlerts:     z.boolean(),
  reminders:          z.boolean(),
})

export type NotificationsFormValues = z.infer<typeof notificationsSchema>

// ── Password ──────────────────────────────────────────────────────────────────

export interface PasswordSchemaMessages {
  currentRequired: string
  newMin:          string
  newUppercase:    string
  newNumber:       string
  confirmRequired: string
  mismatch:        string
}

export const makePasswordSchema = (m: PasswordSchemaMessages) =>
  z
    .object({
      currentPassword: z.string().min(1, m.currentRequired),
      newPassword: z
        .string()
        .min(8, m.newMin)
        .regex(/[A-Z]/, m.newUppercase)
        .regex(/[0-9]/, m.newNumber),
      confirmPassword: z.string().min(1, m.confirmRequired),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: m.mismatch,
      path:    ['confirmPassword'],
    })

export type PasswordFormValues = z.infer<ReturnType<typeof makePasswordSchema>>
