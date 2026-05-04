const plans = {
  // ── Family Safety Plans page ───────────────────────────────────────────────
  safetyPlans: {
    title: 'Family Safety Plans',
    description: 'Personalised safety roadmaps generated for your family.',
    lockedTitle: 'Family Safety Plans are locked',
    lockedDescription:
      'Your personalised family safety plan — including risk analysis and action items — is generated after completing a Family Safety session.',
    lockedPackage: 'Family Core or Annual Plan',
    lockedCta: 'View packages',
    card: {
      title: 'Family Safety Plan',
      description: 'Personalised safety plan for your family.',
      riskLevel: 'Risk level:',
      topRisks: 'Top Risks',
      topPriorities: 'Top Priorities',
      actionPlanMembers: 'Action Plan — Members',
      actionPlanDevices: 'Action Plan — Devices',
      viewBooking: 'View booking',
      sourceAssessment: 'Source assessment',
    },
    empty: {
      title: 'Your safety plan is being prepared',
      description:
        "Our advisors are reviewing your family details and building your personalised safety plan. We'll notify you when it's ready.",
    },
    error: {
      subscription: 'Access to Family Safety Plans requires an active subscription.',
      generic: 'Failed to load safety plans.',
    },
  },

  // ── Incident Recovery Pack page ────────────────────────────────────────────
  recoveryPack: {
    title: 'Incident Recovery Pack',
    description:
      'Step-by-step recovery plan generated after your incident response session.',
    generatedOn: 'Generated {{date}}',
    downloadReport: 'Download Report',
    preparing: 'Preparing…',
    empty: {
      title: 'Your recovery pack is being prepared',
      description:
        "Our advisors are treating this as a priority. Your step-by-step recovery guide will be ready shortly — we'll notify you by email when it's available.",
    },
    error: {
      subscription: 'Access to Incident Recovery Packs requires an active subscription.',
      generic: 'Failed to load recovery pack.',
    },
  },

  // ── Family Safety Plan detail page ─────────────────────────────────────────
  familySafetyPlan: {
    title:          'Family Safety Plan',
    generatedOn:    'Generated {{date}}',
    score:          'Score: {{score}}/100',
    riskBadge:      '{{level}} Risk',
    preparing:      'Preparing…',
    downloadReport: 'Download Report',
    error: {
      paymentRequired: 'This feature requires an active plan.',
      generic:         'Could not load your safety plan. Please try again.',
    },
    empty: {
      title:       'No safety plan yet',
      description: 'Book a safety assessment to generate your personalised family safety plan.',
    },
    sections: {
      topRisksHeading:          'Top Risks Identified',
      immediateActionsRequired: 'Immediate actions required ({{count}})',
      moreImmediateActions:     '+{{count}} more immediate actions — see full checklist',
      noRisksListed:            'No specific risks listed in this plan.',
      topPrioritiesHeading:     'Top Priorities',
      recommendedTasks:         'Recommended tasks',
      memberActionPlanHeading:  'Action Plan by Family Member',
      unknownMember:            'Family Member',
      completionDone:           '{{done}}/{{total}} done',
      noMemberTasks:            'No member-specific tasks generated yet.',
      assetActionPlanHeading:   'Action Plan by Device & Account',
      unknownAsset:             'Unknown Asset',
      noAssetTasks:             'No device or account tasks generated yet.',
    },
  },

  // ── Incident Recovery list page ────────────────────────────────────────────
  incidentRecovery: {
    title:             'Incident Recovery Packs',
    description:       'Step-by-step recovery guides generated after an incident response session.',
    lockedTitle:       'Incident Recovery Packs are locked',
    lockedDescription:
      'Your personalised recovery pack — including containment steps, what to avoid, and a 7-day recovery guide — is generated after completing an Incident Response session.',
    lockedPackage: 'Incident Response package',
    lockedCta:     'View packages',
    cardTitle:     'Incident Recovery Pack',
    viewBooking:   'View booking',
    viewIncident:  'View incident',
    sections: {
      whatHappened:       'What Happened',
      whatToDoNow:        'What To Do Now',
      whatToDoNowHeading: 'What to Do Right Now',
      whatNotToDo:        'What Not To Do',
      whatNotToDoHeading: 'What NOT to Do',
      whatNotToDoWarning: 'Avoid these actions — they can worsen the situation or destroy evidence.',
      next24Hours:        'Next 24 Hours',
      next7Days:          'Next 7 Days',
      next7DaysHeading:   'Recovery Plan — Next 7 Days',
      advisorPreparing:   'Details are being documented by your advisor.',
      advisorWillAdd:     'Your advisor will add recovery steps here after your session.',
      completionCount:    '{{done}}/{{total}} complete',
      viewSessionBooking: 'View session booking',
      viewIncidentRecord: 'View incident record',
      forTarget:          'For: {{target}}',
    },
    error: {
      subscription: 'Access to Incident Recovery Packs requires an active subscription.',
      generic:      'Failed to load recovery packs.',
    },
    empty: {
      title:       'Your recovery pack is being prepared',
      description:
        "Our advisors are treating this as a priority. Your step-by-step recovery guide will be ready shortly. We'll notify you by email when it's available.",
    },
  },

  // ── Plan CTA banner (checklist shortcut) ──────────────────────────────────
  planCtaBanner: {
    heading:      'Open Full Safety Checklist',
    progressLabel: '{{completed}} of {{total}} tasks complete · {{pct}}%',
    emptyLabel:   'View and manage all your safety tasks',
    progressAria: 'Overall progress',
  },

  // ── Premium product copy (PremiumLockedState + UpgradeCTACard) ────────────
  products: {
    whatsIncluded: "What's included",
    includedWith:  'Included with the {{name}}',
    PremiumChecklist: {
      title:       'Premium Safety Checklist',
      pitch:
        "A personalised, prioritised action list generated from your family's accounts, devices, and safety assessment.",
      features: [
        'Tasks ranked by urgency — Act Now, This Week, This Month, Ongoing',
        'Step-by-step guidance and remediation for every action',
        'Filters by priority, category, and phase',
        'Progress tracking with completion stats',
        'Unlocks with any Safety Plan package',
      ],
      packageName: 'Family Safety Plan or Premium Checklist package',
      ctaLabel:    'View packages',
    },
    FamilySafetyPlan: {
      title:       'Family Safety Plan',
      pitch:
        'Your personalised family safety roadmap, built from your assessment results and reviewed by a SafeFamily advisor.',
      features: [
        'Top risks identified and prioritised for your family',
        'Action plans tailored to each family member',
        'Device and account-level security actions',
        'Downloadable PDF safety report',
        'Linked directly to your safety task checklist',
      ],
      packageName: 'Family Safety Plan package',
      ctaLabel:    'Book a Safety Assessment',
    },
    IncidentRecoveryPack: {
      title: 'Incident Recovery Pack',
      pitch: 'A step-by-step recovery guide created by your advisor after an Incident Response session.',
      features: [
        'Immediate containment steps to take right now',
        'Clear list of actions to avoid — protect evidence and accounts',
        'Prioritised 24-hour and 7-day recovery task plan',
        'Assigned tasks for family members and specific devices',
        'Downloadable incident recovery report',
      ],
      packageName: 'Incident Response package',
      ctaLabel:    'Book an Incident Response session',
    },
    AnnualPlan: {
      title: 'Annual Safety Plan',
      pitch:
        "A yearly safety review that keeps your family's digital security posture current and proactive.",
      features: [
        'Recurring safety tasks and scheduled annual check-ins',
        'Scam readiness, backup recovery, and privacy coverage',
        'Proactive monitoring actions across all accounts',
        "Tailored to your family's ecosystem (Google, Apple, Microsoft)",
        'Progress carried forward year-over-year',
      ],
      packageName: 'Annual Safety Plan subscription',
      ctaLabel:    'Upgrade to Annual Plan',
    },
  },
} as const

export default plans
