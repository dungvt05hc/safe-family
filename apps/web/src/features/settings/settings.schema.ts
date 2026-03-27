import { z } from 'zod'

// ── Profile ───────────────────────────────────────────────────────────────────
// Email is display-only — the backend does not allow email changes here.

export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone:    z.string().min(8, 'Enter a valid phone number').or(z.literal('')).optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  bookingUpdates:     z.boolean(),
  incidentAlerts:     z.boolean(),
  reminders:          z.boolean(),
})

export type NotificationsFormValues = z.infer<typeof notificationsSchema>

// ── Password ──────────────────────────────────────────────────────────────────

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Include at least one uppercase letter')
      .regex(/[0-9]/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path:    ['confirmPassword'],
  })

export type PasswordFormValues = z.infer<typeof passwordSchema>
