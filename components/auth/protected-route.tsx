"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePermissionStore } from '@/store/use-permission-store'
import { useFeatureStore } from '@/store/use-feature-store'
import type { Permission } from '@/types/permissions'
import type { FeatureFlagKey } from '@/types/preferences'

interface ProtectedRouteProps {
  /** Required permission to access this route */
  permission?: Permission
  /** Required feature flag to access this route */
  feature?: FeatureFlagKey
  /** Where to redirect when access is denied */
  redirectTo?: string
  /** Content to show while checking permissions */
  loadingFallback?: React.ReactNode
  children: React.ReactNode
}

/**
 * Route-level permission guard.
 * Redirects to redirectTo (default: '/') when access is denied.
 *
 * @example
 * <ProtectedRoute permission="payroll.manage" redirectTo="/employee">
 *   <PayrollPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  permission,
  feature,
  redirectTo = '/employee',
  loadingFallback,
  children,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { can, hasLoaded: permissionsLoaded } = usePermissionStore()
  const { isEnabled, hasLoaded: flagsLoaded } = useFeatureStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Wait for permissions and flags to load
  const isLoading = !mounted || !permissionsLoaded || !flagsLoaded

  if (isLoading) {
    return loadingFallback ? <>{loadingFallback}</> : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // Feature flag check
  if (feature && !isEnabled(feature)) {
    router.replace(redirectTo)
    return null
  }

  // Permission check
  if (permission && !can(permission)) {
    router.replace(redirectTo)
    return null
  }

  return <>{children}</>
}
