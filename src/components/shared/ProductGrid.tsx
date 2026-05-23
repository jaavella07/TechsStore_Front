import { motion } from 'framer-motion'
import { ProductCard } from '@/components/shared/ProductCard'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const colClasses: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
}

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid gap-4 ${colClasses[columns]}`}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} className="h-full" />
        </motion.div>
      ))}
    </motion.div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
          <div className="aspect-square bg-surface-2" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-surface-2 rounded w-1/3" />
            <div className="h-4 bg-surface-2 rounded w-3/4" />
            <div className="h-4 bg-surface-2 rounded w-1/2" />
            <div className="h-8 bg-surface-2 rounded mt-3" />
          </div>
        </div>
      ))}
    </div>
  )
}
