import { Navigate } from 'react-router-dom'
import { AnimatedOutlet } from '@/components/ui/PageTransition'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/lib/constants'
import { Header } from '@/components/layout/Header'
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export function AdminLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) return <Navigate to={ROUTES.login} replace />
  if (user?.role !== 'ADMIN') return <Navigate to={ROUTES.home} replace />

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-6">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          <AnimatedOutlet />
        </main>
      </div>
    </div>
  )
}
