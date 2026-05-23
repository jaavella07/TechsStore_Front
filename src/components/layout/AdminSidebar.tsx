import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, Users, Zap } from 'lucide-react'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: ROUTES.admin.root, end: true },
  { label: 'Products',  icon: Package,          to: ROUTES.admin.products },
  { label: 'Orders',    icon: ShoppingBag,      to: ROUTES.admin.orders },
  { label: 'Users',     icon: Users,            to: ROUTES.admin.users },
]

export function AdminSidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-border bg-surface min-h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Zap className="size-4 text-cyan" strokeWidth={2.5} />
          <span className="font-display font-semibold text-sm text-text">Admin Panel</span>
        </div>
      </div>
      <nav className="p-2 space-y-0.5">
        {navItems.map(({ label, icon: Icon, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                isActive
                  ? 'bg-cyan-dim text-cyan'
                  : 'text-text-muted hover:text-text hover:bg-surface-2',
              )
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
