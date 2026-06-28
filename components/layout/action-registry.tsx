"use client"

import React from 'react'
import { createPortal } from 'react-dom'
import { useDevice } from '@/hooks/use-device'
import { AppUpdater } from '@/components/app-updater'
import { PwaInstallButton } from '@/components/pwa-install-button'
import { QueueViewer } from '@/components/queue-viewer'
import { UniversalSearch } from '@/components/universal-search'
import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '@/store/use-theme-store'

export function ActionRegistry() {
  const { isMobile } = useDevice()
  const { theme, toggleTheme } = useThemeStore()

  if (isMobile) {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <QueueViewer />
      <UniversalSearch />
      <PwaInstallButton />
      <AppUpdater />
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  )
}
