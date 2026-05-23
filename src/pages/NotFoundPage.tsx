import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg px-4">
      <Zap className="size-12 text-cyan mb-6" strokeWidth={1.5} />
      <h1 className="font-display text-6xl font-bold text-text mb-2">404</h1>
      <p className="text-text-muted mb-8">This page doesn't exist.</p>
      <Link to={ROUTES.home}>
        <Button>Back to Home</Button>
      </Link>
    </div>
  )
}
