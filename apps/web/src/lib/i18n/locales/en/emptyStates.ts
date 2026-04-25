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
} as const

export default emptyStates
