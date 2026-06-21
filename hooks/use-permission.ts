"use client"

import { useEffect } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { usePermissionStore } from '@/store/use-permission-store'
import { useOrganizationStore } from '@/store/use-organization-store'
import type { Permission } from '@/types/permissions'

/**
 * Enterprise permission hook.
 * Replaces the old `usePermissions` hook.
 * Uses string-based permission keys (e.g., 'leave.approve').
 */
export function usePermission() {
  const { user, isAuthenticated } = useAuthStore()
  const { activeOrganizationId } = useOrganizationStore()
  const { can, canAll, canAny, loadPermissions, hasLoaded, isLoading } = usePermissionStore()

  useEffect(() => {
    if (isAuthenticated && user?.id && activeOrganizationId && !hasLoaded) {
      loadPermissions(user.id, activeOrganizationId)
    }
  }, [isAuthenticated, user?.id, activeOrganizationId, hasLoaded, loadPermissions])

  return {
    can,
    canAll,
    canAny,
    hasLoaded,
    isLoading,
    // Convenience helpers that check membership-level roles
    // (these are organization-member roles, not permission-based)
    hasRole: (roleName: string) => {
      const store = usePermissionStore.getState()
      return store.roles.includes(roleName)
    },
    roles: usePermissionStore.getState().roles,
  }
}

/**
 * Simplified role helper hook.
 */
export function useRole() {
  const { user } = useAuthStore()
  const { roles } = usePermissionStore()

  return {
    role: user?.role ?? null,
    roles,
    isOwner: roles.includes('owner'),
    isAdmin: roles.includes('owner') || roles.includes('admin'),
    isManager: roles.includes('manager'),
    isEmployee: roles.includes('employee') || !!user?.role,
    isGuest: roles.includes('guest'),
  }
}
