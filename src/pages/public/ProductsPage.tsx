import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, Package, Search } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import { ProductFilters } from '@/components/shared/ProductFilters'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { ProductFilters as Filters } from '@/types'

const SORT_OPTIONS = [
  { label: 'Newest',        value: ''              },
  { label: 'Price: Low–High', value: 'price_asc'  },
  { label: 'Price: High–Low', value: 'price_desc' },
  { label: 'Name A–Z',      value: 'name_asc'     },
]

const LIMIT = 12

function paramsToFilters(p: URLSearchParams): Filters {
  return {
    search:     p.get('search')     ?? undefined,
    categoryId: p.get('categoryId') ?? undefined,
    brand:      p.get('brand')      ?? undefined,
    minPrice:   p.get('minPrice')   ? Number(p.get('minPrice'))  : undefined,
    maxPrice:   p.get('maxPrice')   ? Number(p.get('maxPrice'))  : undefined,
    page:       p.get('page')       ? Number(p.get('page'))      : 1,
    sortBy:     p.get('sortBy')     ?? undefined,
    limit:      LIMIT,
  }
}

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const isFirstRender = useRef(true)

  const filters = paramsToFilters(searchParams)
  const { data, isLoading, isFetching, isError } = useProducts(filters)

  // Debounce search — skip the initial mount so page params are not cleared
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const id = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        if (searchInput.trim()) {
          next.set('search', searchInput.trim())
        } else {
          next.delete('search')
        }
        next.delete('page')
        return next
      })
    }, 400)
    return () => clearTimeout(id)
  }, [searchInput, setSearchParams])

  const updateFilter = useCallback(
    (patch: Partial<Filters>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.delete('page')
        for (const [k, v] of Object.entries(patch)) {
          if (v == null || v === '') next.delete(k)
          else next.set(k, String(v))
        }
        return next
      })
    },
    [setSearchParams],
  )

  function clearFilters() {
    setSearchInput('')
    setSearchParams({})
  }

  function setPage(p: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(p))
      return next
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0
  const currentPage = filters.page ?? 1

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-text">Productos</h1>
          {data && (
            <p className="text-text-dim text-sm mt-1 flex items-center gap-2">
              {data.total} {data.total === 1 ? 'resultado' : 'resultados'} encontrados
              {isFetching && <span className="size-3 rounded-full border-2 border-cyan border-t-transparent animate-spin inline-block" />}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-text-dim pointer-events-none" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar…"
              className="bg-surface border border-border rounded pl-8 pr-3 py-2 text-sm text-text placeholder:text-text-dim outline-none focus:border-cyan w-48 transition-colors"
            />
          </div>
          {/* Sort */}
          <Select
            options={SORT_OPTIONS}
            value={filters.sortBy ?? ''}
            onChange={(e) => updateFilter({ sortBy: e.target.value || undefined })}
            className="w-40 py-2"
          />
          {/* Mobile filter btn */}
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3 py-2 border border-border rounded text-sm text-text-muted hover:text-text hover:border-cyan-border transition-colors"
          >
            <SlidersHorizontal className="size-4" />
            Filtros
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar — desktop */}
        <div className="hidden lg:block">
          <ProductFilters
            filters={filters}
            onChange={updateFilter}
            onClear={clearFilters}
          />
        </div>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {isLoading && !data && <ProductGridSkeleton count={LIMIT} />}

          {isError && (
            <div className="py-20 text-center border border-dashed border-border rounded-xl">
              <p className="text-coral text-sm">Failed to load products. Please try again.</p>
            </div>
          )}

          {!isLoading && !isError && data?.data.length === 0 && (
            <div className="py-20 text-center border border-dashed border-border rounded-xl">
              <Package className="size-10 mx-auto mb-3 text-text-dim opacity-50" strokeWidth={1} />
              <p className="text-text-dim text-sm">Ningún producto coincide con los filtros.</p>
              <Button variant="ghost" size="sm" className="mt-4" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </div>
          )}

          {!isLoading && !isError && data && data.data.length > 0 && (
            <>
              <ProductGrid products={data.data} columns={3} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                  >
                    ← Prev
                  </Button>

                  <div className="flex items-center gap-1">
                    {buildPageRange(currentPage, totalPages).map((item, i) =>
                      item === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-text-dim text-sm">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(Number(item))}
                          className={`size-8 rounded text-sm font-medium transition-colors ${
                            item === currentPage
                              ? 'bg-cyan text-bg'
                              : 'text-text-muted hover:text-text hover:bg-surface-2'
                          }`}
                        >
                          {item}
                        </button>
                      ),
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setPage(currentPage + 1)}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filters overlay */}
      <ProductFilters
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilters}
        isMobileOpen={mobileFiltersOpen}
        onMobileClose={() => setMobileFiltersOpen(false)}
      />
    </div>
  )
}

function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '…')[] = []
  const addPage = (p: number) => { if (!pages.includes(p)) pages.push(p) }
  const addEllipsis = () => { if (pages[pages.length - 1] !== '…') pages.push('…') }

  addPage(1)
  if (current > 3) addEllipsis()
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) addPage(p)
  if (current < total - 2) addEllipsis()
  addPage(total)

  return pages
}
