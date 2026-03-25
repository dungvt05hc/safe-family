import { useMutation } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { ApiError } from '@/types/api'
import { familyService } from '../families.service'
import { FAMILY_MEMBERS_KEY } from './useFamilyMembers'
import type { FamilyMember, FamilyMemberFormValues } from '../families.types'

export function useAddFamilyMember() {
  return useMutation<FamilyMember, ApiError, FamilyMemberFormValues>({
    mutationFn: familyService.addMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_MEMBERS_KEY })
    },
  })
}

export function useUpdateFamilyMember(id: string) {
  return useMutation<FamilyMember, ApiError, FamilyMemberFormValues>({
    mutationFn: (data) => familyService.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_MEMBERS_KEY })
    },
  })
}

export function useArchiveFamilyMember() {
  return useMutation<void, ApiError, string>({
    mutationFn: familyService.archiveMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FAMILY_MEMBERS_KEY })
    },
  })
}
