import { useQuery } from '@tanstack/react-query'
import { assessmentsService } from '../assessments.service'
import type { AssessmentQuestion, AssessmentResult } from '../assessments.types'
import type { ApiError } from '@/types/api'

export const ASSESSMENT_QUESTIONS_KEY = ['assessment-questions'] as const
export const ASSESSMENT_LATEST_KEY    = ['assessment-latest'] as const

export function useAssessmentQuestions() {
  return useQuery<AssessmentQuestion[], ApiError>({
    queryKey: ASSESSMENT_QUESTIONS_KEY,
    queryFn: assessmentsService.getQuestions,
    staleTime: Infinity, // questions are static seeds — never re-fetch
    retry: false,
  })
}

export function useLatestAssessment() {
  return useQuery<AssessmentResult | null, ApiError>({
    queryKey: ASSESSMENT_LATEST_KEY,
    queryFn: assessmentsService.getLatest,
    retry: false,
  })
}
