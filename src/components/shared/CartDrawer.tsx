import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'

export function CartDrawer() {
  const { cart, isDrawerOpen, isLoading, closeDrawer, removeItem } = useCartStore()

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeDrawer}
          />
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-80 bg-surface border-l border-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-cyan" />
                <h2 className="font-display font-semibold text-text">Your Cart</h2>
              </div>
              <button onClick={closeDrawer} className="text-text-dim hover:text-text transition-colors p-1 rounded">
                <X className="size-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center h-32">
                  <Spinner />
                </div>
              )}

              {!isLoading && (!cart || cart.items.length === 0) && (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                  <ShoppingCart className="size-10 text-text-dim" strokeWidth={1} />
                  <p className="text-text-muted text-sm">Your cart is empty</p>
                  <Button variant="outline" size="sm" onClick={closeDrawer}>
                    Continue Shopping
                  </Button>
                </div>
              )}

              {!isLoading && cart && cart.items.length > 0 && (
                <ul className="p-4 space-y-3">
                  {cart.items.map((item) => {
                    const img = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0]
                    return (
                      <li key={item.id} className="flex gap-3 py-3 border-b border-border last:border-0">
                        {img && (
                          <img
                            src={img.url}
                            alt={img.altText ?? item.product.name}
                            className="size-14 rounded object-cover bg-surface-2 shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text truncate">{item.product.name}</p>
                          <p className="text-xs text-text-dim mt-0.5">Qty: {item.quantity}</p>
                          <PriceDisplay
                            finalPriceInCents={item.priceSnapshotInCents * item.quantity}
                            size="sm"
                            className="mt-1"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-text-dim hover:text-coral transition-colors self-start mt-0.5"
                          aria-label="Remove item"
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart && cart.items.length > 0 && (
              <div className="p-4 border-t border-border space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Subtotal</span>
                  <PriceDisplay finalPriceInCents={cart.totalInCents} />
                </div>
                <Link to={ROUTES.cart} onClick={closeDrawer}>
                  <Button className="w-full">Proceed to Checkout</Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
