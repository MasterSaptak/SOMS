"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useSyncStore } from '@/store/use-sync-store'
import { SyncBadge } from '@/components/sync-badge'
import { SwipeableItem } from '@/components/gesture/swipeable-item'
import { Clock, RefreshCw, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QueueViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const { queue, isSyncing, syncAll, removeAction, clearQueue } = useSyncStore()

  // Avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])
  if (!mounted) return null

  return (
    <>
      <SyncBadge onClick={() => setIsOpen(true)} />

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="flex flex-col h-full w-[400px] sm:w-[540px] border-l border-border/40 bg-surface-base sm:max-w-md">
          <SheetHeader className="pb-4 border-b border-border/40">
            <SheetTitle>Offline Queue</SheetTitle>
            <SheetDescription>
              Actions performed while offline are saved locally and will sync when connection returns.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <CheckCircle2 className="w-8 h-8 opacity-20" />
                <p className="text-sm">Queue is empty. Everything is synced!</p>
              </div>
            ) : (
              <AnimatePresence>
                {queue.map((action) => (
                  <SwipeableItem
                    key={action.id}
                    onDismiss={() => removeAction(action.id)}
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 border-border/50 bg-card flex flex-col gap-3 relative overflow-hidden group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              {action.type.replace('_', ' ')}
                            </span>
                            {action.status === 'failed' && (
                              <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-sm font-medium flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Error
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-foreground/80">{action.description || 'Action queued for sync'}</p>
                        </div>
                        {/* Right action button is now handled by SwipeableItem, but we can keep a backup ghost button for non-touch */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hidden sm:flex"
                          onClick={() => removeAction(action.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(action.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="uppercase font-medium text-foreground/50">
                          {action.method} {action.endpoint}
                        </div>
                      </div>
                      
                      {action.error && (
                        <div className="text-xs text-destructive bg-destructive/5 p-2 rounded-md border border-destructive/10">
                          {action.error}
                        </div>
                      )}
                    </motion.div>
                  </SwipeableItem>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-4 shrink-0">
            <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={clearQueue} disabled={queue.length === 0 || isSyncing}>
              Clear Queue
            </Button>
            <Button onClick={syncAll} disabled={queue.length === 0 || isSyncing} className="gap-2">
              <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
              {isSyncing ? 'Syncing...' : 'Force Sync'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
