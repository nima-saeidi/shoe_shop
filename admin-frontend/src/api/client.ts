import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1'

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig | undefined

    if (error.response?.status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true
      try {
        refreshPromise ??= refreshAccessToken().finally(() => {
          refreshPromise = null
        })
        const newToken = await refreshPromise
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch {
        useAuthStore.getState().logout()
        window.location.href = '/login'
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
