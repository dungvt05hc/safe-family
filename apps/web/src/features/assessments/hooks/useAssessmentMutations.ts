import { useMutation, useQueryClient } from '@tanstack/react-query'
import { assessmentsService } from '../assessments.service'
import { ASSESSMENT_LATEST_KEY } from './useAssessmentQueries'
import type { CreateAssessmentRequest } from '../assessments.types'

export function useSubmitAssessment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssessmentRequest) => assessmentsService.create(data),
    onSuccess: (result) => {
      // Immediately populate the latest-assessment cache so the result page
      // can read it without an extra network round-trip.
      queryClient.setQueryData(ASSESSMENT_LATEST_KEY, result)
    },
  })
}
