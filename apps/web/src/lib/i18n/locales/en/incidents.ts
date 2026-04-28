const incidents = {
  // ── List page ──────────────────────────────────────────────────────────────
  list: {
    pageTitle:       'Incidents',
    pageDescription: 'Report and track security incidents for your family.',
    reportButton:    'Report Incident',
    reported:        'Reported',
    loadError:       'Failed to load incidents. Please try again.',
  },

  // ── Wizard ─────────────────────────────────────────────────────────────────
  wizard: {
    pageTitle:          'Report an Incident',
    pageDescription:    "Tell us what happened and we'll generate a first action plan.",
    typeLabel:          'What type of incident occurred?',
    severityLabel:      'How severe does this feel?',
    summaryLabel:       'What happened?',
    summaryPlaceholder: 'Briefly describe what happened…',
    backButton:         'Back',
    submitButton:       'Submit Incident',
    errors: {
      typeRequired:     'Please select an incident type',
      severityRequired: 'Please select a severity level',
      summaryMin:       'Please provide at least 10 characters',
      summaryMax:       'Summary must be 500 characters or fewer',
    },
  },

  // ── Detail page ────────────────────────────────────────────────────────────
  detail: {
    pageTitle:           'Incident Details',
    backButton:          'All incidents',
    reported:            'Reported',
    actionPlan:          'Action Plan',
    loadError:           'Incident not found or failed to load.',
    highSeverityAlert:   'This is a {{severity}}-severity incident.',
    highSeverityBook:    'Book a session with a SafeFamily advisor for personalised support.',
    highSeverityContact: 'Contact a SafeFamily advisor for personalised support.',
    cta: {
      bookHelp:      'Book help',
      viewChecklist: 'View checklist',
    },
  },

  // ── Incident type labels ───────────────────────────────────────────────────
  types: {
    PhishingAttempt: {
      label: 'Phishing Attempt',
      description: 'Suspicious email, SMS, or link trying to steal credentials',
    },
    PasswordCompromise: {
      label: 'Password Compromised',
      description: 'Account password may have been exposed or leaked',
    },
    DeviceLostOrStolen: {
      label: 'Device Lost or Stolen',
      description: 'Phone, tablet, laptop or other device is missing or taken',
    },
    UnauthorisedAccess: {
      label: 'Unauthorised Access',
      description: 'Someone accessed an account or device without permission',
    },
    DataBreach: {
      label: 'Data Breach',
      description: 'Personal information was exposed in a third-party breach',
    },
    MalwareInfection: {
      label: 'Malware / Virus',
      description: 'Device infected with malicious software or ransomware',
    },
    ScamOrFraud: {
      label: 'Scam or Fraud',
      description: 'Financial scam, fake invoice, or fraudulent transaction',
    },
    IdentityTheft: {
      label: 'Identity Theft',
      description: 'Personal identity used fraudulently by someone else',
    },
    SocialEngineering: {
      label: 'Social Engineering',
      description: 'Psychological manipulation to divulge private information',
    },
    Other: {
      label: 'Other Incident',
      description: 'A security incident not covered by the other categories',
    },
  },

  // ── Severity labels ──────────────────────────────────────────────────────────
  severity: {
    Low:      { label: 'Low',      description: 'Minor risk, no immediate action required' },
    Medium:   { label: 'Medium',   description: 'Moderate risk, remediate within 24–48 hours' },
    High:     { label: 'High',     description: 'Significant risk, act as soon as possible' },
    Critical: { label: 'Critical', description: 'Severe risk, take immediate action now' },
  },

  // ── Status labels ────────────────────────────────────────────────────────────
  status: {
    Open: 'Open',
    InProgress: 'In Progress',
    Resolved: 'Resolved',
    Dismissed: 'Dismissed',
  },

  // ── Result page ──────────────────────────────────────────────────────────────
  result: {
    pageTitle: 'Incident Action Plan',
    pageDescription: 'Follow the steps below to contain and remediate this incident.',
    loadingTitle: 'Incident Report',
    loadError: 'Failed to load incident. Please try again.',
    recorded: {
      title: 'Incident recorded',
      body: 'Your incident has been logged. Follow the action plan below to stay protected.',
    },
    highSeverityAlert:
      'This is a {{severity}}-severity incident. Consider booking a session with a SafeFamily advisor for guided support.',
    recommendedActions: 'Recommended Actions',
    cta: {
      bookHelp: 'Book help',
      viewChecklist: 'View checklist',
      reportAnother: 'Report another',
      allIncidents: 'All incidents',
    },
  },
} as const

export default incidents
