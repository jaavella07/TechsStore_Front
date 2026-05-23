import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, ImageOff } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { Badge } from '@/components/ui/Badge'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const { toast } = useUiStore()

  const primaryImage =
    product.images.find((img) => img.isPrimary) ?? product.images[0]
  const hasDiscount = product.discountPercent > 0
  const finalPriceInCents = Math.round(
    product.priceInCents * (1 - (product.discountPercent ?? 0) / 100),
  )

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      window.location.href = ROUTES.login
      return
    }
    setIsAdding(true)
    try {
      await addItem({ productId: product.id, quantity: 1 })
      toast.success(`${product.name} added to cart`)
    } catch {
      toast.error('Could not add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group flex flex-col bg-surface border border-border rounded-xl overflow-hidden',
        'hover:border-cyan-border transition-colors duration-200',
        className,
      )}
    >
      {/* Image */}
      <Link to={ROUTES.product(product.slug)} className="relative block overflow-hidden aspect-square bg-surface-2">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-dim">
            <ImageOff className="size-10" strokeWidth={1} />
          </div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-coral text-bg text-[10px] font-bold px-1.5 py-0.5 rounded">
            -{product.discountPercent}%
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <Link to={ROUTES.product(product.slug)}>
          {product.brand && (
            <span className="text-[10px] text-text-dim uppercase tracking-widest font-medium">
              {product.brand}
            </span>
          )}
          <h3 className="text-sm font-medium text-text leading-snug mt-0.5 line-clamp-2 group-hover:text-cyan transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="default" className="text-[10px]">
            {product.category.name}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <PriceDisplay
            finalPriceInCents={finalPriceInCents}
            originalPriceInCents={hasDiscount ? product.priceInCents : undefined}
            discountPercent={hasDiscount ? product.discountPercent : undefined}
            size="sm"
          />
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            aria-label="Add to cart"
            className={cn(
              'p-2 rounded border border-border text-text-dim',
              'hover:border-cyan hover:text-cyan hover:bg-cyan-dim',
              'disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150',
            )}
          >
            {isAdding ? (
              <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin block" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
