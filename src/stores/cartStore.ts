import { create } from 'zustand'
import { cartApi } from '@/api/cart'
import type { AddCartItemDto, Cart, UpdateCartItemDto } from '@/types'

interface CartState {
  cart: Cart | null
  isDrawerOpen: boolean
  isLoading: boolean
  error: string | null
}

interface CartActions {
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void
  syncCart: () => Promise<void>
  addItem: (dto: AddCartItemDto) => Promise<void>
  updateItem: (itemId: string, dto: UpdateCartItemDto) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  resetCart: () => void
}

export const useCartStore = create<CartState & CartActions>()((set, get) => ({
  cart: null,
  isDrawerOpen: false,
  isLoading: true,
  error: null,

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
  resetCart: () => set({ cart: null, isDrawerOpen: false, error: null }),

  syncCart: async () => {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartApi.getCart()
      set({ cart })
    } catch {
      set({ error: 'Could not load cart' })
    } finally {
      set({ isLoading: false })
    }
  },

  addItem: async (dto) => {
    set({ isLoading: true, error: null })
    try {
      const cart = await cartApi.addItem(dto)
      set({ cart, isDrawerOpen: true })
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not add item'
      set({ error: msg })
      throw err
    } finally {
      set({ isLoading: false })
    }
  },

  updateItem: async (itemId, dto) => {
    const prev = get().cart
    set({ isLoading: true, error: null })
    try {
      const cart = await cartApi.updateItem(itemId, dto)
      set({ cart })
    } catch {
      set({ cart: prev, error: 'Could not update item' })
    } finally {
      set({ isLoading: false })
    }
  },

  removeItem: async (itemId) => {
    const prev = get().cart
    // Optimistic: remove item locally before the API call
    set((s) => ({
      cart: s.cart
        ? { ...s.cart, items: s.cart.items.filter((i) => i.id !== itemId) }
        : null,
    }))
    try {
      const cart = await cartApi.removeItem(itemId)
      set({ cart })
    } catch {
      set({ cart: prev, error: 'Could not remove item' })
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null })
    try {
      await cartApi.clearCart()
      set({ cart: null })
    } catch {
      set({ error: 'Could not clear cart' })
    } finally {
      set({ isLoading: false })
    }
  },
}))

// Derived selector: total number of items in cart
export const selectCartItemCount = (s: CartState) =>
  s.cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0

export const selectCartTotal = (s: CartState) =>
  s.cart?.items?.reduce((sum, i) => sum + i.priceSnapshotInCents * i.quantity, 0) ?? 0
