import { apiClient } from '@/lib/api-client'
import type {
  AdminCustomerDetailResponse,
  AdminCustomerNoteInfo,
  AddCustomerNoteRequest,
} from './adminCustomerDetail.types'

export const adminCustomerDetailApi = {
  getDetail: (familyId: string): Promise<AdminCustomerDetailResponse> =>
    apiClient.get<AdminCustomerDetailResponse>(`/api/admin/customers/${familyId}`),

  addNote: (familyId: string, request: AddCustomerNoteRequest): Promise<AdminCustomerNoteInfo> =>
    apiClient.post<AdminCustomerNoteInfo>(`/api/admin/customers/${familyId}/notes`, request),
}
