import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { familyService } from '../families.service'
import { MY_FAMILY_KEY } from './useMyFamily'
import type { CreateFamilyFormValues, Family } from '../families.types'

export function useCreateFamily() {
  return useMutation<Family, ApiError, CreateFamilyFormValues>({
    mutationFn: familyService.create,
    onSuccess: (family) => {
      queryClient.setQueryData(MY_FAMILY_KEY, family)
    },
  })
}
