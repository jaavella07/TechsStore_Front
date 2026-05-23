import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useUiStore, type ToastType } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles: Record<ToastType, string> = {
  success: 'border-green/30',
  error: 'border-coral/30',
  info: 'border-cyan-border',
  warning: 'border-amber/30',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-green',
  error: 'text-coral',
  info: 'text-cyan',
  warning: 'text-amber',
}

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()

  return (
    <div className="fixed bottom-4 right-4 z-100 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type]
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className={cn(
                'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg',
                'bg-surface border shadow-xl min-w-64 max-w-xs',
                styles[toast.type],
              )}
            >
              <Icon className={cn('size-4 mt-0.5 shrink-0', iconColors[toast.type])} />
              <p className="text-sm text-text flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-text-dim hover:text-text transition-colors shrink-0"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
