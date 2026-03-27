import { apiClient } from '@/lib/api-client'
import type { AssessmentQuestion, AssessmentResult, CreateAssessmentRequest } from './assessments.types'

export const assessmentsService = {
  getQuestions: (): Promise<AssessmentQuestion[]> =>
    apiClient.get<AssessmentQuestion[]>('/api/assessments/questions'),

  create: (data: CreateAssessmentRequest): Promise<AssessmentResult> =>
    apiClient.post<AssessmentResult>('/api/assessments', data),

  getLatest: (): Promise<AssessmentResult | null> =>
    apiClient.get<AssessmentResult>('/api/assessments/latest').catch((err) => {
      if (err?.isNotFound) return null
      throw err
    }),

  getHistory: (): Promise<AssessmentResult[]> =>
    apiClient.get<AssessmentResult[]>('/api/assessments/history'),
}
