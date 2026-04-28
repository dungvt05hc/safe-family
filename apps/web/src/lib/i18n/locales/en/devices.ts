const devices = {
  pageTitle: 'Devices',
  pageDescription: 'Track family devices and their security configuration.',
  addDevice: '+ Add device',
  archiveConfirm: 'Archive this device? It will be hidden but not permanently deleted.',
  unassigned: 'Unassigned',

  filter: {
    allMembers: 'All members',
    allTypes: 'All types',
    allStatuses: 'All statuses',
    searchPlaceholder: 'Search brand, model, OS…',
    clearFilters: 'Clear filters',
  },

  col: {
    type: 'Type',
    device: 'Device',
    member: 'Member',
    os: 'OS',
    support: 'Support',
    screenLock: 'Screen lock',
    biometric: 'Biometric',
    backup: 'Backup',
    findMyDevice: 'Find my device',
  },

  supportStatus: {
    Unknown: 'Unknown',
    Supported: 'Supported',
    EndOfLife: 'End of Life',
    NoLongerReceivingUpdates: 'No Longer Receiving Updates',
  },

  badge: {
    screenLock: 'Screen lock',
    biometric: 'Biometric',
    backup: 'Backup',
    findMyDevice: 'Find my device',
  },

  securityEnabled: 'Enabled',
  securityDisabled: 'Disabled',

  action: {
    edit: 'Edit',
    archive: 'Archive',
  },

  modal: {
    addTitle: 'Add device',
    addSubtitle: 'Register a new device for your family',
    editTitle: 'Edit device',
    addSubmit: 'Add device',
    editSubmit: 'Save changes',
  },

  form: {
    memberLabel: 'Assign to family member',
    memberPlaceholder: 'Shared device (no specific owner)',
    memberHint: 'Leave unassigned for devices shared by the whole family',

    sectionIdentification: 'Device identification',
    sectionOs: 'Operating system',
    sectionStatusSecurity: 'Status & security',

    deviceType: 'Device type',
    deviceTypePlaceholder: 'Select device type…',
    deviceTypeLoading: 'Loading…',
    deviceTypeHint: 'Narrows the available brands and models below',

    brand: 'Brand',
    model: 'Model',

    osFamily: 'OS family',
    osFamilyHint: 'Auto-selected based on the chosen model',
    osVersion: 'Version',

    supportStatus: 'Support status',
    supportStatusHint: 'Whether the manufacturer still provides security updates',

    securityFeaturesLabel: 'Security features enabled',
    screenLock: 'Screen lock',
    screenLockDesc: 'PIN, password, or pattern',
    biometric: 'Biometrics',
    biometricDesc: 'Fingerprint or face unlock',
    backup: 'Cloud backup',
    backupDesc: 'Automatic data backup',
    findMyDevice: 'Find My Device',
    findMyDeviceDesc: 'Remote locate & wipe',

    notes: 'Notes',
    notesOptional: '(optional)',
    notesPlaceholder: 'e.g. Company-issued laptop, case serial #12345…',

    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
  },

  placeholder: {
    brandNoType: 'Choose a device type first',
    brandLoading: 'Loading brands…',
    brandNone: 'No brands for this type',
    brandDefault: 'Select brand…',
    modelNoBrand: 'Choose a brand first',
    modelLoading: 'Loading models…',
    modelNone: 'No models for this brand',
    modelDefault: 'Select model…',
    osFamilyNoModel: 'Choose a model first',
    osFamilyLoading: 'Loading operating systems…',
    osFamilyNone: 'No operating systems available',
    osFamilyDefault: 'Select operating system…',
    osVersionNoFamily: 'Choose an OS first',
    osVersionLoading: 'Loading versions…',
    osVersionNone: 'No versions available',
    osVersionDefault: 'Select version…',
  },

  validation: {
    deviceType: 'Device type is required',
    brand: 'Brand is required',
    model: 'Model is required',
    osFamily: 'Operating system is required',
    osVersion: 'OS version is required',
    supportStatus: 'Select a support status',
    notesMax: 'Notes must be 1 000 characters or fewer',
  },
} as const

export default devices
