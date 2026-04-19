export type EntitlementType =
  | 'FamilySafetyPlanAccess'
  | 'IncidentRecoveryPackAccess'
  | 'PremiumChecklistAccess'
  | 'PremiumReportAccess'
  | 'AnnualPlanSubscription'

export interface Entitlement {
  id: string
  familyId: string
  userId: string | null
  entitlementType: EntitlementType
  resourceType: string
  resourceId: string | null
  startsAt: string
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}
