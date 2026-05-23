import { cn } from '@/lib/utils'
import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm text-text-muted font-medium">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full bg-surface border rounded px-3 py-2 text-text text-sm placeholder:text-text-dim',
            'outline-none transition-colors duration-150 resize-vertical min-h-100px',
            'focus:border-cyan focus:ring-1 focus:ring-cyan/20',
            error ? 'border-coral' : 'border-border',
            className,
          )}
          {...props}
        />
        {error && <p className="text-xs text-coral">{error}</p>}
        {hint && !error && <p className="text-xs text-text-dim">{hint}</p>}
      </div>
    )
  },
)
Textarea.displayName = 'Textarea'
