import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/app/store/authStore'
import { isTokenExpired } from '@/utils/jwt'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

/**
 * The single axios instance of the app. Feature services (features/<name>/services) are the
 * only callers; components reach the API through React Query hooks, never through axios directly.
 */
export const apiClient = axios.create({ baseURL })

/** Largest `page_size` the backend's list endpoints accept (FastAPI `Query(le=100)`). */
export const MAX_PAGE_SIZE = 100

function isAuthEndpoint(url?: string): boolean {
  return Boolean(url && (url.includes('/auth/login') || url.includes('/auth/refresh')))
}

function forceLogout() {
  useAuthStore.getState().logout()
  if (window.location.pathname !== '/login') window.location.href = '/login'
}

// Single-flight refresh: if several requests 401 at once, only one refresh call
// is made and the rest wait on the same promise.
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) throw new Error('No refresh token available')

  const response = await axios.post<{ access_token: string; refresh_token: string }>(
    `${baseURL}/auth/refresh`,
    { refresh_token: refreshToken },
  )
  useAuthStore.getState().setTokens(response.data.access_token, response.data.refresh_token)
  return response.data.access_token
}

function getFreshToken(): Promise<string> {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

apiClient.interceptors.request.use(async (config) => {
  if (isAuthEndpoint(config.url)) return config

  let token = useAuthStore.getState().accessToken
  // Refresh proactively when the access token is expired/about to expire, instead of
  // sending a request that is guaranteed to bounce with a 401.
  if (token && isTokenExpired(token, 30_000)) {
    if (isTokenExpired(useAuthStore.getState().refreshToken)) {
      forceLogout()
      return Promise.reject(new axios.Cancel('session expired'))
    }
    try {
      token = await getFreshToken()
    } catch {
      forceLogout()
      return Promise.reject(new axios.Cancel('session expired'))
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retried = true
      try {
        const newToken = await getFreshToken()
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        forceLogout()
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'خطایی رخ داد'): string {
  if (axios.isAxiosError(error)) {
    // No response at all means the request never reached the server (backend down,
    // wrong URL, network/CORS issue) — this is a distinct failure from a proper 4xx/5xx
    // response and must never be shown as if it were the caller-supplied `fallback`
    // (e.g. "wrong email or password"), which would misdiagnose a connectivity problem
    // as a credentials problem.
    if (!error.response) {
      return 'امکان اتصال به سرور وجود ندارد. مطمئن شوید بک‌اند در حال اجراست.'
    }
    const detail = (error.response.data as { detail?: string } | undefined)?.detail
    if (typeof detail === 'string') return detail
  }
  return fallback
}
