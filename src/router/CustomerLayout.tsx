import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore } from '@/stores/cartStore'
import { ROUTES } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/shared/CartDrawer'
import { AnimatedOutlet } from '@/components/ui/PageTransition'

export function CustomerLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const syncCart = useCartStore((s) => s.syncCart)

  useEffect(() => {
    if (isAuthenticated) syncCart()
  }, [isAuthenticated, syncCart])

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
