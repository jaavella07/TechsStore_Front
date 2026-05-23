import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/api/auth'
import { setClientTokens, setClientLogoutCallback } from '@/api/client'
import type { LoginDto, RegisterDto, User } from '@/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthActions {
  login: (dto: LoginDto) => Promise<void>
  register: (dto: RegisterDto) => Promise<void>
  logout: () => Promise<void>
  setTokens: (access: string, refresh: string, user: User) => void
  clearAuth: () => void
  initClient: () => void
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setTokens: (accessToken, refreshToken, user) => {
        setClientTokens(accessToken, refreshToken)
        set({ accessToken, refreshToken, user, isAuthenticated: true })
      },

      clearAuth: () => {
        setClientTokens(null, null)
        set({ ...initialState })
      },

      // Call once on app mount to wire up the Axios client with persisted tokens
      initClient: () => {
        const { accessToken, refreshToken, clearAuth } = get()
        setClientTokens(accessToken, refreshToken)
        setClientLogoutCallback(clearAuth)
      },

      login: async (dto) => {
        set({ isLoading: true })
        try {
          const data = await authApi.login(dto)
          get().setTokens(data.accessToken, data.refreshToken, data.user)
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (dto) => {
        set({ isLoading: true })
        try {
          const data = await authApi.register(dto)
          get().setTokens(data.accessToken, data.refreshToken, data.user)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Ignore logout API errors — clear local state regardless
        } finally {
          get().clearAuth()
        }
      },
    }),
    {
      name: 'techsstore-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // After localStorage rehydration, sync tokens into the Axios client
        if (state) {
          setClientTokens(state.accessToken, state.refreshToken)
          setClientLogoutCallback(state.clearAuth)
        }
      },
    },
  ),
)
