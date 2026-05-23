export const API_URL = import.meta.env.VITE_API_URL as string
export const AGENT_URL = import.meta.env.VITE_AGENT_URL as string

export const ROUTES = {
  home: '/',
  products: '/products',
  product: (slug: string) => `/products/${slug}`,
  login: '/login',
  register: '/register',
  cart: '/cart',
  orders: '/orders',
  order: (id: string) => `/orders/${id}`,
  checkoutSuccess: '/checkout/success',
  profile: '/profile',
  admin: {
    root: '/admin',
    products: '/admin/products',
    orders: '/admin/orders',
    users: '/admin/users',
  },
} as const
