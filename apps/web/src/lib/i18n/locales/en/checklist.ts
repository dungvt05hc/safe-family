const checklist = {
  title:       'Checklist',
  description: "Track the most important actions to improve your family's digital safety.",
  lockedBanner: {
    title:  'Some checklist items are hidden',
    body:   'Checklist items generated from your safety consultation are included with the Family Core or Annual Plan.',
    unlock: 'Unlock',
  },
  loadError: 'Failed to load your checklist.',

  // ── Summary cards ───────────────────────────────────────────────────────────
  summary: {
    total:        'Total tasks',
    highPriority: 'High priority',
    toDo:         'To do',
    completed:    'Completed',
  },

  // ── Filters ─────────────────────────────────────────────────────────────────
  filter: {
    searchLabel:       'Search',
    searchPlaceholder: 'Filter by title…',
    severityLabel:     'Severity',
    statusLabel:       'Status',
    categoryLabel:     'Category',
    allSeverities:     'All severities',
    allStatuses:       'All statuses',
    allCategories:     'All categories',
    clearFilters:      'Clear',
    itemCount_one:     '{{count}} item',
    itemCount_other:   '{{count}} items',
  },

  // ── Labels ──────────────────────────────────────────────────────────────────
  priority: {
    1: 'High',
    2: 'Medium',
    3: 'Low',
  },
  status: {
    Pending:    'To Do',
    InProgress: 'In Progress',
    Completed:  'Done',
    Dismissed:  'Skipped',
  },
  category: {
    AccountSecurity: 'Account Security',
    DeviceHygiene:   'Devices',
    BackupRecovery:  'Backup',
    PrivacySharing:  'Privacy',
    ScamReadiness:   'Scam Readiness',
    General:         'General',
  },

  // ── Card actions ────────────────────────────────────────────────────────────
  card: {
    markDone:      'Mark done',
    start:         'Start',
    reopen:        'Reopen',
    skip:          'Skip',
    bookHelp:      'Book help',
    openGuide:     'Open guide',
    guide:         'Guide',
    overduePrefix: 'Overdue · ',
    duePrefix:     'Due · ',
  },

  // ── Empty states ─────────────────────────────────────────────────────────────
  empty: {
    noItemsTitle:  'Your checklist is clear',
    noItemsDesc:   "SafeFamily automatically generates tasks from your accounts and devices. Add some and we'll surface the most important actions here.",
    noResultsTitle: 'No matching items',
    noResultsDesc:  "Try adjusting your filters or search to find what you're looking for.",
  },
} as const

export default checklist
