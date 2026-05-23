import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  ImageOff,
  Tag,
  Layers,
} from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { ROUTES } from '@/lib/constants'

export function ProductDetailPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { data: product, isLoading, isError } = useProduct(slug)

  const [selectedIdx, setSelectedIdx] = useState(0)
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const { addItem } = useCartStore()
  const { toast } = useUiStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-coral mb-4">Product not found.</p>
        <Link to={ROUTES.products}>
          <Button variant="outline" leftIcon={<ArrowLeft className="size-4" />}>
            Back to Products
          </Button>
        </Link>
      </div>
    )
  }

  const images = product.images.sort((a, b) => {
    if (a.isPrimary) return -1
    if (b.isPrimary) return 1
    return a.sortOrder - b.sortOrder
  })
  const currentImage = images[selectedIdx]
  const hasDiscount = product.discountPercent > 0
  const finalPriceInCents = Math.round(
    product.priceInCents * (1 - (product.discountPercent ?? 0) / 100),
  )

  async function handleAddToCart() {
    if (!isAuthenticated) {
      navigate(ROUTES.login)
      return
    }
    setIsAdding(true)
    try {
      await addItem({ productId: product!.id, quantity: qty })
      toast.success(`${qty}× ${product!.name} added to cart`)
    } catch {
      toast.error('Could not add to cart')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-text-dim mb-8">
        <Link to={ROUTES.home} className="hover:text-text-muted transition-colors">Home</Link>
        <span>/</span>
        <Link to={ROUTES.products} className="hover:text-text-muted transition-colors">Products</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`${ROUTES.products}?categoryId=${product.category.id}`}
              className="hover:text-text-muted transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-text-muted truncate max-w-50">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* ── Image gallery ──────────────────────────────── */}
        <div className="space-y-3">
          {/* Main image */}
          <div className="relative overflow-hidden rounded-2xl bg-surface-2 border border-border aspect-square">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {currentImage ? (
                  <img
                    src={currentImage.url}
                    alt={currentImage.altText ?? product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-dim">
                    <ImageOff className="size-16" strokeWidth={1} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-coral text-bg text-xs font-bold px-2 py-1 rounded">
                -{product.discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedIdx(i)}
                  className={`shrink-0 size-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === selectedIdx ? 'border-cyan' : 'border-border hover:border-border-2'
                  }`}
                >
                  <img src={img.url} alt={img.altText ?? ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product info ───────────────────────────────── */}
        <div className="flex flex-col">
          {/* Brand + category */}
          <div className="flex items-center gap-2 mb-3">
            {product.brand && (
              <span className="text-xs text-text-dim uppercase tracking-widest font-medium">
                {product.brand}
              </span>
            )}
            {product.brand && <span className="text-border-2">·</span>}
            <Badge variant="default">
              <Tag className="size-2.5" />
              {product.category.name}
            </Badge>
          </div>

          <h1 className="font-display text-3xl font-bold text-text leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="mb-5">
            <PriceDisplay
              finalPriceInCents={finalPriceInCents}
              originalPriceInCents={hasDiscount ? product.priceInCents : undefined}
              discountPercent={hasDiscount ? product.discountPercent : undefined}
              size="lg"
            />
          </div>

          {/* Description */}
          <p className="text-text-muted text-sm leading-relaxed mb-6 border-t border-border pt-5">
            {product.description}
          </p>

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-text-dim mb-5">
              SKU: <span className="font-mono text-text-muted">{product.sku}</span>
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center border border-border rounded overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="size-3.5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-text min-w-12 text-center border-x border-border">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2.5 text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="size-3.5" />
              </button>
            </div>

            <Button
              size="lg"
              isLoading={isAdding}
              onClick={handleAddToCart}
              leftIcon={<ShoppingCart className="size-4" />}
              className="flex-1"
            >
              Add to Cart
            </Button>
          </div>

          {/* Attributes */}
          {product.attributes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="border border-border rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-2 border-b border-border">
                <Layers className="size-3.5 text-text-dim" />
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Specifications
                </span>
              </div>
              <table className="w-full">
                <tbody>
                  {product.attributes.map((attr, i) => (
                    <tr
                      key={attr.id}
                      className={i % 2 === 0 ? 'bg-surface' : 'bg-surface-2'}
                    >
                      <td className="px-4 py-2.5 text-xs text-text-dim font-medium w-1/3">
                        {attr.key}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-text">{attr.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}

          {/* Back link */}
          <div className="mt-8 pt-5 border-t border-border">
            <Link
              to={ROUTES.products}
              className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text-muted transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              Back to Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
