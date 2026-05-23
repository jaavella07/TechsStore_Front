import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="size-4 text-cyan" strokeWidth={2.5} />
            <span className="font-display font-bold text-text text-sm">
              Techs<span className="text-cyan">Store</span>
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to={ROUTES.home} className="text-xs text-text-dim hover:text-text-muted transition-colors">
              Home
            </Link>
            <Link to={ROUTES.products} className="text-xs text-text-dim hover:text-text-muted transition-colors">
              Products
            </Link>
          </nav>
          <p className="text-xs text-text-dim">© {new Date().getFullYear()} TechsStore</p>
        </div>
      </div>
    </footer>
  )
}
