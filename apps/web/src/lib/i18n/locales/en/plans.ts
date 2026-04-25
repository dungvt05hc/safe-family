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
} as const

export default plans
