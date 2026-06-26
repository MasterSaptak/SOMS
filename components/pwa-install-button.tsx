"use client"

import React, { useState, useEffect } from 'react'
import { Download, Share, PlusSquare, Smartphone, Monitor, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function PwaInstallButton() {
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || ('standalone' in window.navigator && (window.navigator as any).standalone)
    setIsStandalone(!!standalone)

    // Detect Device
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent)
    const isAndroidDevice = /android/.test(userAgent)
    setIsIOS(isIosDevice)
    setIsAndroid(isAndroidDevice)
    if (!isIosDevice && !isAndroidDevice && !/mobi|tablet/i.test(userAgent)) {
      setIsDesktop(true)
    }

    // Capture install prompt
    if ((window as any).deferredPrompt) {
      setDeferredPrompt((window as any).deferredPrompt)
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleDeferredReady = () => {
      if ((window as any).deferredPrompt) {
        setDeferredPrompt((window as any).deferredPrompt)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('deferredpromptready', handleDeferredReady)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('deferredpromptready', handleDeferredReady)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsOpen(false)
    }
  }

  // Prevent hydration mismatch by not rendering anything until mounted
  if (isStandalone === null || isStandalone === true) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all rounded-full h-9"
        >
          <Download className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold hidden md:inline">Install App</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDesktop ? <Monitor className="w-5 h-5 text-primary" /> : <Smartphone className="w-5 h-5 text-primary" />}
            Install SOMS App
          </DialogTitle>
          <DialogDescription>
            Install the app on your device for a fast, native-like experience with offline capabilities.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
              <img src="/icons/icon-192x192.png" alt="SOMS App Icon" className="w-12 h-12 rounded-xl shadow-sm" />
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="font-semibold text-sm">SOMS Workspace</h3>
              <p className="text-xs text-muted-foreground">Progressive Web Application</p>
            </div>
          </div>

          <div className="mt-2 bg-muted/30 p-4 rounded-xl border border-border/50">
            {deferredPrompt ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">Ready to install on your device.</p>
                <Button onClick={handleInstallClick} className="w-full gap-2 h-11 text-base shadow-md">
                  <Download className="w-5 h-5" />
                  Install Now
                </Button>
              </div>
            ) : isIOS ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">To install on iOS Safari:</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                  <span>1. Tap</span>
                  <Share className="w-4 h-4 text-blue-500" />
                  <span>Share</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                  <span>2. Tap</span>
                  <PlusSquare className="w-4 h-4 text-foreground" />
                  <span>Add to Home Screen</span>
                </div>
              </div>
            ) : isAndroid ? (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">To install on Android:</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                  <span>1. Tap</span>
                  <MoreVertical className="w-4 h-4 text-foreground" />
                  <span>Browser Menu</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                  <span>2. Select</span>
                  <Download className="w-4 h-4 text-foreground" />
                  <span>Install app / Add to Home screen</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-medium">To install on Desktop:</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                  <span>1. Look for the install icon</span>
                  <Download className="w-4 h-4 text-foreground" />
                  <span>in the URL bar</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                  <span>2. Or click the browser menu (⋮) and select <strong>Install SOMS...</strong></span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
