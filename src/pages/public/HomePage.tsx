import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Package, ShieldCheck, Truck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import { PromoModal } from '@/components/shared/PromoModal'
import { useProducts, useCategories } from '@/hooks/useProducts'
import { ROUTES } from '@/lib/constants'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const perks = [
  { icon: Truck,        label: 'Envío Gratis',        desc: 'En pedidos mayores a $50' },
  { icon: ShieldCheck,  label: 'Garantía de 2 Años',  desc: 'En todos los productos'   },
  { icon: Package,      label: 'Devoluciones Fáciles', desc: 'Plazo de 30 días'        },
]

export function HomePage() {
  const [promoOpen, setPromoOpen] = useState(false)
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 8, page: 1 })
  const { data: categories = [] } = useCategories()

  return (
    <div>
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[72vh] flex items-center">
        {/* dot-grid background */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle, var(--color-border-2) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* gradient fade left→right */}
        <div className="absolute inset-0 bg-linear-to-r from-bg via-bg/75 to-transparent" />

        {/* decorative bolt */}
        <motion.div
          animate={{ y: [-12, 12, -12] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block opacity-[0.06] pointer-events-none"
        >
          <Zap className="w-120 h-120 text-cyan" strokeWidth={0.4} />
        </motion.div>

        {/* horizontal accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-cyan-border to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-2xl">
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-cyan" />
              <span className="text-cyan text-xs font-semibold tracking-[0.2em] uppercase">
                Electrónica de primera calidad
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display text-5xl sm:text-7xl font-bold leading-none tracking-tight mb-6"
            >
              EQUIPOS<br />
              <span className="text-cyan">TECNOLÓGICOS</span> DE PRÓXIMA GENERACIÓN
            </motion.h1>

            <motion.p variants={fadeUp} className="text-text-muted text-lg max-w-md mb-8 leading-relaxed">
              Electrónica de alta gama diseñada para profesionales y aficionados.
              Rendimiento sin concesiones: fabricada para durar.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <Link to={ROUTES.products}>
                <Button size="lg" rightIcon={<ArrowRight className="size-4" />}>
                  Compra ahora
                </Button>
              </Link>
              <Link to={ROUTES.products}>
                <Button size="lg" variant="outline">
                  Explorar categorías
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Perks bar ─────────────────────────────────────────────── */}
      <div className="border-y border-border bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {perks.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 py-4 px-6">
                <div className="size-9 rounded-lg bg-cyan-dim flex items-center justify-center shrink-0">
                  <Icon className="size-4 text-cyan" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{label}</p>
                  <p className="text-xs text-text-dim">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Categories marquee ────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <SectionHeader title="Explorar por Categoría" />
          <div className="relative overflow-hidden rounded-xl mt-8">
            {/* edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10 bg-linear-to-r from-bg to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10 bg-linear-to-l from-bg to-transparent" />

            {/* duplicate list so -50% translation creates a seamless loop */}
            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="flex gap-3 w-max"
            >
              {[...categories, ...categories].map((cat, i) => (
                <Link
                  key={`${cat.id}-${i}`}
                  to={`${ROUTES.products}?categoryId=${cat.id}`}
                  className="group flex flex-col items-center gap-2 p-4 w-32 shrink-0 bg-surface border border-border rounded-xl hover:border-cyan-border hover:bg-surface-2 transition-all duration-200 text-center"
                >
                  <div className="size-10 rounded-lg bg-surface-2 group-hover:bg-cyan-dim flex items-center justify-center transition-colors">
                    <Package className="size-5 text-text-dim group-hover:text-cyan transition-colors" />
                  </div>
                  <span className="text-xs font-medium text-text-muted group-hover:text-text transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <SectionHeader title="Productos Destacados" />
          <Link
            to={ROUTES.products}
            className="text-sm text-cyan hover:underline flex items-center gap-1"
          >
            Ver todo <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <ProductGridSkeleton count={8} />
        ) : productsData?.data && productsData.data.length > 0 ? (
          <ProductGrid products={productsData.data} columns={4} />
        ) : (
          <EmptyState message="No products available yet." />
        )}
      </section>

      <PromoModal isOpen={promoOpen} onClose={() => setPromoOpen(false)} />

      {/* ── Promo banner ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' as const }}
          className="relative overflow-hidden rounded-2xl bg-surface border border-cyan-border"
        >
          {/* Animated glow orbs */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-24 -left-24 w-72 h-72 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--color-cyan) 0%, transparent 70%)' }}
          />

          {/* Dot grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--color-cyan) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Content — two-column on desktop */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12 items-center">
            {/* Left: text */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block h-px w-6 bg-cyan" />
                <span className="text-xs text-cyan font-semibold tracking-[0.2em] uppercase">
                  Tiempo Limitado
                </span>
              </div>

              <h2 className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-4">
                Envío gratis<br />
                en pedidos{' '}
                <span className="text-cyan">mayores<br />a $50.000 COP</span>
              </h2>

              <p className="text-text-muted text-base leading-relaxed mb-6 max-w-sm">
                Aplica automáticamente en el checkout. También puedes usar el código{' '}
                <span className="text-text font-mono bg-surface-2 border border-border px-2 py-0.5 rounded text-sm">
                  TECH50
                </span>{' '}
                al finalizar la compra.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  rightIcon={<ArrowRight className="size-4" />}
                  onClick={() => setPromoOpen(true)}
                >
                  Ver la oferta
                </Button>
                <Link to={ROUTES.products} className="text-sm text-cyan hover:underline flex items-center gap-1">
                  Ir a la tienda <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: promo highlights */}
            <div className="flex flex-col gap-3">
              {[
                { pct: '35%', label: 'de descuento', sub: 'En compras mayores a $250.000 COP' },
                { pct: '1 mes', label: 'TechsCare gratis', sub: 'Soporte prioritario 24/7 con tu compra' },
                { pct: '$0', label: 'costo de envío', sub: 'En pedidos mayores a $50.000 COP · Código TECH50' },
              ].map(({ pct, label, sub }) => (
                <div
                  key={label}
                  className="flex items-center gap-4 p-4 rounded-xl bg-surface-2 border border-border hover:border-cyan-border transition-colors"
                >
                  <span className="font-display text-2xl font-bold text-cyan shrink-0 w-20 text-right leading-none">
                    {pct}
                  </span>
                  <div className="h-8 w-px bg-border shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text leading-snug">{label}</p>
                    <p className="text-xs text-text-dim mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-0">
      <span className="h-5 w-0.5 bg-cyan rounded-full" />
      <h2 className="font-display text-2xl font-bold text-text">{title}</h2>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-20 text-center text-text-dim border border-dashed border-border rounded-xl">
      <Package className="size-10 mx-auto mb-3 opacity-50" strokeWidth={1} />
      <p className="text-sm">{message}</p>
    </div>
  )
}
