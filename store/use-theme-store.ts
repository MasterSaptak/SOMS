"use client"

import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
  resolvedTheme: () => 'light' | 'dark'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',

  setTheme: (theme: Theme) => {
    set({ theme })
    if (typeof window !== 'undefined') {
      localStorage.setItem('soms-theme', theme)
      applyTheme(theme)
    }
  },

  toggleTheme: () => {
    const current = get().theme
    const next = current === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },

  resolvedTheme: () => {
    const { theme } = get()
    if (theme === 'system') {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light'
    }
    return theme
  },
}))

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

// Hydrate on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('soms-theme') as Theme | null
  if (stored) {
    useThemeStore.setState({ theme: stored })
    applyTheme(stored)
  }
}
