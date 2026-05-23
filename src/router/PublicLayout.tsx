import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/shared/CartDrawer'
import { AnimatedOutlet } from '@/components/ui/PageTransition'

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <AnimatedOutlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}
