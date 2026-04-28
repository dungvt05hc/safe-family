const reports = {
  // ── Page ──────────────────────────────────────────────────────────────────
  title:       'Reports',
  description: 'View and download safety reports generated from assessments, incidents, and family sessions.',
  loadError:   'Failed to load reports.',

  // ── Stats ─────────────────────────────────────────────────────────────────
  stats: {
    totalReports: 'Total Reports',
    assessments:  'Assessments',
    incidents:    'Incidents',
    lastReport:   'Last Report',
  },

  // ── Report types ──────────────────────────────────────────────────────────
  types: {
    All:              { label: 'All types' },
    Assessment:       { label: 'Assessment' },
    Incident:         { label: 'Incident' },
    FamilyReset:      { label: 'Family Reset' },
    SafetyPlan:       { label: 'Safety Plan' },
    IncidentRecovery: { label: 'Recovery Pack' },
  },

  // ── Filters bar ───────────────────────────────────────────────────────────
  filters: {
    searchLabel:       'Search',
    searchPlaceholder: 'Filter by title…',
    typeLabel:         'Type',
    dateFromLabel:     'From',
    dateToLabel:       'To',
    clearButton:       'Clear',
    resultCount_one:   '{{count}} report',
    resultCount_other: '{{count}} reports',
  },

  // ── Report card ───────────────────────────────────────────────────────────
  card: {
    viewButton:        'View',
    downloadButton:    'Download',
    unlockButton:      'Unlock',
    premiumLabel:      'Premium',
    lockedDescription: 'Purchase a qualifying package to unlock this report.',
  },

  // ── Preview panel ─────────────────────────────────────────────────────────
  preview: {
    noReportSelected: 'No report selected',
    noReportHint:     'Choose a report from the list to view its full details here.',
    closePreview:     'Close preview',
    downloading:      'Downloading…',
    downloadReport:   'Download Report',
  },

  // ── List empty states ─────────────────────────────────────────────────────
  list: {
    noReportsTitle:       'No reports yet',
    noReportsDescription: 'Reports are generated after completing a risk assessment or reporting an incident. Start below to create your first report.',
    runRiskCheck:         'Run Risk Check',
    bookFamilyReset:      'Book Family Reset',
    noResultsTitle:       'No matching reports',
    noResultsDescription: "Try adjusting your search or filters to find what you're looking for.",
  },
} as const

export default reports
