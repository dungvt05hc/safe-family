import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute — reduce network chattiness
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
