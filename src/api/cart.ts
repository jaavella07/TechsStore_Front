import { apiClient } from './client'
import type { AddCartItemDto, Cart, UpdateCartItemDto } from '@/types'

export const cartApi = {
  getCart: () => apiClient.get<Cart>('/cart').then((r) => r.data),

  addItem: (dto: AddCartItemDto) =>
    apiClient.post<Cart>('/cart/items', dto).then((r) => r.data),

  updateItem: (itemId: string, dto: UpdateCartItemDto) =>
    apiClient.patch<Cart>(`/cart/items/${itemId}`, dto).then((r) => r.data),

  removeItem: (itemId: string) =>
    apiClient.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data),

  clearCart: () => apiClient.delete<Cart>('/cart').then((r) => r.data),
}
