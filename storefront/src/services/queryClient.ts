import { QueryClient, isServer } from '@tanstack/react-query'
import axios from 'axios'

/** 4xx answers are final (not found, forbidden, validation): only network/5xx failures are retried. */
function shouldRetry(failureCount: number, error: unknown) {
  if (axios.isCancel(error)) return false
  if (axios.isAxiosError(error) && error.response && error.response.status < 500) return false
  return failureCount < 1
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: shouldRetry },
      mutations: { retry: false },
    },
  })
}

let browserQueryClient: QueryClient | undefined

/**
 * One client per browser tab (kept across renders and route changes); a fresh one per server
 * render so cached data can never leak between visitors.
 */
export function getQueryClient() {
  if (isServer) return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}
