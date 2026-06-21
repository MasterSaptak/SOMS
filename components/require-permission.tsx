"use client"

/**
 * @deprecated Use <Can permission="resource.action"> instead.
 * Kept for backward compatibility during the transition to string-based permissions.
 */
import React from 'react'
import { Can } from '@/components/auth/can'
import type { Permission } from '@/types/permissions'

interface RequirePermissionProps {
  /** Permission key e.g. 'leave.approve'. Falls back to legacy resource+action if not set. */
  permission?: Permission
  /** @deprecated Use `permission` prop with string key instead */
  resource?: string
  /** @deprecated Use `permission` prop with string key instead */
  action?: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RequirePermission({
  permission,
  resource,
  action,
  children,
  fallback = null,
}: RequirePermissionProps) {
  // Derive permission key from legacy resource+action props
  const derivedPermission: Permission = permission ?? (`${resource}.${action}` as Permission)

  return (
    <Can permission={derivedPermission} fallback={fallback}>
      {children}
    </Can>
  )
}
