import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Package, ShoppingBag, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { productsApi } from '@/api/products'
import { ordersApi } from '@/api/orders'
import { usersApi } from '@/api/users'
import { OrderStatusBadge } from '@/components/shared/OrderStatusBadge'
import { ROUTES } from '@/lib/constants'
import { formatCents, formatDate } from '@/lib/utils'

interface StatCardProps {
  icon: typeof Package
  label: string
  value: number | string
  sub?: string
  accent?: boolean
}

function StatCard({ icon: Icon, label, value, sub, accent }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${accent ? 'bg-cyan-dim' : 'bg-surface-2'}`}>
        <Icon className={`size-5 ${accent ? 'text-cyan' : 'text-text-dim'}`} />
      </div>
      <div>
        <p className="text-xs text-text-dim uppercase tracking-wider font-medium">{label}</p>
        <p className="font-display text-2xl font-bold text-text mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-dim mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function AdminDashboardPage() {
  const { data: products } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: () => productsApi.getProducts({ limit: 1, page: 1 }),
  })
  const { data: orders } = useQuery({
    queryKey: ['admin-orders-count'],
    queryFn: () => ordersApi.getOrders({ limit: 1, page: 1 }),
  })
  const { data: users } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => usersApi.getUsers({ limit: 1, page: 1 }),
  })
  const { data: recent } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: () => ordersApi.getOrders({ limit: 6, page: 1 }),
  })

  const totalRevenue =
    recent?.data.reduce((sum, o) => sum + o.totalInCents, 0) ?? 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-text-dim text-sm mt-1">Overview of your store</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Package}    label="Total Products" value={products?.total ?? '—'} accent />
        <StatCard icon={ShoppingBag} label="Total Orders"   value={orders?.total ?? '—'} />
        <StatCard icon={Users}      label="Total Users"    value={users?.total ?? '—'} />
        <StatCard
          icon={TrendingUp}
          label="Recent Revenue"
          value={formatCents(totalRevenue)}
          sub="Last 6 orders"
          accent
        />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Manage Products', to: ROUTES.admin.products, icon: Package },
          { label: 'Manage Orders',  to: ROUTES.admin.orders,   icon: ShoppingBag },
          { label: 'Manage Users',   to: ROUTES.admin.users,    icon: Users },
        ].map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:border-cyan-border transition-colors group"
          >
            <Icon className="size-4 text-text-dim group-hover:text-cyan transition-colors" />
            <span className="text-sm text-text-muted group-hover:text-text transition-colors">{label}</span>
            <ArrowRight className="size-3.5 ml-auto text-text-dim group-hover:text-cyan transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-text">Recent Orders</h2>
          <Link to={ROUTES.admin.orders} className="text-xs text-cyan hover:underline flex items-center gap-1">
            View all <ArrowRight className="size-3" />
          </Link>
        </div>
        {!recent?.data.length ? (
          <p className="text-text-dim text-sm px-5 py-8 text-center">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Order', 'Date', 'Items', 'Total', 'Status'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-text-dim uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recent.data.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3">
                      <Link to={ROUTES.order(order.id)} className="text-sm font-medium text-cyan hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-sm text-text-dim">{formatDate(order.createdAt)}</td>
                    <td className="px-5 py-3 text-sm text-text-muted">{order.items.length}</td>
                    <td className="px-5 py-3 text-sm font-medium text-text">{formatCents(order.totalInCents)}</td>
                    <td className="px-5 py-3"><OrderStatusBadge status={order.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
