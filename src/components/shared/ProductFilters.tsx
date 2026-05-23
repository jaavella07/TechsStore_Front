import { useState } from 'react'
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react'
import { useCategories } from '@/hooks/useProducts'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Category, ProductFilters as Filters } from '@/types'

interface ProductFiltersProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export function ProductFilters({
  filters,
  onChange,
  onClear,
  isMobileOpen,
  onMobileClose,
}: ProductFiltersProps) {
  const { data: categories = [] } = useCategories()
  const [minInput, setMinInput] = useState(filters.minPrice?.toString() ?? '')
  const [maxInput, setMaxInput] = useState(filters.maxPrice?.toString() ?? '')
  const [brandInput, setBrandInput] = useState(filters.brand ?? '')

  const hasActiveFilters =
    !!filters.categoryId ||
    !!filters.brand ||
    filters.minPrice != null ||
    filters.maxPrice != null

  function applyPrice() {
    onChange({
      minPrice: minInput ? Number(minInput) : undefined,
      maxPrice: maxInput ? Number(maxInput) : undefined,
    })
  }

  function applyBrand() {
    onChange({ brand: brandInput || undefined })
  }

  function clearAll() {
    setMinInput('')
    setMaxInput('')
    setBrandInput('')
    onClear()
  }

  const content = (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-text-muted" />
          <span className="font-display font-semibold text-sm text-text">Filters</span>
        </div>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-xs text-coral hover:text-coral/80 transition-colors flex items-center gap-1">
            <X className="size-3" /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <FilterSection title="Category">
        <ul className="space-y-0.5">
          {categories.map((cat) => (
            <CategoryItem
              key={cat.id}
              category={cat}
              selected={filters.categoryId}
              onSelect={(id) => onChange({ categoryId: id === filters.categoryId ? undefined : id })}
            />
          ))}
        </ul>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minInput}
            onChange={(e) => setMinInput(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            placeholder="Min"
            min={0}
            className="w-full bg-surface-2 border border-border rounded px-2 py-1.5 text-xs text-text placeholder:text-text-dim outline-none focus:border-cyan"
          />
          <span className="text-text-dim text-xs shrink-0">to</span>
          <input
            type="number"
            value={maxInput}
            onChange={(e) => setMaxInput(e.target.value)}
            onBlur={applyPrice}
            onKeyDown={(e) => e.key === 'Enter' && applyPrice()}
            placeholder="Max"
            min={0}
            className="w-full bg-surface-2 border border-border rounded px-2 py-1.5 text-xs text-text placeholder:text-text-dim outline-none focus:border-cyan"
          />
        </div>
        <p className="text-[10px] text-text-dim mt-1.5">Enter price in USD, press Enter to apply</p>
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <input
          type="text"
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          onBlur={applyBrand}
          onKeyDown={(e) => e.key === 'Enter' && applyBrand()}
          placeholder="e.g. Apple, Samsung…"
          className="w-full bg-surface-2 border border-border rounded px-2 py-1.5 text-xs text-text placeholder:text-text-dim outline-none focus:border-cyan"
        />
      </FilterSection>

      {/* Mobile close */}
      {isMobileOpen && (
        <Button variant="outline" size="sm" onClick={onMobileClose} className="mt-2">
          Apply &amp; Close
        </Button>
      )}
    </div>
  )

  // Mobile overlay
  if (isMobileOpen !== undefined) {
    return (
      <>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
            <div className="relative ml-auto w-72 bg-surface border-l border-border h-full overflow-y-auto p-4">
              {content}
            </div>
          </div>
        )}
      </>
    )
  }

  return <div className="w-52 shrink-0">{content}</div>
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-border pb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3"
      >
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{title}</span>
        <ChevronDown className={cn('size-3.5 text-text-dim transition-transform', !open && '-rotate-90')} />
      </button>
      {open && children}
    </div>
  )
}

function CategoryItem({
  category,
  selected,
  onSelect,
}: {
  category: Category
  selected?: string
  onSelect: (id: string) => void
}) {
  const isSelected = category.id === selected
  return (
    <li>
      <button
        onClick={() => onSelect(category.id)}
        className={cn(
          'w-full text-left px-2 py-1 rounded text-xs transition-colors',
          isSelected
            ? 'text-cyan bg-cyan-dim'
            : 'text-text-muted hover:text-text hover:bg-surface-2',
        )}
      >
        {category.name}
      </button>
    </li>
  )
}
