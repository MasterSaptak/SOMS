"use client"

import { useEffect } from 'react'
import { useAuthStore } from '@/store/use-auth-store'
import { useOrganizationStore } from '@/store/use-organization-store'
import type { Organization } from '@/types/organizations'

/**
 * Primary hook for organization context.
 * Automatically loads memberships when user is authenticated.
 */
export function useOrganization() {
  const { user, isAuthenticated } = useAuthStore()
  const {
    activeOrganization,
    activeOrganizationId,
    memberships,
    isLoading,
    hasLoaded,
    fetchUserOrganizations,
    switchOrganization,
    setActiveOrganization,
  } = useOrganizationStore()

  useEffect(() => {
    if (isAuthenticated && user?.id && !hasLoaded) {
      fetchUserOrganizations(user.id)
    }
  }, [isAuthenticated, user?.id, hasLoaded, fetchUserOrganizations])

  const handleSwitchOrganization = (orgId: string) => {
    switchOrganization(orgId)
    // In a real app, you'd also invalidate permission + feature caches
  }

  return {
    activeOrganization,
    activeOrganizationId,
    memberships,
    isLoading,
    hasLoaded,
    switchOrganization: handleSwitchOrganization,
    // Convenience derived states
    isOwner: memberships.find((m) => m.organizationId === activeOrganizationId)?.role === 'owner',
    isAdmin: ['owner', 'admin'].includes(
      memberships.find((m) => m.organizationId === activeOrganizationId)?.role ?? ''
    ),
    currentMembership: memberships.find((m) => m.organizationId === activeOrganizationId) ?? null,
    organizationCount: memberships.length,
  }
}
