import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/types/api'
import { familyService } from '../families.service'
import type { FamilyMember } from '../families.types'

export const FAMILY_MEMBERS_KEY = ['family-members'] as const

export function useFamilyMembers() {
  return useQuery<FamilyMember[], ApiError>({
    queryKey: FAMILY_MEMBERS_KEY,
    queryFn: familyService.listMembers,
    retry: false,
  })
}
