import { apiClient } from '@/lib/api-client'
import type { CreateFamilyFormValues, Family, FamilyMember, FamilyMemberFormValues } from './families.types'

export const familyService = {
  myFamily: (): Promise<Family> =>
    apiClient.get<Family>('/api/families/me'),

  create: (data: CreateFamilyFormValues): Promise<Family> =>
    apiClient.post<Family>('/api/families', data),

  listMembers: (): Promise<FamilyMember[]> =>
    apiClient.get<FamilyMember[]>('/api/family-members'),

  addMember: (data: FamilyMemberFormValues): Promise<FamilyMember> =>
    apiClient.post<FamilyMember>('/api/family-members', data),

  updateMember: (id: string, data: FamilyMemberFormValues): Promise<FamilyMember> =>
    apiClient.put<FamilyMember>(`/api/family-members/${id}`, data),

  archiveMember: (id: string): Promise<void> =>
    apiClient.del<void>(`/api/family-members/${id}`),
}
