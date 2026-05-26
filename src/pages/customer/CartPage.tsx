import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ShoppingCart, Minus, Plus, X, ArrowRight, MapPin } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useUiStore } from '@/stores/uiStore'
import { ordersApi } from '@/api/orders'
import { paymentsApi } from '@/api/payments'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { ROUTES } from '@/lib/constants'
import { formatCents } from '@/lib/utils'

const shippingSchema = z.object({
  street:  z.string().min(1, { message: 'Street is required' }),
  city:    z.string().min(1, { message: 'City is required' }),
  state:   z.string().min(1, { message: 'State is required' }),
  country: z.string().min(1, { message: 'Country is required' }),
  zipCode: z.string().min(1, { message: 'ZIP code is required' }),
})
type ShippingForm = z.infer<typeof shippingSchema>

export function CartPage() {
  const { cart, isLoading, updateItem, removeItem, clearCart } = useCartStore()
  const { toast } = useUiStore()
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)

  useEffect(() => {
    if (redirectUrl) window.location.href = redirectUrl
  }, [redirectUrl])

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingForm>({
    resolver: zodResolver(shippingSchema),
  })

  const items = cart?.items ?? []
  const isEmpty = !isLoading && items.length === 0
  const subtotalInCents = items.reduce(
    (sum, item) => sum + item.priceSnapshotInCents * item.quantity,
    0,
  )

  async function handleCheckout(shippingAddress: ShippingForm) {
    setCheckoutLoading(true)
    try {
      const order = await ordersApi.createOrder({ shippingAddress })
      const session = await paymentsApi.createCheckoutSession(order.id)
      setRedirectUrl(session.url)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Checkout failed. Please try again.'
      toast.error(msg)
      setCheckoutLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-text mb-8">Your Cart</h1>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <ShoppingCart className="size-16 text-text-dim" strokeWidth={1} />
          <p className="text-text-muted">Your cart is empty.</p>
          <Link to={ROUTES.products}>
            <Button leftIcon={<ArrowRight className="size-4" />}>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Items ─────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const img = item.product.images.find((i) => i.isPrimary) ?? item.product.images[0]
              return (
                <div
                  key={item.id}
                  className="flex gap-4 bg-surface border border-border rounded-xl p-4"
                >
                  {/* Image */}
                  <Link to={ROUTES.product(item.product.slug)} className="shrink-0">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText ?? item.product.name}
                        className="size-20 rounded-lg object-cover bg-surface-2"
                      />
                    ) : (
                      <div className="size-20 rounded-lg bg-surface-2" />
                    )}
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={ROUTES.product(item.product.slug)}>
                      <p className="text-sm font-medium text-text hover:text-cyan transition-colors truncate">
                        {item.product.name}
                      </p>
                    </Link>
                    {item.product.brand && (
                      <p className="text-xs text-text-dim mt-0.5">{item.product.brand}</p>
                    )}
                    <PriceDisplay
                      finalPriceInCents={item.priceSnapshotInCents}
                      size="sm"
                      className="mt-1"
                    />
                  </div>

                  {/* Qty + Remove */}
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-text-dim hover:text-coral transition-colors"
                      aria-label="Remove item"
                    >
                      <X className="size-4" />
                    </button>
                    <div className="flex items-center border border-border rounded overflow-hidden">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateItem(item.id, { quantity: item.quantity - 1 })
                            : removeItem(item.id)
                        }
                        className="px-2 py-1 text-text-dim hover:text-text hover:bg-surface-2 transition-colors"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="px-3 py-1 text-sm text-text border-x border-border min-w-2rem text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}
                        className="px-2 py-1 text-text-dim hover:text-text hover:bg-surface-2 transition-colors"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-text">
                      {formatCents(item.priceSnapshotInCents * item.quantity)}
                    </p>
                  </div>
                </div>
              )
            })}

            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart()}
                className="text-text-dim hover:text-coral"
              >
                Clear cart
              </Button>
            </div>
          </div>

          {/* ── Summary + Shipping ────────────────────────── */}
          <div className="space-y-4">
            {/* Order summary */}
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <h2 className="font-display font-semibold text-text text-base">Order Summary</h2>
              <div className="space-y-2 text-sm">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between gap-2">
                    <span className="text-text-dim truncate max-w-160px">
                      {item.product.name} ×{item.quantity}
                    </span>
                    <span className="text-text shrink-0">
                      {formatCents(item.priceSnapshotInCents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="text-text-muted text-sm">Subtotal</span>
                <PriceDisplay finalPriceInCents={subtotalInCents} size="md" />
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-dim">Shipping</span>
                <span className="text-green text-xs font-medium">Calculated at checkout</span>
              </div>
            </div>

            {/* Shipping address */}
            <form
              onSubmit={handleSubmit(handleCheckout)}
              className="bg-surface border border-border rounded-xl p-5 space-y-4"
            >
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-cyan" />
                <h2 className="font-display font-semibold text-text text-base">Shipping Address</h2>
              </div>

              <Input
                label="Street"
                placeholder="123 Main St"
                error={errors.street?.message}
                {...register('street')}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="City"
                  placeholder="New York"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="State"
                  placeholder="NY"
                  error={errors.state?.message}
                  {...register('state')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Country"
                  placeholder="US"
                  error={errors.country?.message}
                  {...register('country')}
                />
                <Input
                  label="ZIP Code"
                  placeholder="10001"
                  error={errors.zipCode?.message}
                  {...register('zipCode')}
                />
              </div>

              <Button
                type="submit"
                isLoading={checkoutLoading}
                className="w-full"
                rightIcon={<ArrowRight className="size-4" />}
              >
                Proceed to Payment
              </Button>
              <p className="text-[10px] text-text-dim text-center">
                Secure checkout via Stripe. You won't be charged yet.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
