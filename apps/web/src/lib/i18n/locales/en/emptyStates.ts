const emptyStates = {
  familyMembers: {
    title: 'No family members yet',
    description:
      'Add the people in your family to start tracking their digital safety and online habits.',
    action: 'Add Member',
  },
  accounts: {
    title: 'No accounts tracked',
    description:
      "Register your family's online accounts to monitor two-factor authentication, recovery settings, and suspicious activity.",
    action: 'Add Account',
  },
  devices: {
    title: 'No devices registered',
    description:
      "Add your family's phones, tablets, and computers to check their security health — screen lock, backups, OS support, and more.",
    action: 'Add Device',
  },
  incidents: {
    title: 'No incidents reported',
    description:
      'All clear! If your family encounters phishing, suspicious logins, or any other threat, report it here so we can guide you through the next steps.',
    action: 'Report an Incident',
  },
  bookings: {
    title: 'No bookings yet',
    description:
      "Book a one-on-one safety session with our experts. We'll help your family strengthen passwords, review device security, and protect against online threats.",
    action: 'Book a Session',
  },
  reports: {
    title: 'No reports yet',
    description:
      'Reports are generated after you complete a risk assessment or report an incident.',
    action: 'Run Risk Check',
  },
  tasks: {
    title: 'No tasks yet',
    description:
      'SafeFamily generates tasks from your accounts and devices. Add them to get started.',
    action: 'Add Account',
  },
  checklist: {
    title: 'Checklist is empty',
    description:
      'SafeFamily automatically builds your checklist from your accounts and devices.',
  },
  assessments: {
    title: 'No assessment results yet',
    description:
      'Complete a safety assessment to see your protection score and recommended actions.',
    action: 'Start Assessment',
  },
  plans: {
    title: 'No safety plans yet',
    description:
      'Safety plans are created after you book a consultation with our advisors.',
  },
  members: {
    title: 'No members',
    description:
      'Add your family members to start tracking their digital safety.',
    action: 'Add Member',
  },
  noResults: {
    title: 'No results found',
    description: 'Try changing your filters or search terms.',
  },
} as const

export default emptyStates
