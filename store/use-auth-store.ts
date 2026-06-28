"use client"

import { create } from 'zustand'
import type { User, Employee, UserRole } from '@/lib/types'
import { db } from '@/lib/cache/db'
import { isCacheEnabled } from '@/lib/cache/flags'
import { SyncEngine } from '@/lib/cache/sync-engine'

interface AuthState {
  user: User | null
  employee: Employee | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: User | null, employee: Employee | null) => void
  updateEmployee: (updates: Partial<Employee>) => void
  logout: () => void
  getCurrentRole: () => UserRole | null
  hydrateFromCache: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  employee: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user: User | null, employee: Employee | null) => {
    set({ user, employee, isAuthenticated: !!user })
  },

  updateEmployee: (updates: Partial<Employee>) => {
    set((state) => ({
      employee: state.employee ? { ...state.employee, ...updates } : null
    }))
  },

  logout: () => {
    // Total User Isolation: purge all local cache on logout
    SyncEngine.clearCache()
    set({ user: null, employee: null, isAuthenticated: false })
  },

  getCurrentRole: () => {
    const { user } = get()
    return user?.role || null
  },

  hydrateFromCache: async (userId: string) => {
    if (!isCacheEnabled('CACHE_PROFILE')) return
    
    try {
      // Health Check & Isolation Verification
      const meta = await db.metadata.get('lastSync')
      if (!meta || !meta.bootstrapCompleted || meta.userId !== userId) {
        console.warn('AuthStore: Cache not ready or user mismatch. Skipping hydration.')
        return
      }

      const cachedProfile = await db.profiles.get(userId)
      if (cachedProfile) {
        set((state) => {
          if (state.user) {
            return { user: { ...state.user, role: cachedProfile.role as UserRole } }
          }
          return state
        })
      }
    } catch (error) {
      console.error('Failed to hydrate auth store from cache:', error)
    }
  }
}))
