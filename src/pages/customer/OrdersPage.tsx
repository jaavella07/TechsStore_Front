import { Link } from 'react-router-dom'
import { Package, ArrowRight } from 'lucide-react'
import { useOrders } from '@/hooks/useOrders'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'
import { formatCents, formatDate } from '@/lib/utils'

export function OrdersPage() {
  const { data, isLoading, isError } = useOrders({ limit: 20, page: 1 })

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-3xl font-bold text-text mb-8">My Orders</h1>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="py-16 text-center border border-dashed border-border rounded-xl">
          <p className="text-coral text-sm">Failed to load orders.</p>
        </div>
      )}

      {!isLoading && !isError && (!data?.data || data.data.length === 0) && (
        <div className="flex flex-col items-center py-24 gap-4">
          <Package className="size-14 text-text-dim" strokeWidth={1} />
          <p className="text-text-muted">No orders yet.</p>
          <Link to={ROUTES.products}>
            <Button>Start Shopping</Button>
          </Link>
        </div>
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((order) => (
            <Link
              key={order.id}
              to={ROUTES.order(order.id)}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border hover:border-cyan-border rounded-xl p-5 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-surface-2 flex items-center justify-center shrink-0">
                  <Package className="size-5 text-text-dim group-hover:text-cyan transition-colors" />
                </div>
                <div>
                  <p className="font-display font-semibold text-text text-sm">
                    {order.orderNumber}
                  </p>
                  <p className="text-xs text-text-dim mt-0.5">{formatDate(order.createdAt)}</p>
                  <p className="text-xs text-text-dim mt-0.5">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1.5 pl-14 sm:pl-0">
                <OrderStatusBadge status={order.status} />
                <p className="font-display font-semibold text-text">
                  {formatCents(order.totalInCents)}
                </p>
                <ArrowRight className="size-4 text-text-dim group-hover:text-cyan transition-colors hidden sm:block" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
