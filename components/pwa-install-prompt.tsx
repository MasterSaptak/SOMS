"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, Download, Share, PlusSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PwaInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if user dismissed previously
    const dismissed = localStorage.getItem('soms-pwa-dismissed')
    if (dismissed === 'true') return

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isStandalone = ('standalone' in window.navigator) && (window.navigator as any).standalone
    
    if (isIosDevice && !isStandalone) {
      setIsIOS(true)
      setIsInstallable(true)
    }

    // Handle standard Android/Desktop PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show prompt after a slight delay to avoid overwhelming the user immediately
    if (isIosDevice && !isStandalone) {
       const timer = setTimeout(() => setShowPrompt(true), 3000)
       return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    if (deferredPrompt) {
      const timer = setTimeout(() => setShowPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [deferredPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      setShowPrompt(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('soms-pwa-dismissed', 'true')
  }

  if (!isInstallable) return null

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 150, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-50 pointer-events-auto"
        >
          <div className="bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-5 relative overflow-hidden flex flex-col gap-3">
            {/* Background flair */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/20 blur-2xl rounded-full" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors bg-background/50 rounded-full p-1 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 relative z-10">
              <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                <img src="/icons/icon-192x192.png" alt="SOMS App Icon" className="w-12 h-12 rounded-xl shadow-sm" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-base leading-tight">Install SOMS App</h3>
                <p className="text-sm text-muted-foreground leading-snug">
                  Get faster access, offline capabilities, and a native experience.
                </p>
              </div>
            </div>

            <div className="mt-2 relative z-10">
              {isIOS ? (
                <div className="bg-muted/50 rounded-xl p-3 border border-border/50 text-sm flex items-center justify-center gap-2">
                  <span className="text-muted-foreground">Tap</span>
                  <Share className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">then</span>
                  <PlusSquare className="w-4 h-4 text-foreground" />
                  <span className="font-medium">Add to Home Screen</span>
                </div>
              ) : (
                <Button 
                  onClick={handleInstall} 
                  className="w-full gap-2 rounded-xl h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" /> Install Application
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
