"use client"

import React, { useEffect, useState } from 'react'
import { usePermissionStore } from '@/store/use-permission-store'
import type { Permission } from '@/types/permissions'

interface CanProps {
  /** Single permission key e.g. 'leave.approve' */
  permission?: Permission
  /** Check ALL of these permissions */
  all?: Permission[]
  /** Check ANY of these permissions */
  any?: Permission[]
  /** Content to show when permission is granted */
  children: React.ReactNode
  /** Content to show when permission is denied (default: null) */
  fallback?: React.ReactNode
}

/**
 * Declarative permission-gating component.
 *
 * @example
 * <Can permission="leave.approve">
 *   <ApproveButton />
 * </Can>
 *
 * <Can any={['employee.create', 'employee.update']}>
 *   <EditEmployeeForm />
 * </Can>
 */
export function Can({ permission, all, any, children, fallback = null }: CanProps) {
  const { can, canAll, canAny, hasLoaded } = usePermissionStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Avoid hydration mismatch
  if (!mounted || !hasLoaded) return null

  let allowed = false

  if (permission) {
    allowed = can(permission)
  } else if (all && all.length > 0) {
    allowed = canAll(all)
  } else if (any && any.length > 0) {
    allowed = canAny(any)
  } else {
    // No permission specified = always render
    allowed = true
  }

  return allowed ? <>{children}</> : <>{fallback}</>
}
