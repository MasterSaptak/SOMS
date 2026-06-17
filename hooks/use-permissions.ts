"use client"

import { useAuth } from './use-auth'
import type { PermissionAction, PermissionResource } from '@/lib/types'

/**
 * Hook for granular permission checks in components
 */
export function usePermissions() {
  const { can, hasRole, role } = useAuth()

  return {
    role,

    /** Check a single permission */
    can,

    /** Check if user has any of the listed roles */
    hasRole,

    /** Check multiple permissions (all must pass) */
    canAll: (checks: { resource: PermissionResource; action: PermissionAction }[]): boolean => {
      return checks.every(c => can(c.resource, c.action))
    },

    /** Check multiple permissions (at least one must pass) */
    canAny: (checks: { resource: PermissionResource; action: PermissionAction }[]): boolean => {
      return checks.some(c => can(c.resource, c.action))
    },

    /** Commonly used permission checks */
    canManageTasks: can('tasks', 'assign'),
    canApproveleaves: can('leaves', 'approve'),
    canAccessHR: can('hr', 'view'),
    canAccessPayroll: can('payroll', 'view'),
    canAccessAnalytics: can('analytics', 'view'),
    canManageVisitors: can('visitors', 'create'),
    canCreateAnnouncements: can('announcements', 'create'),
  }
}
