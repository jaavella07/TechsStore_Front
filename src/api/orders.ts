import { apiClient } from './client'
import type {
  CreateOrderDto,
  Order,
  OrderFilters,
  PaginatedResult,
  UpdateOrderStatusDto,
} from '@/types'

export const ordersApi = {
  createOrder: (dto: CreateOrderDto) =>
    apiClient.post<Order>('/orders', dto).then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<Order>(`/orders/${id}`).then((r) => r.data),

  // Customer: own orders via /orders/me
  getMyOrders: (params?: { page?: number; limit?: number }) =>
    apiClient
      .get<PaginatedResult<Order>>('/orders/me', { params })
      .then((r) => r.data),

  // Admin: all orders with filters
  getOrders: (filters?: OrderFilters) =>
    apiClient
      .get<PaginatedResult<Order>>('/orders', { params: filters })
      .then((r) => r.data),

  updateOrderStatus: (id: string, dto: UpdateOrderStatusDto) =>
    apiClient.patch<Order>(`/orders/${id}/status`, dto).then((r) => r.data),
}
