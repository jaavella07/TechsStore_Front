import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

interface UiState {
  toasts: Toast[]
}

interface UiActions {
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
  toast: {
    success: (message: string, duration?: number) => void
    error: (message: string, duration?: number) => void
    info: (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
  }
}

export const useUiStore = create<UiState & UiActions>()((set, get) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 4000) => {
    const id = crypto.randomUUID()
    set((s) => ({ toasts: [...s.toasts, { id, message, type, duration }] }))
    setTimeout(() => get().removeToast(id), duration)
  },

  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  toast: {
    success: (message, duration) => get().addToast(message, 'success', duration),
    error: (message, duration) => get().addToast(message, 'error', duration),
    info: (message, duration) => get().addToast(message, 'info', duration),
    warning: (message, duration) => get().addToast(message, 'warning', duration),
  },
}))
