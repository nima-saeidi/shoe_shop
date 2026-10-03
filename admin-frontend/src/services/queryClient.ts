import { MutationCache, QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { getApiErrorMessage } from './apiClient'
import { message } from './message'

/**
 * Shared React Query client. Every failed mutation shows an error toast here, so pages only
 * handle the success path; a mutation can opt out with `meta: { silent: true }`.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.silent || axios.isCancel(error)) return
      message.error(getApiErrorMessage(error))
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
})
