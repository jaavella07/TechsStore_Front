// ── Enums ──────────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'CLIENT'

export type OrderStatus =
  | 'PENDING'
  | 'PAID'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

// ── Auth ───────────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse extends AuthTokens {
  user: User
}

// ── User ───────────────────────────────────────────────────────────────────
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface UpdateProfileDto {
  name?: string
  phone?: string
}

// ── Product ────────────────────────────────────────────────────────────────
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  isActive: boolean
  children?: Category[]
}

export interface ProductAttribute {
  id: string
  key: string
  value: string
}

export interface ProductImage {
  id: string
  url: string
  altText?: string
  sortOrder: number
  isPrimary: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  priceInCents: number
  discountPercent: number
  isActive: boolean
  sku?: string
  brand?: string
  category: Category
  attributes: ProductAttribute[]
  images: ProductImage[]
  finalPriceInCents?: number
  priceFormatted?: string
  createdAt: string
  updatedAt: string
}

export interface ProductFilters {
  search?: string
  categoryId?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  sortBy?: string
}

export interface CreateProductDto {
  name: string
  description: string
  priceInCents: number
  discountPercent?: number
  categoryId: string
  brand?: string
  sku?: string
  initialStock?: number
}

export type UpdateProductDto = Partial<CreateProductDto>

// ── Inventory ──────────────────────────────────────────────────────────────
export interface Inventory {
  id: string
  totalStock: number
  reservedStock: number
  lowStockThreshold: number
  availableStock: number
  isLowStock: boolean
  isOutOfStock: boolean
}

export interface AdjustInventoryDto {
  quantity: number
  reason?: string
}

// ── Cart ───────────────────────────────────────────────────────────────────
export interface CartItem {
  id: string
  quantity: number
  priceSnapshotInCents: number
  product: Product
}

export interface Cart {
  id: string
  items: CartItem[]
  totalInCents: number
  isExpired: boolean
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface AddCartItemDto {
  productId: string
  quantity: number
}

export interface UpdateCartItemDto {
  quantity: number
}

// ── Order ──────────────────────────────────────────────────────────────────
export interface ShippingAddress {
  street: string
  city: string
  state: string
  country: string
  zipCode: string
}

export interface OrderItem {
  id: string
  quantity: number
  unitPriceInCents: number
  productNameSnapshot: string
  product?: Product
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  totalInCents: number
  stripeSessionId?: string
  stripePaymentIntentId?: string
  shippingAddress: ShippingAddress
  invoicePdfUrl?: string
  trackingNumber?: string
  items: OrderItem[]
  user?: User
  createdAt: string
  updatedAt: string
}

export interface CreateOrderDto {
  shippingAddress: ShippingAddress
}

export interface OrderFilters {
  page?: number
  limit?: number
  orderNumber?: string
  email?: string
  trackingNumber?: string
  status?: OrderStatus
}

export interface UpdateOrderStatusDto {
  status: OrderStatus
}

// ── Payments ───────────────────────────────────────────────────────────────
export interface CheckoutSessionResponse {
  url: string
  sessionId: string
}

// ── Pagination ─────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ── Agent Chat ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatRequest {
  message: string
  thread_id?: string
}

export interface ChatResponse {
  thread_id: string
  response: string
  intent: string
  recommendations: unknown[]
  order_status?: string
  tracking_number?: string
}
