const dashboard = {
  // ── Welcome banner ──────────────────────────────────────────────────────────
  welcomeBackTo:          'Welcome back to {{name}}',
  welcomeBackUser:        'Welcome back, {{name}}',
  welcomeBackGeneric:     'Welcome back',
  safetyAtAGlance:        "Here's your family's digital safety at a glance.",
  setupPrompt:            'Set up your family profile to get started.',
  createFamily:           'Create Family →',
  setupFamilyTitle:       'Set up your family profile',
  setupFamilyDescription: 'Create a family to start tracking your digital safety, manage members, devices, accounts, and more.',
  loadError:              'Failed to load dashboard. Please try again.',

  // ── Summary cards ────────────────────────────────────────────────────────────
  members:        'Members',
  familyMembers:  'Family Members',
  accounts:       'Accounts',
  devices:        'Devices',
  incidents:      'Incidents',
  activeIncidents: 'Active Incidents',

  // ── Quick actions ─────────────────────────────────────────────────────────────
  addMember:      'Add Member',
  addAccount:     'Add Account',
  runRiskCheck:   'Run Risk Check',
  reportIncident: 'Report Incident',
  bookSupport:    'Book Support',

  // ── Section headings ─────────────────────────────────────────────────────────
  quickActions:   'Quick Actions',
  recentActivity: 'Recent Activity',
  overview:       'Overview',

  // ── Risk score card ──────────────────────────────────────────────────────────
  riskScore: 'Family Risk Score',
  riskLevel: {
    Low:      'Low Risk',
    Medium:   'Medium Risk',
    High:     'High Risk',
    Critical: 'Critical Risk',
  },
  rerunAssessment:    'Re-run assessment →',
  noAssessmentYet:    'No assessment yet. Run a risk check to see your score.',
  lastAssessed:       'Assessed {{date}}',

  // ── Immediate actions ─────────────────────────────────────────────────────────
  immediateActions:    'Immediate Actions',
  allClear:            'No immediate actions — great job! Your scores are all healthy.',
  runAssessmentPrompt: 'Run a risk assessment to get personalised action items.',
  viewFullAssessment:  'View full assessment',

  // ── Recent activity ──────────────────────────────────────────────────────────
  noRecentActivity:  'No recent activity yet. Incidents and bookings will appear here.',
  reportIncidentCta: 'Report an incident →',
  bookSessionCta:    'Book a session →',
  bookedOn:          'Booked {{date}}',
  allIncidents:      'All incidents →',
  allBookings:       'All bookings →',

  // ── Severity labels ──────────────────────────────────────────────────────────
  severity: {
    Low:      'Low',
    Medium:   'Medium',
    High:     'High',
    Critical: 'Critical',
  },

  // ── Booking status labels ────────────────────────────────────────────────────
  bookingStatus: {
    Pending:    'Pending',
    Confirmed:  'Confirmed',
    InProgress: 'In Progress',
    Cancelled:  'Cancelled',
    Completed:  'Completed',
  },

  // ── Annual plan card ─────────────────────────────────────────────────────────
  annualPlan: {
    badge:              'Annual Plan',
    activeSubscription: 'Active subscription',
    benefit1:           'Family Safety Plans — unlimited access',
    benefit2:           'Priority Incident Response (24-hour SLA)',
    benefit3:           '4× quarterly safety plan updates per year',
    viewSafetyPlans:    'View Safety Plans →',
    recoveryPacks:      'Recovery Packs →',
    upgradeTitle:       'Unlock Annual Plan benefits',
    upgradeBody:        'Get unlimited Safety Plans, priority incident response, and quarterly updates for your entire family.',
    viewPackages:       'View packages →',
  },
} as const

export default dashboard
