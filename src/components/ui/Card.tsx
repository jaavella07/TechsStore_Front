import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'bordered'
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-lg',
        variant === 'bordered' && 'border border-border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
