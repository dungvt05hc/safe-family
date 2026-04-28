const tasks = {
  // ── Pages ────────────────────────────────────────────────────────────────────
  safetyTasks: {
    pageTitle:       'Safety Tasks',
    pageDescription: "Actionable steps to improve your family's digital safety.",
  },
  premiumChecklist: {
    pageTitle:             'Premium Checklist',
    pageDescription:       'Your personalised, prioritised safety action list — grouped by urgency.',
    pageDescriptionLocked: 'Your personalised, prioritised safety action list.',
    annualPlanPitch:       'Unlock recurring annual safety tasks and yearly security check-ins for your family.',
  },

  // ── Enum labels ───────────────────────────────────────────────────────────────
  phase: {
    Immediate:  'Act Now',
    Next7Days:  'This Week',
    Next30Days: 'This Month',
    Ongoing:    'Ongoing',
    Recurring:  'Recurring',
  },
  priority: {
    High:   'High',
    Medium: 'Medium',
    Low:    'Low',
  },
  status: {
    Pending:    'To Do',
    InProgress: 'In Progress',
    Completed:  'Done',
    Dismissed:  'Dismissed',
    Superseded: 'Superseded',
  },
  category: {
    AccountSecurity: 'Account Security',
    DeviceHygiene:   'Device Hygiene',
    PrivacySharing:  'Privacy & Sharing',
    BackupRecovery:  'Backup & Recovery',
    ScamReadiness:   'Scam Readiness',
    NetworkSecurity: 'Network Security',
    FamilySafety:    'Family Safety',
  },

  // ── Summary cards ─────────────────────────────────────────────────────────────
  summary: {
    total:            'Total tasks',
    completed:        'Completed',
    actNow:           'Act now',
    actNowSub:        'Immediate phase',
    highPriority:     'High priority',
    highPrioritySub:  'Remaining',
    inProgress:       'In progress',
    completePct:      '{{pct}}% complete',
  },

  // ── Filters ───────────────────────────────────────────────────────────────────
  filter: {
    filtersLabel:      'Filters',
    searchLabel:       'Search',
    searchPlaceholder: 'Search tasks…',
    statusLabel:       'Status',
    priorityLabel:     'Priority',
    phaseLabel:        'Phase',
    categoryLabel:     'Category',
    allStatuses:       'All statuses',
    allPriorities:     'All priorities',
    allPhases:         'All phases',
    allCategories:     'All categories',
    clearFilters:      'Clear',
    taskCount_one:     '{{count}} task',
    taskCount_other:   '{{count}} tasks',
  },

  // ── Card actions & labels ─────────────────────────────────────────────────────
  card: {
    markDone:        'Mark done',
    start:           'Start',
    reopen:          'Reopen',
    dismiss:         'Dismiss',
    guide:           'Guide',
    overduePrefix:   'Overdue · ',
    duePrefix:       'Due · ',
    whyThisMatters:  'Why this matters',
    stepByStepGuide: 'Step-by-step guide',
    howToResolve:    'How to resolve',
    allDone:         'All done',
  },

  // ── Empty states ──────────────────────────────────────────────────────────────
  empty: {
    noTasksTitle:        'No safety tasks',
    noTasksDesc:         'SafeFamily generates tasks from your accounts, devices, and bookings. Connect your accounts and devices to get started.',
    noPremiumTasksTitle: 'No safety tasks yet',
    noPremiumTasksDesc:  'SafeFamily generates tasks from your assessment, accounts, devices, and active plans. Complete an assessment to get started.',
    noResultsTitle:      'No matching tasks',
    noResultsDesc:       "Try adjusting your filters or search to find what you're looking for.",
  },
} as const

export default tasks
