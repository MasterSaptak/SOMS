"use client"

import { create } from 'zustand'
import type { User, Employee, UserRole } from '@/lib/types'
import { MOCK_USERS, MOCK_EMPLOYEES, getUserByEmail, getEmployeeByUserId } from '@/lib/mock-data'
import { getDefaultRoute } from '@/lib/permissions'

interface AuthState {
  user: User | null
  employee: Employee | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (email: string, password: string) => { success: boolean; redirect: string; error?: string }
  logout: () => void
  getCurrentRole: () => UserRole | null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  employee: null,
  isAuthenticated: false,
  isLoading: false,

  login: (email: string, _password: string) => {
    const user = getUserByEmail(email)
    if (!user) {
      return { success: false, redirect: '/login', error: 'Invalid email or password' }
    }
    if (!user.isActive) {
      return { success: false, redirect: '/login', error: 'Account is deactivated' }
    }

    const employee = getEmployeeByUserId(user.id)
    set({ user, employee: employee || null, isAuthenticated: true })

    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('soms-auth', JSON.stringify({ userId: user.id }))
    }

    return { success: true, redirect: getDefaultRoute(user.role) }
  },

  logout: () => {
    set({ user: null, employee: null, isAuthenticated: false })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('soms-auth')
    }
  },

  getCurrentRole: () => {
    const { user } = get()
    return user?.role || null
  },
}))

// Hydrate from localStorage on load
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('soms-auth')
  if (stored) {
    try {
      const { userId } = JSON.parse(stored)
      const user = MOCK_USERS.find(u => u.id === userId)
      if (user) {
        const employee = MOCK_EMPLOYEES.find(e => e.userId === user.id)
        useAuthStore.setState({ user, employee: employee || null, isAuthenticated: true })
      }
    } catch {
      localStorage.removeItem('soms-auth')
    }
  }
}
