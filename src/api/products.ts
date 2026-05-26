import { apiClient } from './client'
import type {
  Category,
  CreateProductDto,
  Inventory,
  AdjustInventoryDto,
  PaginatedResult,
  Product,
  ProductFilters,
  UpdateProductDto,
} from '@/types'

export const productsApi = {
  getProducts: (filters?: ProductFilters) => {
    const { page = 1, limit = 12, ...rest } = filters ?? {}
    const offset = (page - 1) * limit
    return apiClient
      .get<PaginatedResult<Product>>('/products', { params: { ...rest, limit, offset } })
      .then((r) => r.data)
  },

  getProduct: (id: string) =>
    apiClient.get<Product>(`/products/${id}`).then((r) => r.data),

  getProductBySlug: (slug: string) =>
    apiClient.get<Product>(`/products/slug/${slug}`).then((r) => r.data),

  getCategories: () =>
    apiClient.get<Category[]>('/products/categories').then((r) => r.data),

  // Admin
  createProduct: (dto: CreateProductDto) =>
    apiClient.post<Product>('/products', dto).then((r) => r.data),

  updateProduct: (id: string, dto: UpdateProductDto) =>
    apiClient.patch<Product>(`/products/${id}`, dto).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`).then((r) => r.data),

  getInventory: (id: string) =>
    apiClient.get<Inventory>(`/products/${id}/inventory`).then((r) => r.data),

  adjustInventory: (id: string, dto: AdjustInventoryDto) =>
    apiClient
      .patch<Inventory>(`/products/${id}/inventory/adjust`, dto)
      .then((r) => r.data),

  createCategory: (dto: { name: string; description?: string; imageUrl?: string }) =>
    apiClient.post<Category>('/products/categories', dto).then((r) => r.data),
}
