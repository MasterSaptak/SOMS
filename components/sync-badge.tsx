"use client"

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CloudOff, CloudUpload, CheckCircle2, AlertCircle } from 'lucide-react'
import { useNetwork } from '@/hooks/use-network'
import { useSyncStore } from '@/store/use-sync-store'
import { cn } from '@/lib/utils'

export function SyncBadge({ className, onClick }: { className?: string, onClick?: () => void }) {
  const { isOffline, isOnline } = useNetwork()
  const { queue, isSyncing, syncAll } = useSyncStore()

  const pendingCount = queue.length
  const hasErrors = queue.some(a => a.status === 'failed')

  // Attempt to sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncAll()
    }
  }, [isOnline, pendingCount, isSyncing, syncAll])

  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  if (!mounted) return null

  if (pendingCount === 0 && isOnline) {
    return null // Hidden when everything is perfect
  }

  return (
    <div className={cn("flex items-center gap-2 cursor-pointer", className)} onClick={onClick}>
      <AnimatePresence mode="wait">
        {isOffline ? (
          <motion.div
            key="offline"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-[10px] font-semibold uppercase tracking-wider hover:bg-destructive/20 transition-colors"
          >
            <CloudOff className="w-3 h-3" />
            <span>{pendingCount} Pending</span>
          </motion.div>
        ) : isSyncing ? (
          <motion.div
            key="syncing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold uppercase tracking-wider"
          >
            <CloudUpload className="w-3 h-3 animate-pulse" />
            <span>Syncing {pendingCount}...</span>
          </motion.div>
        ) : hasErrors ? (
          <motion.div
            key="errors"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20 text-[10px] font-semibold uppercase tracking-wider hover:bg-orange-500/20 transition-colors"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Sync Failed</span>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider"
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Synced</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
