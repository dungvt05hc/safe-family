const accounts = {
  pageTitle: 'Accounts',
  pageDescription: 'Track family accounts and their security status.',
  addAccount: '+ Add account',
  archiveConfirm: 'Archive this account? It will be hidden but not permanently deleted.',

  filter: {
    allMembers: 'All members',
    allTypes: 'All types',
    searchPlaceholder: 'Search identifier or notes…',
    clearFilters: 'Clear filters',
  },

  col: {
    member: 'Member',
    type: 'Type',
    identifier: 'Identifier',
    twoFactor: '2FA',
    recoveryEmail: 'Recovery email',
    recoveryPhone: 'Recovery phone',
    suspicious: 'Suspicious',
  },

  twoFactor: {
    Unknown: 'Unknown',
    Enabled: 'Enabled',
    Disabled: 'Disabled',
  },

  recovery: {
    Unknown: 'Unknown',
    Set: 'Set',
    NotSet: 'Not set',
  },

  suspiciousYes: '⚠ Yes',
  suspiciousBadge: '⚠ Suspicious',

  action: {
    edit: 'Edit',
    archive: 'Archive',
  },

  accountType: {
    Email: 'Email',
    SocialMedia: 'Social Media',
    Banking: 'Banking',
    Shopping: 'Shopping',
    Streaming: 'Streaming',
    Gaming: 'Gaming',
    Government: 'Government',
    Healthcare: 'Healthcare',
    Insurance: 'Insurance',
    Utility: 'Utility',
    Work: 'Work',
    Other: 'Other',
  },

  modal: {
    addTitle: 'Add account',
    editTitle: 'Edit account',
    addSubmit: 'Add account',
    editSubmit: 'Save changes',
  },

  form: {
    memberLabel: 'Family member',
    memberPlaceholder: '— None (shared / unassigned) —',
    accountType: 'Account type',
    maskedIdentifier: 'Masked identifier',
    maskedIdentifierPlaceholder: 'e.g. ****@gmail.com or Chase ****4321',
    maskedIdentifierHint: 'Do not enter passwords or secrets — only a display-safe label.',
    twoFactor: 'Two-factor authentication',
    recoveryEmail: 'Recovery email',
    recoveryPhone: 'Recovery phone',
    suspiciousFlag: 'Flag as suspicious activity',
    notes: 'Notes',
    notesPlaceholder: 'Any additional context…',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
  },
} as const

export default accounts
