"use client"

import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useOrganizationStore } from '@/store/use-organization-store'
import { usePermissionStore } from '@/store/use-permission-store'
import { useFeatureStore } from '@/store/use-feature-store'

/**
 * EnterpriseProvider — root-level store orchestration.
 *
 * Placed at the root authenticated layout level.
 * When a user is authenticated:
 *  1. Loads their organization memberships
 *  2. Loads their permissions for the active org
 *  3. Loads feature flags for the active org
 *
 * This component has no visual output — it's a pure side-effect driver.
 */
export function EnterpriseProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const { activeOrganizationId, hasLoaded: orgsLoaded, fetchUserOrganizations } = useOrganizationStore()
  const { loadPermissions, hasLoaded: permsLoaded, organizationId: permOrgId } = usePermissionStore()
  const { loadFlags, hasLoaded: flagsLoaded, organizationId: flagOrgId } = useFeatureStore()

  // Step 1: Load org memberships on auth
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      if (!orgsLoaded || !activeOrganizationId) {
        fetchUserOrganizations(user.id)
      }
    }
  }, [isAuthenticated, user?.id, orgsLoaded, activeOrganizationId, fetchUserOrganizations])

  // Step 2: Load permissions when org is known
  useEffect(() => {
    if (isAuthenticated && user?.id && activeOrganizationId) {
      // Only reload if org changed
      if (!permsLoaded || permOrgId !== activeOrganizationId) {
        loadPermissions(user.id, activeOrganizationId)
      }
    }
  }, [isAuthenticated, user?.id, activeOrganizationId, permsLoaded, permOrgId, loadPermissions])

  // Step 3: Load feature flags when org is known
  useEffect(() => {
    if (activeOrganizationId) {
      if (!flagsLoaded || flagOrgId !== activeOrganizationId) {
        loadFlags(activeOrganizationId)
      }
    }
  }, [activeOrganizationId, flagsLoaded, flagOrgId, loadFlags])

  return <>{children}</>
}
