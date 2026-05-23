import { Navigate } from 'react-router-dom'
import { AnimatedOutlet } from '@/components/ui/PageTransition'
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { ROUTES } from '@/lib/constants'

export function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (isAuthenticated) return <Navigate to={ROUTES.home} replace />

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-bg">
      <Link to={ROUTES.home} className="flex items-center gap-1.5 mb-8">
        <Zap className="size-6 text-cyan" strokeWidth={2.5} />
        <span className="font-display font-bold text-xl text-text">
          Techs<span className="text-cyan">Store</span>
        </span>
      </Link>
      <div className="w-full max-w-md">
        <AnimatedOutlet />
      </div>
    </div>
  )
}
