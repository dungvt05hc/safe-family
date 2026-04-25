const bookings = {
  // ── Booking form page ──────────────────────────────────────────────────────
  form: {
    title: 'Get Personalised Safety Help',
    description:
      "Choose a plan, tell us what's happening, and we'll prepare your personalised safety materials.",
    myBookings: 'My Bookings',
    errorGeneric: 'Something went wrong. Please try again.',
    step1: {
      title: '1. Choose your safety package',
      description:
        "Each package unlocks a different set of digital safety materials — pick the one that fits your situation.",
    },
    step2: {
      title: '2. What do you need help with?',
      description:
        'Pick the closest match — this helps us personalise your safety materials.',
      placeholder: 'Or describe it in your own words…',
    },
    step3: {
      title: '3. How urgent is this?',
      description:
        'This helps us prioritise your request and tailor the tone of your materials.',
    },
    step4: {
      title: '4. Who is affected?',
      optional: '(optional)',
      description: 'Which family member does this situation primarily involve?',
      placeholder: 'Or type a name…',
    },
    step5: {
      title: '5. Which account or device is affected?',
      optional: '(optional)',
      description:
        'e.g. "Dad\'s Gmail", "Family iPad", "Instagram account". Helps us target our advice.',
      placeholder: "e.g. Mum's iPhone, Netflix account…",
    },
    step6: {
      title: '6. Anything else we should know?',
      optional: '(optional)',
      description: 'The more context you share, the more targeted your materials will be.',
      placeholder:
        'e.g. We received a suspicious email last week. Our teenager has also been getting strange messages on Instagram…',
      tip: 'Tip: describe what happened, when, and who in your family is affected.',
    },
    summary: {
      title: 'Your order at a glance',
      readyToSubmit: 'Ready to submit',
      package: 'Package',
      helpTopic: 'Help topic',
      urgency: 'Urgency',
      delivery: 'Delivery',
      totalDue: 'Total due',
    },
    whatsUnlocked: {
      title: "What you'll unlock",
      includedWith: 'Included with {{name}}',
      selectPrompt: "Select a package above to see what you'll unlock.",
      notSelectedYet: 'Not selected yet',
    },
    submit: {
      free: 'Unlock My Plan',
      paid: 'Continue to Payment',
    },
    validation: {
      selectPackage: 'Please select a package',
      helpTopicRequired: 'Please tell us what you need help with',
      notesLength: 'Notes must be 1000 characters or fewer',
    },
    bestFor: 'Best for:',
    noPackagesAvailable: 'No service packages available at this time.',
  },

  // ── Urgency options ────────────────────────────────────────────────────────
  urgency: {
    routine: {
      label: 'No rush',
      body: "I'd like to improve our safety, but there's no immediate threat.",
    },
    urgent: {
      label: 'Needs attention',
      body: 'Something concerning has happened recently and I want to sort it out.',
    },
    critical: {
      label: 'Active issue — urgent',
      body: "We're dealing with an active problem right now and need immediate guidance.",
    },
  },

  // ── How it works ──────────────────────────────────────────────────────────
  howItWorks: [
    {
      title: 'Pay securely',
      body: 'Your payment is processed via our secure gateway. Free packages skip this step entirely.',
    },
    {
      title: 'We prepare your materials',
      body: 'Our advisors review your details and personalise your plan or pack — usually within 1 business day.',
    },
    {
      title: 'Access your content',
      body: "Your safety materials are delivered to your account and inbox as soon as they're ready.",
    },
  ],

  // ── Help topics quick-select ───────────────────────────────────────────────
  helpTopics: [
    'Account security & passwords',
    'Phishing or suspicious messages',
    'Data breach or leaked information',
    'Social media safety',
    'Device security & malware',
    'Online scams & fraud',
    'Child online safety',
    'Privacy settings',
    'Identity theft',
  ],

  // ── Package metadata (text only; icons remain in static component data) ───
  packages: {
    freeCheck: {
      badge: 'Free — no card needed',
      tagline: 'Know your exact risk level in minutes',
      bestFor: 'Families new to digital safety who want a clear, no-cost starting point',
      highlights: [
        'Downloadable security summary report',
        '3 personalised action items',
        'Starter safety checklist',
      ],
    },
    familyCore: {
      badge: 'Most popular',
      tagline: 'A complete safety roadmap for your whole family',
      bestFor:
        'Families ready for a thorough safety audit across all accounts and devices',
      highlights: [
        'Personalised family safety plan (PDF)',
        'Premium interactive safety checklist',
        'Password & account audit results',
      ],
    },
    incidentResp: {
      badge: 'For active incidents',
      tagline: 'Stop an active threat and know exactly what to do next',
      bestFor: 'Families dealing with an active breach, scam, or data leak',
      highlights: [
        'Expert-authored incident recovery pack',
        'Step-by-step threat containment checklist',
        'Follow-up monitoring guide',
      ],
    },
    annualPlan: {
      badge: 'Best value',
      tagline: 'Stay ahead of threats all year with expert-curated guidance',
      bestFor: 'Families wanting ongoing protection and priority access year-round',
      highlights: [
        '4× quarterly safety plan updates',
        'Priority incident response — 24h SLA',
        'Full family security roadmap (PDF)',
        'Unlimited advisor access for 12 months',
      ],
    },
  },

  // ── Package deliverables (What you'll unlock) ─────────────────────────────
  deliverables: {
    freeCheck: [
      'Digital security summary report',
      '3 personalised action items',
      'Starter safety checklist',
    ],
    familyCore: [
      'Personalised family safety plan (PDF)',
      'Premium interactive safety checklist',
      'Password & account audit results',
    ],
    incidentResp: [
      'Incident recovery pack (step-by-step guide)',
      'Threat containment checklist',
      'Follow-up action plan & monitoring guide',
    ],
    annualPlan: [
      '4× quarterly safety plan updates',
      'Priority incident response (24h SLA)',
      'Full family security roadmap (PDF)',
    ],
  },

  // ── My Bookings page ──────────────────────────────────────────────────────
  myBookings: {
    title: 'My Bookings',
    description: 'Your upcoming and past safety sessions.',
    bookSession: 'Book a Session',
    loadError: 'Failed to load bookings. Please refresh and try again.',
  },

  // ── Payment action strip ──────────────────────────────────────────────────
  payment: {
    required: 'Payment required to confirm your booking',
    payNow: 'Pay now',
    waitingConfirmation: 'Waiting for payment confirmation',
    failedRetry: 'Payment was declined — you can try again',
    expired: 'Payment window expired — start a new session',
    failedAction: 'Failed — try again',
    retry: 'Retry',
    free: 'Free',
  },
} as const

export default bookings
