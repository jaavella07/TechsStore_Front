import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  User,
  X,
  Zap,
} from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useCartStore, selectCartItemCount } from '@/stores/cartStore'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, logout } = useAuthStore()
  const { openDrawer, syncCart } = useCartStore()
  const cartItemCount = useCartStore(selectCartItemCount)

  useEffect(() => {
    if (isAuthenticated) syncCart()
  }, [isAuthenticated, syncCart])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`${ROUTES.products}?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  async function handleLogout() {
    await logout()
    navigate(ROUTES.home)
    setIsUserMenuOpen(false)
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-1.5 text-sm rounded transition-colors',
      isActive ? 'text-cyan bg-cyan-dim' : 'text-text-muted hover:text-text hover:bg-surface-2',
    )

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 h-16">
          {/* Logo */}
          <Link to={ROUTES.home} className="flex items-center gap-1.5 shrink-0">
            <Zap className="size-5 text-cyan" strokeWidth={2.5} />
            <span className="font-display font-bold text-text tracking-tight">
              Techs<span className="text-cyan">Store</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <NavLink to={ROUTES.home} end className={navLinkClass}>Home</NavLink>
            <NavLink to={ROUTES.products} className={navLinkClass}>Products</NavLink>
          </nav>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-dim pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-surface border border-border rounded pl-8 pr-3 py-1.5 text-sm text-text placeholder:text-text-dim outline-none focus:border-cyan transition-colors"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            {isAuthenticated && (
              <button
                onClick={openDrawer}
                aria-label="Open cart"
                className="relative p-2 text-text-muted hover:text-text rounded hover:bg-surface-2 transition-colors"
              >
                <ShoppingCart className="size-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 size-4 bg-cyan text-bg text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded border border-border hover:border-cyan-border transition-colors"
                >
                  <div className="size-6 rounded-full bg-cyan-dim flex items-center justify-center shrink-0">
                    <span className="text-cyan text-xs font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm text-text max-w-80px truncate">
                    {user?.name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    className={cn(
                      'size-3.5 text-text-dim transition-transform duration-150',
                      isUserMenuOpen && 'rotate-180',
                    )}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-surface border border-border rounded-lg shadow-2xl py-1 z-50">
                    <p className="px-3 py-2 text-xs text-text-dim border-b border-border truncate">
                      {user?.email}
                    </p>
                    <Link
                      to={ROUTES.profile}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    >
                      <User className="size-3.5" /> Profile
                    </Link>
                    <Link
                      to={ROUTES.orders}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
                    >
                      <Package className="size-3.5" /> Orders
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to={ROUTES.admin.root}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-cyan hover:bg-cyan-dim transition-colors"
                      >
                        <LayoutDashboard className="size-3.5" /> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-coral hover:bg-coral-dim transition-colors"
                      >
                        <LogOut className="size-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to={ROUTES.login}
                  className="px-3 py-1.5 text-sm text-text-muted hover:text-text transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.register}
                  className="px-3 py-1.5 text-sm bg-cyan text-bg font-semibold rounded hover:opacity-90 transition-opacity"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsMenuOpen((v) => !v)}
              className="md:hidden p-2 text-text-muted hover:text-text rounded hover:bg-surface-2 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            <form onSubmit={handleSearch} className="px-1 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-dim pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full bg-surface border border-border rounded pl-8 pr-3 py-2 text-sm text-text placeholder:text-text-dim outline-none focus:border-cyan"
                />
              </div>
            </form>
            <NavLink
              to={ROUTES.home}
              end
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                cn('block px-3 py-2 text-sm rounded', isActive ? 'text-cyan bg-cyan-dim' : 'text-text-muted')
              }
            >
              Home
            </NavLink>
            <NavLink
              to={ROUTES.products}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                cn('block px-3 py-2 text-sm rounded', isActive ? 'text-cyan bg-cyan-dim' : 'text-text-muted')
              }
            >
              Products
            </NavLink>
            {!isAuthenticated && (
              <div className="flex gap-2 pt-2">
                <Link
                  to={ROUTES.login}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm border border-border rounded text-text-muted"
                >
                  Sign In
                </Link>
                <Link
                  to={ROUTES.register}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex-1 text-center py-2 text-sm bg-cyan text-bg font-semibold rounded"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
