import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, MapPin, Package } from 'lucide-react'
import { useOrder } from '@/hooks/useOrders'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'
import { cn, formatCents, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const TIMELINE: OrderStatus[] = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const TERMINAL_BAD: OrderStatus[] = ['CANCELLED', 'REFUNDED']

export function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const { data: order, isLoading, isError } = useOrder(id)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="text-coral mb-4">Order not found.</p>
        <Link to={ROUTES.orders}>
          <Button variant="outline" leftIcon={<ArrowLeft className="size-4" />}>
            Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  const isTerminal = TERMINAL_BAD.includes(order.status)
  const currentIdx = TIMELINE.indexOf(order.status as (typeof TIMELINE)[number])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link
        to={ROUTES.orders}
        className="inline-flex items-center gap-2 text-sm text-text-dim hover:text-text-muted mb-6 transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to Orders
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">{order.orderNumber}</h1>
          <p className="text-text-dim text-sm mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} className="self-start sm:self-auto text-sm px-3 py-1" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ──────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status timeline */}
          {!isTerminal && (
            <div className="bg-surface border border-border rounded-xl p-5">
              <h2 className="font-display font-semibold text-text text-sm mb-5">Order Progress</h2>
              <div className="flex items-start">
                {TIMELINE.map((status, i) => {
                  const done = i <= currentIdx
                  const current = i === currentIdx
                  return (
                    <div key={status} className="flex-1 flex flex-col items-center gap-1.5 relative">
                      {/* connector line left */}
                      {i > 0 && (
                        <div
                          className={cn(
                            'absolute top-3.5 right-1/2 left-0 h-0.5',
                            done ? 'bg-cyan' : 'bg-border',
                          )}
                        />
                      )}
                      {/* connector line right */}
                      {i < TIMELINE.length - 1 && (
                        <div
                          className={cn(
                            'absolute top-3.5 left-1/2 right-0 h-0.5',
                            done && i < currentIdx ? 'bg-cyan' : 'bg-border',
                          )}
                        />
                      )}
                      {/* dot */}
                      <div
                        className={cn(
                          'relative z-10 size-7 rounded-full border-2 flex items-center justify-center transition-colors',
                          done
                            ? 'border-cyan bg-cyan-dim'
                            : 'border-border bg-surface',
                          current && 'ring-2 ring-cyan/30 ring-offset-2 ring-offset-surface',
                        )}
                      >
                        {done && <Check className="size-3 text-cyan" strokeWidth={2.5} />}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-medium text-center leading-tight',
                          done ? 'text-text-muted' : 'text-text-dim',
                          current && 'text-cyan',
                        )}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border">
              <h2 className="font-display font-semibold text-text text-sm">
                Items ({order.items.length})
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {order.items.map((item) => {
                const img = item.product?.images.find((i) => i.isPrimary) ?? item.product?.images[0]
                return (
                  <li key={item.id} className="flex items-center gap-4 px-5 py-4">
                    {img ? (
                      <img
                        src={img.url}
                        alt={img.altText ?? ''}
                        className="size-14 rounded-lg object-cover bg-surface-2 shrink-0"
                      />
                    ) : (
                      <div className="size-14 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                        <Package className="size-5 text-text-dim" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {item.productNameSnapshot}
                      </p>
                      <p className="text-xs text-text-dim mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-text">
                        {formatCents(item.unitPriceInCents * item.quantity)}
                      </p>
                      <p className="text-xs text-text-dim">{formatCents(item.unitPriceInCents)} each</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────── */}
        <div className="space-y-4">
          {/* Total */}
          <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
            <h2 className="font-display font-semibold text-text text-sm">Summary</h2>
            <div className="space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="text-text-dim truncate max-w-35">
                    {item.productNameSnapshot} ×{item.quantity}
                  </span>
                  <span className="text-text shrink-0">
                    {formatCents(item.unitPriceInCents * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-3 flex justify-between items-center">
              <span className="text-text-muted text-sm font-medium">Total</span>
              <PriceDisplay finalPriceInCents={order.totalInCents} size="md" />
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-text-dim" />
                <h2 className="font-display font-semibold text-text text-sm">Shipping Address</h2>
              </div>
              <address className="not-italic text-sm text-text-muted space-y-0.5">
                <p>{order.shippingAddress.street}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.zipCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
              {order.trackingNumber && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-text-dim">Tracking Number</p>
                  <p className="text-sm font-mono text-text mt-0.5">{order.trackingNumber}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
