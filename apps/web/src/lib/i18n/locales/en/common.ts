const common = {
  save: 'Save',
  cancel: 'Cancel',
  loading: 'Loading…',
  error: 'Something went wrong',
  signOut: 'Sign out',
  signingOut: 'Signing out…',
  backToDashboard: 'Back to dashboard',
  comingSoon: 'Coming Soon',
  profile: 'Profile',
  settings: 'Settings',
  logOut: 'Log out',
  signIn: 'Sign in',
  signUp: 'Sign up',
  home: 'Home',
  navigation: 'Navigation',
  closeNavigation: 'Close navigation',
  includedWith: 'Included with {{name}}',
  viewPackages: 'View packages',
  backToDashboardLabel: 'Back to dashboard',
  // Family form labels
  familyName: 'Family name',
  countryCode: 'Country code',
  countryCodeHint: 'ISO 3166-1 alpha-2 (e.g. US, BR, GB)',
  timezone: 'Timezone',
  timezoneHint: 'IANA timezone (e.g. Europe/London)',
  createFamily: 'Create family',
  creatingFamily: 'Creating…',
  featureFlags: {
    booking: {
      title: 'Bookings',
      description:
        'Online booking is not available in your region yet. We\'re working hard to bring expert support booking to you soon.',
    },
    payments: {
      title: 'Payments',
      description:
        'Payment processing is not yet active on your account. Reach out to your administrator to enable this feature.',
    },
    plans: {
      title: 'Safety Plans',
      description:
        'Premium Safety Plans are not enabled on your current subscription. Upgrade your plan to access personalised recovery and safety resources.',
    },
  },
} as const

export default common
