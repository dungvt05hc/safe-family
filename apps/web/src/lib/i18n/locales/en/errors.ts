const errors = {
  // HTTP status / network categories
  network: 'Unable to connect. Check your internet connection and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to access this.',
  notFound: "We couldn't find what you're looking for.",
  paymentRequired: 'An active subscription is required to access this feature.',
  conflict: 'This already exists.',
  serverError: 'A server error occurred. Please try again later.',
  unknown: 'Something went wrong. Please try again.',
  // Load errors (entity-specific)
  load: {
    accounts: 'Failed to load accounts.',
    devices: 'Failed to load devices.',
    incidents: 'Failed to load incidents.',
    tasks: 'Failed to load your safety tasks.',
    family: 'Failed to load family data.',
    dashboard: 'Failed to load dashboard.',
    bookings: 'Failed to load bookings.',
    reports: 'Failed to load reports.',
    checklist: 'Failed to load checklist.',
    members: 'Failed to load members.',
    plans: 'Failed to load safety plans.',
    assessments: 'Failed to load assessment history.',
  },
  // Mutation errors
  mutation: {
    emailConflict: 'An account with this email already exists.',
    familyConflict: 'You already belong to a family.',
    generic: 'Something went wrong. Please try again.',
  },
} as const

export default errors
