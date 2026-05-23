import { Badge } from '@/components/ui/Badge'
import type { OrderStatus } from '@/types'

type BadgeVariant = 'default' | 'info' | 'success' | 'warning' | 'error'

const statusConfig: Record<OrderStatus, { label: string; variant: BadgeVariant }> = {
  PENDING:    { label: 'Pending',    variant: 'default' },
  PAID:       { label: 'Paid',       variant: 'info'    },
  PROCESSING: { label: 'Processing', variant: 'info'    },
  SHIPPED:    { label: 'Shipped',    variant: 'warning' },
  DELIVERED:  { label: 'Delivered',  variant: 'success' },
  CANCELLED:  { label: 'Cancelled',  variant: 'error'   },
  REFUNDED:   { label: 'Refunded',   variant: 'error'   },
}

export function OrderStatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant} className={className}>{label}</Badge>
}
