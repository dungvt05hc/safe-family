export interface Family {
  id: string
  displayName: string
  countryCode: string
  timezone: string
  createdAt: string
}

export interface CreateFamilyFormValues {
  displayName: string
  countryCode: string
  timezone: string
}

export type AgeGroup = 'Infant' | 'Child' | 'Teen' | 'Adult' | 'Senior'

export const AGE_GROUPS: AgeGroup[] = ['Infant', 'Child', 'Teen', 'Adult', 'Senior']

export type Relationship =
  | 'self'
  | 'spouse'
  | 'son'
  | 'daughter'
  | 'father'
  | 'mother'
  | 'grandfather'
  | 'grandmother'
  | 'sibling'
  | 'relative'
  | 'caregiver'
  | 'other'

export interface RelationshipOption {
  value: Relationship
  label: string
}

export const RELATIONSHIP_OPTIONS: RelationshipOption[] = [
  { value: 'self',        label: 'Self' },
  { value: 'spouse',      label: 'Spouse' },
  { value: 'son',         label: 'Son' },
  { value: 'daughter',    label: 'Daughter' },
  { value: 'father',      label: 'Father' },
  { value: 'mother',      label: 'Mother' },
  { value: 'grandfather', label: 'Grandfather' },
  { value: 'grandmother', label: 'Grandmother' },
  { value: 'sibling',     label: 'Sibling' },
  { value: 'relative',    label: 'Relative' },
  { value: 'caregiver',   label: 'Caregiver' },
  { value: 'other',       label: 'Other' },
]

export const RELATIONSHIP_LABEL: Record<Relationship, string> = Object.fromEntries(
  RELATIONSHIP_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<Relationship, string>

export interface FamilyMember {
  id: string
  familyId: string
  displayName: string
  relationship: Relationship
  ageGroup: AgeGroup
  primaryEcosystem: string
  isPrimaryContact: boolean
  createdAt: string
  updatedAt: string
}

export interface FamilyMemberFormValues {
  displayName: string
  relationship: Relationship
  ageGroup: AgeGroup
  primaryEcosystem: string
  isPrimaryContact: boolean
}
