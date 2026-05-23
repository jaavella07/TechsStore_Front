import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

export function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { resetCart } = useCartStore()

  useEffect(() => {
    resetCart()
  }, [resetCart])

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="size-20 bg-green-dim border border-green/20 rounded-full flex items-center justify-center mx-auto mb-6"
      >
        <CheckCircle className="size-10 text-green" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold text-text mb-3">Order Confirmed!</h1>
        <p className="text-text-muted mb-2">
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>
        {sessionId && (
          <p className="text-xs text-text-dim font-mono bg-surface-2 border border-border rounded px-3 py-1.5 inline-block mb-6">
            Session: {sessionId.slice(0, 24)}…
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link to={ROUTES.orders}>
            <Button leftIcon={<Package className="size-4" />}>
              View My Orders
            </Button>
          </Link>
          <Link to={ROUTES.products}>
            <Button variant="outline" rightIcon={<ArrowRight className="size-4" />}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
