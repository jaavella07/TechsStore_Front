import { Link } from 'react-router-dom'
import { Tag, Gift, ArrowRight, Clock, BadgePercent } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { ROUTES } from '@/lib/constants'

// ─── Edita aquí las promociones ───────────────────────────────────────────────
const PROMOS = [
  {
    id: 1,
    icon: BadgePercent,
    badge: '35% OFF',
    badgeColor: 'bg-coral text-bg',
    title: '35% de descuento en compras grandes',
    description:
      'Obtén un 35 % de descuento automático en tu carrito cuando el total supere los $250.000 COP. Sin códigos ni pasos extra.',
    condition: 'Válido en compras mayores a $250.000 COP',
    code: null,
    expires: '31 de julio de 2026',
  },
  {
    id: 2,
    icon: Gift,
    badge: 'BONO',
    badgeColor: 'bg-cyan text-bg',
    title: 'TechsCare: 1 mes de soporte prioritario gratis',
    description:
      'Tras realizar cualquier compra en TechsStore recibirás un bono de acceso por 1 mes a TechsCare, nuestro plan de soporte prioritario con atención 24/7, diagnóstico remoto y cambio exprés de piezas.',
    condition: 'Aplica en cualquier compra. El bono llega a tu correo en máximo 24 h.',
    code: 'TECHCARE1M',
    expires: '30 de junio de 2026',
  },
]
// ─────────────────────────────────────────────────────────────────────────────

interface PromoModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PromoModal({ isOpen, onClose }: PromoModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" className="p-0 overflow-hidden">
      {/* Header */}
      <div className="relative px-6 pt-6 pb-5 border-b border-border bg-surface-2">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-dim hover:text-text transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Tag className="size-4 text-cyan" />
          <span className="text-xs text-cyan font-semibold tracking-widest uppercase">
            Tiempo Limitado
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-text">Ofertas especiales</h2>
        <p className="text-text-muted text-sm mt-1">
          Aprovecha estas promociones activas antes de que venzan.
        </p>
      </div>

      {/* Promo cards */}
      <div className="px-6 py-5 flex flex-col gap-4">
        {PROMOS.map(({ id, icon: Icon, badge, badgeColor, title, description, condition, code, expires }) => (
          <div
            key={id}
            className="flex gap-4 p-4 rounded-xl border border-border bg-surface-2 hover:border-cyan-border transition-colors"
          >
            {/* Icon */}
            <div className="shrink-0 size-10 rounded-lg bg-cyan-dim flex items-center justify-center mt-0.5">
              <Icon className="size-5 text-cyan" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}`}>
                  {badge}
                </span>
                <h3 className="text-sm font-semibold text-text">{title}</h3>
              </div>

              <p className="text-xs text-text-muted leading-relaxed mb-2">{description}</p>

              <p className="text-[11px] text-text-dim mb-2">
                <span className="font-medium text-text-muted">Condición:</span> {condition}
              </p>

              {code && (
                <div className="inline-flex items-center gap-2 bg-bg border border-border rounded px-2.5 py-1 mb-2">
                  <span className="text-[10px] text-text-dim uppercase tracking-wider">Código</span>
                  <span className="font-mono text-sm font-semibold text-cyan">{code}</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-[10px] text-text-dim">
                <Clock className="size-3" />
                <span>Vence el {expires}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="px-6 pb-6 flex justify-end">
        <Link to={ROUTES.products} onClick={onClose}>
          <Button rightIcon={<ArrowRight className="size-4" />}>
            Ir a la tienda
          </Button>
        </Link>
      </div>
    </Modal>
  )
}
