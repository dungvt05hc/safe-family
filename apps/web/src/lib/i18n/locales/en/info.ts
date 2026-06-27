/**
 * info namespace — strings for all public informational pages
 * (About, Contact, Privacy, Terms, Help).
 *
 * Keys with {{interpolation}} placeholders are filled at render time.
 * Keep key structure flat within each page section for easy type-safe access.
 */
const info = {
  about: {
    title: 'About SafeFamily',
    subtitle: 'Protecting families in the digital age.',

    mission: {
      heading: 'Our Mission',
      body: 'Digital life is part of family life — and managing it shouldn\'t require a technology degree. SafeFamily gives every household the tools, language, and confidence to stay safe online: from assessing risks before they become problems, to guiding you calmly through an incident when one occurs. We believe peace of mind is something every family deserves.',
    },

    forWho: {
      heading: 'Who It\'s For',
      intro: 'SafeFamily is built for anyone responsible for the digital wellbeing of a household.',
      item0: {
        heading: 'Parents with young children',
        body: 'Build age-appropriate safety plans, register your children\'s devices, and get clear guidance on risks before they become serious problems.',
      },
      item1: {
        heading: 'Families with teenagers',
        body: 'Navigate the more complex risks of teenage digital life — social platforms, unsupervised browsing, and account security — with calm, practical tools.',
      },
      item2: {
        heading: 'Carers & guardians',
        body: 'Whether you\'re looking after elderly relatives or children, get visibility across all household devices and a simple way to act when something goes wrong.',
      },
    },

    whatWeDo: {
      heading: 'What We Help With',
      assessment: {
        heading: 'Digital Safety Assessments',
        body: 'A guided questionnaire that maps your family\'s digital habits and exposure, then outputs a prioritised safety plan with clear next steps.',
      },
      incident: {
        heading: 'Incident Response',
        body: 'Pre-built response guides and documentation templates that walk you through recovery — calmly, step by step.',
      },
      devices: {
        heading: 'Device Management',
        body: 'Register every phone, tablet, laptop, and smart-home device your family uses. Track and manage them all from one dashboard.',
      },
    },

    howItWorks: {
      heading: 'How It Works',
      step0: {
        heading: 'Run a safety assessment',
        body: 'Answer a short guided questionnaire about your family\'s devices and online habits. Most families finish in under 10 minutes.',
      },
      step1: {
        heading: 'Get your personalised plan',
        body: 'SafeFamily analyses your answers and generates a prioritised checklist of actions tailored to your household\'s specific risks.',
      },
      step2: {
        heading: 'Register your devices',
        body: 'Add the devices your family uses — phones, tablets, laptops, smart speakers. Everything tracked in one place.',
      },
      step3: {
        heading: 'Monitor and respond',
        body: 'Work through your safety checklists, track progress, and follow incident recovery guides whenever you need them.',
      },
    },

    company: {
      heading: 'About the Company',
      body: '{{legalName}} is registered in Singapore and serves families across Southeast Asia. We are a small, focused team that believes digital safety should be accessible and understandable for every family — not just the technically confident.',
    },
  },

  contact: {
    title: 'Contact Us',
    subtitle: 'Get in touch — our support team is here to help.',
    details: {
      heading: 'Contact Details',
      labels: {
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
      },
    },
    form: {
      heading: 'Send Us a Message',
      name: { label: 'Your name', placeholder: 'Jane Smith' },
      email: { label: 'Your email', placeholder: 'jane@example.com' },
      subject: { label: 'Subject', placeholder: 'How can we help?' },
      message: { label: 'Message', placeholder: 'Tell us what you need and we\'ll get back to you as soon as possible.' },
      submit: 'Send message',
      note: 'We\'ll reply to your email address within one business day.',
    },
    hours: {
      heading: 'Support Hours',
      body: 'Monday – Friday, 9:00 am – 6:00 pm (ICT, UTC+7). We aim to respond to all enquiries within one business day.',
    },
    note: {
      heading: 'Account & Billing Enquiries',
      body: 'For account-specific queries — billing, subscriptions, or data requests — email {{email}} with your account name for faster service.',
    },
  },

  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Last updated: 9 May 2026',
    intro: {
      body: 'This Privacy Policy explains how SafeFamily ("we", "our", or "us") collects, uses, stores, and protects information about you when you use our service. By using SafeFamily, you agree to the practices described in this policy. If you have questions, please contact us before using the service.',
    },
    collect: {
      heading: 'Information We Collect',
      body: 'We collect information you provide directly — such as your name, email address, and family details — and information generated by your use of the service, including device data, digital-safety assessment results, and incident reports. We do not sell or rent your personal data to third parties.',
    },
    use: {
      heading: 'How We Use Your Information',
      body: 'Your information is used to provide and improve our services, communicate with you about your account, send service-related notifications, and comply with legal obligations. We do not use your data for third-party advertising or cross-site tracking.',
    },
    storage: {
      heading: 'Data Storage & Protection',
      body: 'Your data is stored in encrypted databases hosted in Singapore. We apply industry-standard controls including encryption at rest and in transit, access controls, and routine reviews. While we take reasonable steps to protect your data, no system is completely immune to risk.',
    },
    thirdParty: {
      heading: 'Third-Party Services',
      body: 'We rely on a small number of trusted third-party providers to operate our service, including payment processors and cloud infrastructure providers. These providers receive only the data necessary to deliver their function and are contractually required to protect your information. We do not share your data with third parties for advertising or marketing.',
    },
    cookies: {
      heading: 'Cookies & Local Storage',
      body: 'SafeFamily uses session cookies and browser local storage to keep you signed in and remember your in-app preferences. We do not use tracking cookies or third-party analytics cookies. You can clear cookies at any time through your browser settings; doing so will sign you out of the app.',
    },
    rights: {
      heading: 'Your Rights',
      body: 'You have the right to access, correct, or request deletion of your personal data at any time. Depending on your location, you may also have the right to restrict or object to certain processing, or to receive a copy of your data in a portable format. To exercise any of these rights, contact us at {{email}}. We will respond within 30 days.',
    },
    contactInfo: {
      heading: 'Questions About Privacy',
      body: 'If you have questions, concerns, or requests relating to this Privacy Policy or our handling of your data, please reach out to our support team at {{email}}. We take privacy enquiries seriously and aim to respond promptly.',
    },
    changes: {
      body: 'We may update this policy from time to time. We will notify you of significant changes via email or an in-app notice before they take effect. Continued use of the service after that point constitutes acceptance of the updated policy.',
    },
  },

  terms: {
    title: 'Terms of Service',
    subtitle: 'Last updated: 9 May 2026',
    intro: {
      body: 'These Terms of Service ("Terms") govern your access to and use of SafeFamily, operated by {{legalName}}. Please read them carefully. By creating an account or using the service in any way, you agree to these Terms. If you do not agree, please do not use SafeFamily.',
    },
    acceptance: {
      heading: 'Acceptance of Terms',
      body: 'By accessing or using SafeFamily you confirm that you are at least 18 years old (or the age of majority in your jurisdiction), that you have read and understood these Terms, and that you agree to be bound by them. If you are accepting on behalf of an organisation, you represent that you have the authority to do so.',
    },
    service: {
      heading: 'Use of the Service',
      body: 'SafeFamily is a family digital-safety platform. You may use the service only for lawful, personal, non-commercial purposes and in accordance with these Terms. You must not attempt to access, probe, or disrupt the service\'s underlying systems, or use the service in any way that is abusive, fraudulent, or harmful to other users.',
    },
    responsibilities: {
      heading: 'User Responsibilities',
      body: 'You are responsible for keeping your account credentials confidential and for all activity that occurs under your account. You agree to provide accurate information when registering, keep it up to date, and notify us immediately at {{email}} if you believe your account has been compromised.',
    },
    payment: {
      heading: 'Subscriptions & Payment',
      body: 'Certain features of SafeFamily require a paid subscription. Subscription fees are billed in advance on a monthly or annual basis and are non-refundable except where required by law. You can cancel your subscription at any time; access continues until the end of the current billing period. We reserve the right to change pricing with at least 30 days\' notice.',
    },
    ip: {
      heading: 'Intellectual Property',
      body: 'All content, features, and functionality of the service — including text, graphics, logos, and software — are the property of {{legalName}} or its licensors and are protected by applicable intellectual property laws. You may not copy, modify, distribute, or create derivative works from any part of the service without our prior written consent.',
    },
    disclaimers: {
      heading: 'Disclaimers',
      body: 'SafeFamily is provided "as is" and "as available" without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or completely secure. Digital-safety assessments and recommendations are provided for informational purposes and do not constitute professional legal, medical, or security advice.',
    },
    liability: {
      heading: 'Limitation of Liability',
      body: 'To the fullest extent permitted by applicable law, {{legalName}} and its officers, employees, and licensors are not liable for any indirect, incidental, special, punitive, or consequential damages — including loss of data, revenue, or goodwill — arising from your use of, or inability to use, the service, even if we have been advised of the possibility of such damages.',
    },
    law: {
      heading: 'Governing Law',
      body: 'These Terms are governed by and construed in accordance with the laws of Singapore, without regard to its conflict-of-law principles. Any disputes arising under or in connection with these Terms will be subject to the exclusive jurisdiction of the courts of Singapore.',
    },
    contactInfo: {
      heading: 'Questions About These Terms',
      body: 'If you have questions about these Terms or need to get in touch with us for any reason, you can reach our team at {{email}}. We aim to respond to all enquiries within 3 business days.',
    },
    changes: {
      body: 'We may revise these Terms from time to time. When we do, we will update the date at the top of this page and — for material changes — notify you by email or in-app notice before the changes take effect. Continued use of the service after that point constitutes acceptance of the revised Terms.',
    },
  },

  help: {
    title: 'Help Centre',
    subtitle: 'Find answers to common questions about SafeFamily.',

    gettingStarted: {
      heading: 'Getting Started',
      q0: 'How do I create a family profile?',
      a0: 'After signing in, go to Family → Members and follow the on-screen steps. You can add children, partners, and other household members.',
      q1: 'What is a digital safety assessment?',
      a1: "An assessment is a guided questionnaire that evaluates your family's digital habits and risk exposure, then generates a personalised safety plan with recommended actions.",
      q2: 'Do I need to invite family members straight away?',
      a2: 'No — you can complete your first assessment and explore the platform on your own. Family member invitations are optional and can be sent any time from Family → Members.',
    },

    family: {
      heading: 'Managing Family Members',
      q0: 'How do I add a family member?',
      a0: 'Go to Family → Members and tap Add Member. Enter their name and role (e.g. Child, Partner). They will receive an invitation email if you choose to give them their own login.',
      q1: 'Can children have their own accounts?',
      a1: 'Children under 13 are managed under your account — they do not sign in separately. Teens aged 13 and over can be given limited access with a separate login. You remain the account owner at all times.',
      q2: 'How do I remove a family member?',
      a2: 'Go to Family → Members, select the member, and choose Remove. Their data is removed from your family immediately. The underlying account record is retained for 30 days before permanent deletion.',
    },

    devices: {
      heading: 'Accounts & Devices',
      q0: 'Which devices can I add?',
      a0: 'You can register any smartphone, tablet, laptop, or smart home device. We support iOS, Android, Windows, macOS, and a range of smart-home platforms.',
      q1: 'Can I remove a device?',
      a1: 'Yes. Go to Devices, select the device you want to remove, and choose Remove. The device will be unlinked from your family immediately.',
      q2: 'How many devices can I register?',
      a2: 'The Free plan includes one registered device. Paid plans support unlimited device registrations across your entire household.',
    },

    assessments: {
      heading: 'Assessments & Safety Tasks',
      q0: 'How often should I run a safety assessment?',
      a0: 'We recommend running a full assessment every 6 months, or whenever something significant changes — a new device, a new family member, or after a security incident.',
      q1: 'What happens after I complete an assessment?',
      a1: 'SafeFamily generates a personalised safety plan with prioritised action items. You can work through the plan at your own pace; completed tasks are tracked on your dashboard.',
      q2: 'What are safety checklists?',
      a2: 'Checklists are focused, step-by-step guides for specific topics — such as securing a new phone or reviewing social media privacy settings. They sit inside your safety plan and can also be started independently.',
    },

    incidents: {
      heading: 'Incidents & Recovery Packs',
      q0: 'What is an incident?',
      a0: 'An incident is any digital safety event affecting your family — such as a phishing attempt, a compromised account, cyberbullying, or a data breach. You log it in SafeFamily to keep a record and access a guided response.',
      q1: 'What is a recovery pack?',
      a1: 'A recovery pack is a curated, step-by-step response guide for a specific type of incident. It walks you through the actions to take, who to contact, and how to document what happened for future reference.',
      q2: 'How do I log an incident?',
      a2: 'Go to Incidents → Report Incident, choose the incident type, and follow the prompts. SafeFamily will match you with the appropriate recovery pack and guide you through the response.',
    },

    billing: {
      heading: 'Payments & Reports',
      q0: 'What plan do I need?',
      a0: 'Our Free plan covers basic assessments and one registered device. Upgrade to a paid plan for unlimited devices, premium checklists, incident recovery packs, and priority support.',
      q1: 'How do I cancel my subscription?',
      a1: 'Go to Settings → Subscription and select Cancel Plan. Your access continues until the end of the current billing period. You will not be charged again after cancellation.',
      q2: 'Can I export a safety report?',
      a2: 'Yes. Go to Reports and choose the report type — Safety Summary, Incident Log, or Device Overview. Reports can be exported as PDF or CSV and are available on paid plans.',
    },

    stillNeedHelp: {
      heading: 'Still need help?',
      body: "Email our support team at {{email}} and we'll get back to you within one business day.",
    },
  },
} as const

export default info
