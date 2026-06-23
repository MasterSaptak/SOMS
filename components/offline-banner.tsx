"use client"

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WifiOff } from 'lucide-react'
import { useNetwork } from '@/hooks/use-network'

export function OfflineBanner() {
  const { isOffline } = useNetwork()

  // Avoid hydration mismatch by waiting for client
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-destructive text-destructive-foreground overflow-hidden z-[100] relative w-full"
        >
          <div className="flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-semibold uppercase tracking-wider">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline Workspace Active — Pending Sync</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
