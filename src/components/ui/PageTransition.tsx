import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

export function AnimatedOutlet() {
  const { pathname } = useLocation()
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' as const }}
    >
      <Outlet />
    </motion.div>
  )
}
