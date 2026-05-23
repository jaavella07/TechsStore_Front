import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-2 text-text-muted border-border-2',
  success: 'bg-green-dim text-green border-green/20',
  warning: 'bg-amber/10 text-amber border-amber/20',
  error:   'bg-coral-dim text-coral border-coral/20',
  info:    'bg-cyan-dim text-cyan border-cyan-border',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
