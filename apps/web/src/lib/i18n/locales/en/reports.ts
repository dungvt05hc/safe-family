const reports = {
  title: 'Reports',
  description:
    'View and download safety reports generated from assessments, incidents, and family sessions.',
  stats: {
    totalReports: 'Total Reports',
    assessments: 'Assessments',
    incidents: 'Incidents',
    lastReport: 'Last Report',
  },
  loadError: 'Failed to load reports.',
  preview: {
    noReportSelected: 'No report selected',
    noReportHint: 'Choose a report from the list to view its full details here.',
    closePreview: 'Close preview',
    downloading: 'Downloading…',
    downloadReport: 'Download Report',
  },
  list: {
    noReportsTitle: 'No reports yet',
    noReportsDescription:
      'Reports are generated after completing a risk assessment or reporting an incident. Start below to create your first report.',
    runRiskCheck: 'Run Risk Check',
    bookFamilyReset: 'Book Family Reset',
    noResultsTitle: 'No matching reports',
    noResultsDescription:
      "Try adjusting your search or filters to find what you're looking for.",
  },
} as const

export default reports
