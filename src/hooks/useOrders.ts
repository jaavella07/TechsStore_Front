import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '@/api/orders'
import type { OrderFilters } from '@/types'

export function useMyOrders(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['my-orders', params],
    queryFn: () => ordersApi.getMyOrders(params),
  })
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => ordersApi.getOrders(filters),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
  })
}
