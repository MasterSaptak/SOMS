"use client"

import { useAuthStore } from '@/store/use-auth-store'
import { hasPermission, canAccessRoute } from '@/lib/permissions'
import type { PermissionAction, PermissionResource } from '@/lib/types'

/**
 * Hook for auth state and permission checking in components
 */
export function useAuth() {
  const { user, employee, isAuthenticated, setAuth, logout } = useAuthStore()
  const role = user?.role ?? null

  return {
    user,
    employee,
    isAuthenticated,
    role,
    setAuth,
    logout,

    /** Check if the current user has a specific permission */
    can: (resource: PermissionResource, action: PermissionAction): boolean => {
      if (!role) return false
      return hasPermission(role, resource, action)
    },

    /** Check if current user can access a route */
    canAccess: (pathname: string): boolean => {
      if (!role) return false
      return canAccessRoute(role, pathname)
    },

    /** Check if user has any of the given roles */
    hasRole: (...roles: string[]): boolean => {
      if (!role) return false
      return roles.includes(role)
    },
  }
}
