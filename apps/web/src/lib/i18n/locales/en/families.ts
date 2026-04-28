const families = {
  // ── Page ───────────────────────────────────────────────────────────────────
  pageTitle: 'Family Members',
  pageDescription: 'Manage the people in your family.',
  addMember: '+ Add member',
  loadError: 'Failed to load family members. Please refresh.',

  // ── No-family guard ────────────────────────────────────────────────────────
  createFamilyFirst: {
    title: 'Create your family first',
    body: 'You need to set up a family profile before you can add family members.',
    formTitle: 'Create your family',
  },

  // ── Table columns ──────────────────────────────────────────────────────────
  col: {
    name: 'Name',
    relationship: 'Relationship',
    ageGroup: 'Age group',
    ecosystem: 'Ecosystem',
    primaryContact: 'Primary contact',
    actions: 'Actions',
  },

  // ── Primary contact ────────────────────────────────────────────────────────
  primaryContact: {
    yes: 'Yes',
    badge: 'Primary contact',
  },

  // ── Row actions ────────────────────────────────────────────────────────────
  action: {
    edit: 'Edit',
    archive: 'Archive',
  },

  archiveConfirm: 'Archive {{name}}? They will be hidden from this list.',

  // ── Modals ─────────────────────────────────────────────────────────────────
  modal: {
    addTitle: 'Add family member',
    editTitle: 'Edit {{name}}',
    addSubmit: 'Add member',
    editSubmit: 'Save changes',
  },

  // ── Form ───────────────────────────────────────────────────────────────────
  form: {
    name: 'Name',
    namePlaceholder: 'e.g. Jane Smith',
    nameRequired: 'Name is required',
    nameMax: 'Name must be 200 characters or fewer',
    relationship: 'Relationship',
    relationshipRequired: 'Please select a relationship',
    ageGroup: 'Age group',
    ageGroupRequired: 'Please select an age group',
    ecosystem: 'Primary ecosystem',
    ecosystemHint: 'The main device ecosystem this member uses',
    ecosystemPlaceholder: '— Select ecosystem —',
    isPrimaryContact: 'Primary contact',
    isPrimaryContactHint: 'Primary contacts receive urgent app notifications',
    save: 'Save',
    saving: 'Saving…',
    cancel: 'Cancel',
  },

  // ── Relationship labels ────────────────────────────────────────────────────
  relationship: {
    self: 'Self',
    spouse: 'Spouse',
    son: 'Son',
    daughter: 'Daughter',
    father: 'Father',
    mother: 'Mother',
    grandfather: 'Grandfather',
    grandmother: 'Grandmother',
    sibling: 'Sibling',
    relative: 'Relative',
    caregiver: 'Caregiver',
    other: 'Other',
  },

  // ── Age group labels ───────────────────────────────────────────────────────
  ageGroup: {
    Infant: 'Infant',
    Child: 'Child',
    Teen: 'Teen',
    Adult: 'Adult',
    Senior: 'Senior',
  },

  // ── Ecosystem labels ───────────────────────────────────────────────────────
  ecosystem: {
    google: 'Google',
    apple: 'Apple',
    microsoft: 'Microsoft / Windows',
    android: 'Android',
    mixed: 'Mixed',
    other: 'Other',
  },
} as const

export default families
