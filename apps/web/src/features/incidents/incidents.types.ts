export type IncidentType =
  | 'PhishingAttempt'
  | 'PasswordCompromise'
  | 'DeviceLostOrStolen'
  | 'UnauthorisedAccess'
  | 'DataBreach'
  | 'MalwareInfection'
  | 'ScamOrFraud'
  | 'IdentityTheft'
  | 'SocialEngineering'
  | 'Other'

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'

export interface CreateIncidentRequest {
  type: IncidentType
  severity: IncidentSeverity
  summary: string
}

export interface IncidentResult {
  id: string
  familyId: string
  type: IncidentType
  severity: IncidentSeverity
  summary: string
  firstActionPlan: string | null
  createdAt: string
  updatedAt: string
}

interface IncidentTypeConfig {
  label: string
  icon: string
  description: string
}

export const INCIDENT_TYPE_CONFIG: Record<IncidentType, IncidentTypeConfig> = {
  PhishingAttempt: {
    label: 'Phishing Attempt',
    icon: '🎣',
    description: 'Suspicious email, SMS, or link trying to steal credentials',
  },
  PasswordCompromise: {
    label: 'Password Compromised',
    icon: '🔑',
    description: 'Account password may have been exposed or leaked',
  },
  DeviceLostOrStolen: {
    label: 'Device Lost or Stolen',
    icon: '📱',
    description: 'Phone, tablet, laptop or other device is missing or taken',
  },
  UnauthorisedAccess: {
    label: 'Unauthorised Access',
    icon: '🚪',
    description: 'Someone accessed an account or device without permission',
  },
  DataBreach: {
    label: 'Data Breach',
    icon: '📂',
    description: 'Personal information was exposed in a third-party breach',
  },
  MalwareInfection: {
    label: 'Malware / Virus',
    icon: '🦠',
    description: 'Device infected with malicious software or ransomware',
  },
  ScamOrFraud: {
    label: 'Scam or Fraud',
    icon: '💸',
    description: 'Financial scam, fake invoice, or fraudulent transaction',
  },
  IdentityTheft: {
    label: 'Identity Theft',
    icon: '🪪',
    description: 'Personal identity used fraudulently by someone else',
  },
  SocialEngineering: {
    label: 'Social Engineering',
    icon: '🎭',
    description: 'Psychological manipulation to divulge private information',
  },
  Other: {
    label: 'Other Incident',
    icon: '⚠️',
    description: 'A security incident not covered by the other categories',
  },
}

interface SeverityConfig {
  label: string
  color: string
  description: string
}

export const SEVERITY_CONFIG: Record<IncidentSeverity, SeverityConfig> = {
  Low: {
    label: 'Low',
    color: 'text-green-700 bg-green-100',
    description: 'Minor risk, no immediate action required',
  },
  Medium: {
    label: 'Medium',
    color: 'text-yellow-700 bg-yellow-100',
    description: 'Moderate risk, remediate within 24–48 hours',
  },
  High: {
    label: 'High',
    color: 'text-orange-700 bg-orange-100',
    description: 'Significant risk, act as soon as possible',
  },
  Critical: {
    label: 'Critical',
    color: 'text-red-700 bg-red-100',
    description: 'Severe risk, take immediate action now',
  },
}
