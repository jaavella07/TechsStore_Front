import { cn, formatCents } from '@/lib/utils'

interface PriceDisplayProps {
  finalPriceInCents: number
  originalPriceInCents?: number
  discountPercent?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const textSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' }

export function PriceDisplay({
  finalPriceInCents,
  originalPriceInCents,
  discountPercent,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const hasDiscount = discountPercent && discountPercent > 0

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-display font-semibold text-cyan', textSizes[size])}>
        {formatCents(finalPriceInCents)}
      </span>
      {hasDiscount && originalPriceInCents && (
        <>
          <span className="text-xs text-text-dim line-through">
            {formatCents(originalPriceInCents)}
          </span>
          <span className="text-xs font-medium text-coral bg-coral-dim px-1.5 py-0.5 rounded">
            -{discountPercent}%
          </span>
        </>
      )}
    </div>
  )
}
