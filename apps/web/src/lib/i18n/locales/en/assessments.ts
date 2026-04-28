const assessments = {
  // ── Category labels ─────────────────────────────────────────────────────────
  categories: {
    accountSecurity: 'Account Security',
    deviceHygiene: 'Device Hygiene',
    backupRecovery: 'Backup & Recovery',
    privacySharing: 'Privacy & Sharing',
    scamReadiness: 'Scam Readiness',
  },

  // ── Risk level labels ───────────────────────────────────────────────────────
  riskLevels: {
    Low: 'Low Risk',
    Medium: 'Medium Risk',
    High: 'High Risk',
    Critical: 'Critical Risk',
  },

  // ── Start page ──────────────────────────────────────────────────────────────
  start: {
    pageTitle: 'Digital Safety Assessment',
    pageDescription: 'Find out how well your family is protected online.',
    heroTitle: 'How safe is your family online?',
    heroBody:
      "Answer 22 quick questions across five security categories. You'll get an instant risk score, a category breakdown, and personalised actions to improve your family's digital safety.",
    heroDuration: 'Takes about 5 minutes · No personal data collected',
    startButton: 'Start assessment',
    viewLastResult: 'View your last result →',
    whatYouGet: [
      'Overall risk score (0–100)',
      'Per-category score breakdown',
      'Prioritised action recommendations',
      'One-click access to your security checklist',
    ],
  },

  // ── Result page ─────────────────────────────────────────────────────────────
  result: {
    pageTitle: 'Your Safety Score',
    loadingResults: 'Loading results…',
    noAssessment: 'No assessment found. Take the assessment first.',
    startAssessment: 'Start assessment',
    assessedOn: 'Assessed on {{date}}',
    yourScoreDescription: "Your family's digital safety score is {{score}}/100.",
    riskMessage: {
      Low: 'Your family is doing great! Keep up these good habits and review your score periodically.',
      Medium: 'Your family has a solid foundation. A few targeted improvements will significantly strengthen your protection.',
      High: 'Your family has some important security gaps. Prioritise the immediate actions below to improve quickly.',
      Critical: 'Your family is at significant risk. Please act on the immediate actions below as soon as possible.',
    },
    categoryBreakdown: 'Category Breakdown',
    immediateActions: '⚡ Immediate Actions',
    whatsNext: "What's next?",
    whatsNextDescription:
      'Improve your score by working through your security checklist or talking to an expert.',
    viewChecklist: '✅ View security checklist',
    retakeAssessment: '🔄 Retake assessment',
    bookConsultation: '📅 Book a consultation',
    viewHistory: 'View history →',
  },

  // ── History page ────────────────────────────────────────────────────────────
  history: {
    pageTitle: 'Assessment History',
    loadError: 'Failed to load history. Please try again.',
    noAssessments: 'No assessments yet',
    noAssessmentsHint:
      'Complete your first digital safety assessment to start tracking your score over time.',
    takeAssessment: 'Take assessment',
    latestBadge: 'Latest',
    assessmentNumber: 'Assessment #{{number}}',
    viewLatestResult: '← View latest result',
    retakeAssessment: 'Retake assessment',
    completedCount_one: '{{count}} assessment completed',
    completedCount_other: '{{count}} assessments completed',
    trendImproved: '📈 Your score improved by {{count}} points since your last assessment. Keep up the great work!',
    trendDecreased: '📉 Your score decreased by {{count}} points. Review your immediate actions to get back on track.',
  },

  // ── Wizard page ─────────────────────────────────────────────────────────────
  wizard: {
    pageTitle: 'Digital Safety Assessment',
    loading: 'Loading questions…',
    loadError: 'Failed to load questions. Please try again.',
    stepLabel: 'Step {{current}}: {{label}}',
    questionCount_one: '{{count}} question',
    questionCount_other: '{{count}} questions',
    back: '← Back',
    next: 'Next →',
    submit: 'Submit assessment',
    submitting: 'Submitting…',
    pleaseSelectAnswer: 'Please select an answer',
    submitError: 'Something went wrong. Please try again.',
  },
} as const

export default assessments
