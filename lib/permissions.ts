// ============================================================
// SOMS Enterprise — RBAC Permission Helpers
// ============================================================

import type { UserRole, PermissionAction, PermissionResource } from './types'
import { ROLE_PERMISSIONS } from './constants'

/**
 * Check if a role has a specific permission on a resource
 */
export function hasPermission(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false

  const resourcePerms = permissions.find(p => p.resource === resource)
  if (!resourcePerms) return false

  return resourcePerms.actions.includes(action)
}

/**
 * Check if a role can access a specific route
 */
export function canAccessRoute(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith('/admin')) {
    return ['super_admin', 'hr_manager', 'dept_manager'].includes(role)
  }
  if (pathname.startsWith('/reception')) {
    return ['super_admin', 'receptionist'].includes(role)
  }
  if (pathname.startsWith('/employee')) {
    return role !== 'receptionist' || pathname === '/employee/leaves'
  }
  return true
}

/**
 * Get the default redirect path for a role after login
 */
export function getDefaultRoute(role: UserRole): string {
  switch (role) {
    case 'super_admin':
    case 'hr_manager':
      return '/admin'
    case 'receptionist':
      return '/reception'
    default:
      return '/employee'
  }
}

/**
 * Get all accessible nav sections for a role
 */
export function getAccessibleNavSections(role: UserRole): string[] {
  const sections: string[] = ['employee']
  if (['super_admin', 'hr_manager', 'dept_manager'].includes(role)) {
    sections.push('admin')
  }
  if (['super_admin', 'receptionist'].includes(role)) {
    sections.push('reception')
  }
  return sections
}
