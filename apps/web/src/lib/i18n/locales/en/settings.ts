const settings = {
  title: 'Settings',
  description: 'Manage your account, notifications, and privacy preferences.',
  nav: 'Settings sections',

  tabs: {
    profile: 'Profile',
    security: 'Security',
    notifications: 'Notifications',
    privacy: 'Privacy',
    preferences: 'Preferences',
    danger: 'Danger Zone',
  },

  profile: {
    tabTitle: 'Profile',
    tabDescription: 'Update your name, email address, and phone number.',
    cardTitle: 'Profile information',
    fullName: 'Full name',
    email: 'Email address',
    emailReadonly: 'Email address cannot be changed here.',
    phone: 'Phone number',
    saveChanges: 'Save changes',
    saved: 'Profile updated successfully.',
    error: 'Failed to save profile. Please try again.',
  },

  security: {
    tabTitle: 'Password & Security',
    tabDescription: 'Keep your account secure with a strong, unique password.',
    cardTitle: 'Change password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    tip: 'Use at least 8 characters, one uppercase letter, and one number. Never share your password with anyone — SafeFamily staff will never ask for it.',
    updatePassword: 'Update password',
    saved: 'Password changed successfully.',
    error: 'Failed to change password. Please check your current password and try again.',
  },

  notifications: {
    tabTitle: 'Notifications',
    tabDescription: "Choose which updates you'd like to receive by email.",
    cardTitle: 'Notification preferences',
    email: {
      label: 'Email notifications',
      description: 'Receive a weekly safety digest and important account updates by email.',
    },
    bookingUpdates: {
      label: 'Booking updates',
      description: 'Get notified when a session is confirmed, rescheduled, or cancelled.',
    },
    incidentAlerts: {
      label: 'Incident alerts',
      description: 'Immediate alerts when a new incident report is submitted for your family.',
    },
    reminders: {
      label: 'Safety reminders',
      description: 'Periodic nudges to complete your safety checklist and run risk checks.',
    },
    savePreferences: 'Save preferences',
    saved: 'Notification preferences saved.',
    error: 'Failed to save preferences. Please try again.',
  },

  privacy: {
    tabTitle: 'Privacy',
    tabDescription: 'Control your data and understand how we use it.',
    cardTitle: 'Privacy & data',
    infoBanner: {
      title: 'Your data belongs to you',
      body: "SafeFamily stores only the information needed to protect your family. You can request a full export at any time — we'll email you a download link within 48 hours.",
    },
    exportData: {
      title: 'Request data export',
      description:
        'Download a copy of all data SafeFamily holds about your account, family members, and activity history.',
      button: 'Request export',
      requested: 'Requested',
      success: "Request received! We'll email you a download link within 48 hours.",
      error: 'Failed to submit request. Please try again later.',
    },
    privacyPolicy: 'Privacy policy',
    howWeUseData: 'How we use your data',
  },

  preferences: {
    tabTitle: 'Preferences',
    tabDescription: 'Customise language and regional settings for your experience.',
    language: {
      cardTitle: 'Language',
      description: 'Choose the language used throughout the app. Your preference is saved locally and will be remembered on this device.',
      ariaLabel: 'App language',
    },
  },

  danger: {
    tabTitle: 'Danger Zone',
    tabDescription: 'Destructive actions that permanently affect your account.',
    zoneTitle: 'Danger Zone',
    deleteAccount: {
      title: 'Delete account',
      description:
        'Permanently remove your SafeFamily account, all family data, and associated records. This action cannot be undone.',
      button: 'Delete account',
    },
    deleteConfirm: {
      warning:
        'This is irreversible. All your family data, assessments, incident reports, and booking history will be permanently deleted. You will lose access immediately.',
      confirmLabel: 'Type {{phrase}} to confirm',
      confirmLabelBefore: 'Type',
      confirmLabelAfter: 'to confirm',
      deleteButton: 'Permanently delete my account',
      cancel: 'Cancel',
      success:
        'Your account deletion request has been received. Our team will process it within 30 days and send a confirmation to your registered email address.',
      error: 'Failed to submit deletion request. Please try again.',
    },
  },

  validation: {
    profile: {
      fullNameMin:  'Full name must be at least 2 characters',
      phoneInvalid: 'Enter a valid phone number',
    },
    security: {
      currentPasswordRequired: 'Current password is required',
      newPasswordMin:          'Password must be at least 8 characters',
      newPasswordUppercase:    'Include at least one uppercase letter',
      newPasswordNumber:       'Include at least one number',
      confirmPasswordRequired: 'Please confirm your new password',
      passwordsMismatch:       'Passwords do not match',
    },
  },
} as const

export default settings
