"use client"

import { create } from 'zustand'
import type { User, Employee, UserRole } from '@/lib/types'

interface AuthState {
  user: User | null
  employee: Employee | null
  isAuthenticated: boolean
  isLoading: boolean

  setAuth: (user: User | null, employee: Employee | null) => void
  updateEmployee: (updates: Partial<Employee>) => void
  logout: () => void
  getCurrentRole: () => UserRole | null
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
    set({ user: null, employee: null, isAuthenticated: false })
  },

  getCurrentRole: () => {
    const { user } = get()
    return user?.role || null
  },
}))
