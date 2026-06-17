"use client"

import React, { useEffect, useState } from 'react'
import { useThemeStore } from '@/store/use-theme-store'

/**
 * Theme provider that manages dark/light mode class on <html>
 * and prevents hydration flash by rendering children only after mount.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useThemeStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)

      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches)
      }
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>
  }

  return <>{children}</>
}
