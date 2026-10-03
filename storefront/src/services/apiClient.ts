import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/app/store/authStore'
import { isTokenExpired } from '@/utils/jwt'

/**
 * Browser axios instance. Requests go to the same origin (`/api/v1`) and are proxied to
 * FastAPI by Next.js, so there is no CORS to configure. Only feature services call it;
 * components reach the API through React Query hooks.
 */
export const apiClient = axios.create({ baseURL: '/api/v1', timeout: 20_000 })

const isAuthUrl = (url?: string) => Boolean(url && /\/auth\/(login|register|refresh)/.test(url))

let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const { refreshToken, setTokens } = useAuthStore.getState()
  if (!refreshToken) throw new Error('no refresh token')
  const { data } = await axios.post<{ access_token: string; refresh_token: string }>('/api/v1/auth/refresh', {
    refresh_token: refreshToken,
  })
  setTokens(data.access_token, data.refresh_token)
  return data.access_token
}

// Single-flight: concurrent requests share one refresh call.
function getFreshToken(): Promise<string> {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null
  })
  return refreshPromise
}

function forceLogout() {
  useAuthStore.getState().logout()
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`
  }
}

apiClient.interceptors.request.use(async (config) => {
  if (isAuthUrl(config.url)) return config
  let token = useAuthStore.getState().accessToken
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
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

interface Retryable extends InternalAxiosRequestConfig {
  _retried?: boolean
}

apiClient.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const original = error.config as Retryable | undefined
    if (error.response?.status === 401 && original && !original._retried && !isAuthUrl(original.url)) {
      original._retried = true
      try {
        const token = await getFreshToken()
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      } catch {
        forceLogout()
      }
    }
    return Promise.reject(error)
  },
)
