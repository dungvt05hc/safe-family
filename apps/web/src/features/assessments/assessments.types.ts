// ── Questions (from GET /api/assessments/questions) ─────────────────────────

export interface QuestionOption {
  value: string
  label: string
}

export interface AssessmentQuestion {
  id: string
  category: string
  text: string
  options: QuestionOption[]
  isRequired: boolean
}

// ── Create request (POST /api/assessments) ────────────────────────────────────

export interface AnswerRequest {
  questionId: string
  selectedValue: string
}

export interface CreateAssessmentRequest {
  answers: AnswerRequest[]
}

// ── Response (POST /api/assessments, GET /api/assessments/latest) ─────────────

export interface CategoryScoreDto {
  category: string
  score: number
}

export interface AssessmentResult {
  id: string
  familyId: string
  overallScore: number
  categoryScores: CategoryScoreDto[]
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  immediateActions: string[]
  createdAt: string
}

// ── Derived helpers ────────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  accountSecurity: 'Account Security',
  deviceHygiene: 'Device Hygiene',
  backupRecovery: 'Backup & Recovery',
  privacySharing: 'Privacy & Sharing',
  scamReadiness: 'Scam Readiness',
}

export const RISK_LEVEL_CONFIG: Record<
  AssessmentResult['riskLevel'],
  { label: string; color: string; bg: string; border: string }
> = {
  Low:      { label: 'Low Risk',      color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
  Medium:   { label: 'Medium Risk',   color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
  High:     { label: 'High Risk',     color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  Critical: { label: 'Critical Risk', color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200' },
}

/** Groups questions by category, preserving original order. */
export function groupQuestionsByCategory(
  questions: AssessmentQuestion[],
): { category: string; questions: AssessmentQuestion[] }[] {
  const seen = new Map<string, AssessmentQuestion[]>()
  for (const q of questions) {
    if (!seen.has(q.category)) seen.set(q.category, [])
    seen.get(q.category)!.push(q)
  }
  return Array.from(seen.entries()).map(([category, questions]) => ({
    category,
    questions,
  }))
}
