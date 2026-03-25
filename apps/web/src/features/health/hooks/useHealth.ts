import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { ApiError } from '@/types/api'

interface HealthResponse {
  status: string
  timestamp: string
}

async function fetchHealth(): Promise<HealthResponse> {
  return apiClient.get<HealthResponse>('/api/health')
}

/**
 * Checks the API health endpoint.
 *
 * @example
 * const { data, isLoading, error } = useHealth()
 * if (error?.isServerError) return <Banner>API unavailable</Banner>
 */
export function useHealth() {
  return useQuery<HealthResponse, ApiError>({
    queryKey: ['health'],
    queryFn: fetchHealth,
    // Poll every 30 s so the UI reflects live API status
    refetchInterval: 30_000,
    retry: (failureCount, error) => {
      // Don't retry on 4xx — only on network errors or 5xx
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        return false
      }
      return failureCount < 2
    },
  })
}
