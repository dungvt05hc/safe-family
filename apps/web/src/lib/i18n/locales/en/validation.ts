const validation = {
  email: {
    required: 'Email is required',
    invalid: 'Enter a valid email address',
  },
  password: {
    required: 'Password is required',
    min: 'Password must be at least 8 characters',
    max: 'Password is too long',
  },
  displayName: {
    required: 'Display name is required',
    max: 'Display name must be 200 characters or fewer',
  },
  familyName: {
    required: 'Family name is required',
    max: 'Family name must be 200 characters or fewer',
  },
  countryCode: {
    length: 'Enter a valid 2-letter country code',
  },
  timezone: {
    required: 'Timezone is required',
    max: 'Timezone must be 100 characters or fewer',
  },
  accountType: {
    required: 'Select an account type',
  },
  identifier: {
    required: 'Identifier is required',
    max: 'Must be 255 characters or fewer',
  },
  notes: {
    max: 'Must be 1000 characters or fewer',
  },
} as const

export default validation
