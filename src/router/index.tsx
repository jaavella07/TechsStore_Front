import { createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from './PublicLayout'
import { AuthLayout } from './AuthLayout'
import { CustomerLayout } from './CustomerLayout'
import { AdminLayout } from './AdminLayout'
// Public
import { HomePage } from '@/pages/public/HomePage'
import { ProductsPage } from '@/pages/public/ProductsPage'
import { ProductDetailPage } from '@/pages/public/ProductDetailPage'
// Auth
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
// Customer
import { CartPage } from '@/pages/customer/CartPage'
import { OrdersPage } from '@/pages/customer/OrdersPage'
import { OrderDetailPage } from '@/pages/customer/OrderDetailPage'
import { CheckoutSuccessPage } from '@/pages/customer/CheckoutSuccessPage'
import { ProfilePage } from '@/pages/customer/ProfilePage'
// Admin
import { AdminDashboardPage } from '@/pages/admin/DashboardPage'
import { AdminProductsPage } from '@/pages/admin/ProductsAdminPage'
import { AdminOrdersPage } from '@/pages/admin/OrdersAdminPage'
import { AdminUsersPage } from '@/pages/admin/UsersAdminPage'
// 404
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/products', element: <ProductsPage /> },
      { path: '/products/:slug', element: <ProductDetailPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <CustomerLayout />,
    children: [
      { path: '/cart', element: <CartPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderDetailPage /> },
      { path: '/checkout/success', element: <CheckoutSuccessPage /> },
      { path: '/profile', element: <ProfilePage /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: '/admin', element: <AdminDashboardPage /> },
      { path: '/admin/products', element: <AdminProductsPage /> },
      { path: '/admin/orders', element: <AdminOrdersPage /> },
      { path: '/admin/users', element: <AdminUsersPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
