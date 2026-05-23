import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { ordersApi } from '@/api/orders'
import { useUiStore } from '@/stores/uiStore'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { ROUTES } from '@/lib/constants'
import { formatCents, formatDate } from '@/lib/utils'
import type { OrderStatus } from '@/types'

const STATUS_OPTIONS = [
  { label: 'All Statuses',  value: ''            },
  { label: 'Pending',       value: 'PENDING'     },
  { label: 'Paid',          value: 'PAID'        },
  { label: 'Processing',    value: 'PROCESSING'  },
  { label: 'Shipped',       value: 'SHIPPED'     },
  { label: 'Delivered',     value: 'DELIVERED'   },
  { label: 'Cancelled',     value: 'CANCELLED'   },
  { label: 'Refunded',      value: 'REFUNDED'    },
]

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING:    'PAID',
  PAID:       'PROCESSING',
  PROCESSING: 'SHIPPED',
  SHIPPED:    'DELIVERED',
}

export function AdminOrdersPage() {
  const qc = useQueryClient()
  const { toast } = useUiStore()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search, statusFilter],
    queryFn: () =>
      ordersApi.getOrders({
        page, limit: 12,
        orderNumber: search || undefined,
        status:      (statusFilter as OrderStatus) || undefined,
      }),
  })

  const updateMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      ordersApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-orders'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const totalPages = data ? Math.ceil(data.total / 12) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-text">Orders</h1>
        {data && <p className="text-text-dim text-sm mt-1">{data.total} total</p>}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-dim pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by order number…"
            className="w-full bg-surface border border-border rounded pl-8 pr-3 py-2 text-sm text-text placeholder:text-text-dim outline-none focus:border-cyan"
          />
        </div>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="w-44 py-2"
        />
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : !data?.data.length ? (
          <p className="text-text-dim text-sm text-center py-12">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Order', 'Date', 'Customer', 'Total', 'Status', 'Advance to'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-dim uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.data.map((order) => {
                  const next = NEXT_STATUS[order.status]
                  return (
                    <tr key={order.id} className="hover:bg-surface-2 transition-colors">
                      <td className="px-5 py-3">
                        <Link to={ROUTES.order(order.id)} className="text-sm font-medium text-cyan hover:underline">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-sm text-text-dim">{formatDate(order.createdAt)}</td>
                      <td className="px-5 py-3 text-sm text-text-muted">{order.user?.email ?? '—'}</td>
                      <td className="px-5 py-3 text-sm font-medium text-text">{formatCents(order.totalInCents)}</td>
                      <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-5 py-3">
                        {next ? (
                          <Button
                            size="sm"
                            variant="outline"
                            isLoading={updateMut.isPending}
                            onClick={() => updateMut.mutate({ id: order.id, status: next })}
                          >
                            → {next.charAt(0) + next.slice(1).toLowerCase()}
                          </Button>
                        ) : (
                          <span className="text-xs text-text-dim">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</Button>
          <span className="flex items-center px-3 text-sm text-text-muted">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</Button>
        </div>
      )}
    </div>
  )
}
