"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Download, Share, PlusSquare, Smartphone, Monitor, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Extend Window to hold the deferred prompt globally
declare global {
  interface Window {
    __pwaPrompt: any
  }
}

export function PwaInstallButton() {
  const [isStandalone, setIsStandalone] = useState<boolean | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const [promptReady, setPromptReady] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    // Check if app is already installed as standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && (window.navigator as any).standalone)
    setIsStandalone(!!standalone)

    // Detect device
    const ua = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(ua))
    setIsMac(/macintosh|mac os/.test(ua) && !(/iphone|ipad|ipod/.test(ua)))

    // Check if prompt was already captured globally
    if (window.__pwaPrompt) {
      setPromptReady(true)
    }

    // Listen for the install prompt event — this is the ONLY listener in the entire app
    const onPrompt = (e: Event) => {
      e.preventDefault()
      window.__pwaPrompt = e
      setPromptReady(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)

    // Also listen for the app being installed to hide the button
    const onInstalled = () => {
      setIsStandalone(true)
      window.__pwaPrompt = null
      setPromptReady(false)
    }

    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const triggerNativeInstall = useCallback(async () => {
    const prompt = window.__pwaPrompt
    if (!prompt) return false

    setInstalling(true)
    try {
      prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') {
        window.__pwaPrompt = null
        setPromptReady(false)
        setIsStandalone(true)
        return true
      }
    } catch {
      // prompt() can only be called once — if it throws, prompt was already used
      window.__pwaPrompt = null
      setPromptReady(false)
    } finally {
      setInstalling(false)
    }
    return false
  }, [])

  const handleClick = useCallback(async () => {
    if (promptReady) {
      // Android / Windows / Chrome Desktop — one-click native install
      await triggerNativeInstall()
    } else {
      // iOS / Mac / unsupported browsers — show instruction dialog
      setIsOpen(true)
    }
  }, [promptReady, triggerNativeInstall])

  // Don't render until we know mount state; hide if already installed
  if (isStandalone === null || isStandalone === true) return null

  const showAppleInstructions = isIOS || isMac

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={installing}
        className="gap-2 bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary/10 transition-all rounded-full h-9"
      >
        <Download className={`w-4 h-4 text-primary ${installing ? 'animate-bounce' : ''}`} />
        <span className="text-xs font-semibold hidden md:inline">
          {installing ? 'Installing...' : 'Install App'}
        </span>
      </Button>

      {/* Fallback dialog for iOS / Mac / browsers that don't support beforeinstallprompt */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {showAppleInstructions
                ? <Smartphone className="w-5 h-5 text-primary" />
                : <Monitor className="w-5 h-5 text-primary" />
              }
              Install SOMS App
            </DialogTitle>
            <DialogDescription>
              Install the app on your device for a fast, full-screen experience.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                <img src="/icons/icon-192x192.png" alt="SOMS" className="w-12 h-12 rounded-xl shadow-sm" />
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <h3 className="font-semibold text-sm">SOMS Workspace</h3>
                <p className="text-xs text-muted-foreground">Progressive Web Application</p>
              </div>
            </div>

            <div className="mt-2 bg-muted/30 p-4 rounded-xl border border-border/50">
              {/* If native prompt became available while dialog is open */}
              {promptReady ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">Ready to install!</p>
                  <Button
                    onClick={async () => {
                      const ok = await triggerNativeInstall()
                      if (ok) setIsOpen(false)
                    }}
                    disabled={installing}
                    className="w-full gap-2 h-11 text-base shadow-md"
                  >
                    <Download className="w-5 h-5" />
                    {installing ? 'Installing...' : 'Install Now'}
                  </Button>
                </div>
              ) : isIOS ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">To install on iPhone / iPad:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">1</span>
                    <span>Tap the</span>
                    <Share className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-medium text-foreground">Share</span>
                    <span>button at the bottom</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">2</span>
                    <span>Scroll down and tap</span>
                    <PlusSquare className="w-4 h-4 text-foreground shrink-0" />
                    <span className="font-medium text-foreground">Add to Home Screen</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">3</span>
                    <span>Tap</span>
                    <span className="font-medium text-foreground">Add</span>
                    <span>in the top right corner</span>
                  </div>
                </div>
              ) : isMac ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">To install on Mac (Safari / Chrome):</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">1</span>
                    <span>In <strong>Chrome</strong>: Click</span>
                    <MoreVertical className="w-4 h-4 text-foreground shrink-0" />
                    <span>→ <strong>Install SOMS...</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">2</span>
                    <span>In <strong>Safari</strong>: Click <strong>File</strong> → <strong>Add to Dock</strong></span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-medium">To install on your device:</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">1</span>
                    <span>Click</span>
                    <MoreVertical className="w-4 h-4 text-foreground shrink-0" />
                    <span>browser menu (top right)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background p-3 rounded-lg border border-border shadow-sm">
                    <span className="font-mono bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center text-xs shrink-0">2</span>
                    <span>Select <strong>&quot;Install SOMS...&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
