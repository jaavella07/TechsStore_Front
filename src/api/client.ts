import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '@/lib/constants'

// ── Token registry (set by authStore after init) ───────────────────────────
let _accessToken: string | null = null
let _refreshToken: string | null = null
let _onLogout: (() => void) | null = null

export function setClientTokens(access: string | null, refresh: string | null) {
  _accessToken = access
  _refreshToken = refresh
}

export function setClientLogoutCallback(cb: () => void) {
  _onLogout = cb
}

// ── Axios instance ─────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
})

// ── Request interceptor: attach access token ──────────────────────────────
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`
  }
  return config
})

// ── Refresh queue: prevents multiple simultaneous refresh calls ───────────
let isRefreshing = false
type QueueItem = { resolve: (token: string) => void; reject: (err: unknown) => void }
const failedQueue: QueueItem[] = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue.length = 0
}

// ── Response interceptor: handle 401 → refresh → retry ───────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap NestJS TransformInterceptor envelope: { success, data, timestamp } → data
    if (
      response.data !== null &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (!_refreshToken) {
      _onLogout?.()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      })
        .then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`
          }
          return apiClient(originalRequest)
        })
        .catch(Promise.reject.bind(Promise))
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, undefined, {
        headers: { Authorization: `Bearer ${_refreshToken}` },
      })

      const newAccess: string = data.accessToken
      const newRefresh: string = data.refreshToken ?? _refreshToken

      setClientTokens(newAccess, newRefresh)

      // Persist to localStorage so authStore can re-hydrate
      const stored = localStorage.getItem('techsstore-auth')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as { state?: Record<string, unknown> }
          if (parsed.state) {
            parsed.state.accessToken = newAccess
            parsed.state.refreshToken = newRefresh
            localStorage.setItem('techsstore-auth', JSON.stringify(parsed))
          }
        } catch {
          /* ignore */
        }
      }

      processQueue(null, newAccess)

      if (originalRequest.headers) {
        (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccess}`
      }
      return apiClient(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      _onLogout?.()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
