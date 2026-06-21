"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'
import type { Organization, OrganizationMember } from '@/types/organizations'

interface OrganizationState {
  activeOrganizationId: string | null
  activeOrganization: Organization | null
  memberships: OrganizationMember[]
  isLoading: boolean
  hasLoaded: boolean

  setActiveOrganization: (org: Organization | null) => void
  setMemberships: (memberships: OrganizationMember[]) => void
  switchOrganization: (orgId: string) => void
  fetchUserOrganizations: (userId: string) => Promise<void>
  reset: () => void
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      activeOrganizationId: null,
      activeOrganization: null,
      memberships: [],
      isLoading: false,
      hasLoaded: false,

      setActiveOrganization: (org) => set({
        activeOrganization: org,
        activeOrganizationId: org?.id ?? null,
      }),

      setMemberships: (memberships) => set({ memberships }),

      switchOrganization: (orgId: string) => {
        const { memberships } = get()
        const membership = memberships.find((m) => m.organizationId === orgId)
        if (membership?.organization) {
          set({
            activeOrganizationId: orgId,
            activeOrganization: membership.organization,
          })
        }
      },

      fetchUserOrganizations: async (userId: string) => {
        set({ isLoading: true })
        try {
          const supabase = createClient()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data, error } = await (supabase as any)
            .from('organization_members')
            .select('*, organizations(*)')
            .eq('user_id', userId)
            .eq('status', 'active')

          if (!error && data) {
            const memberships = data as unknown as OrganizationMember[]
            const { activeOrganizationId } = get()

            // Auto-select first org if none is active
            let activeOrg: Organization | null = null
            if (activeOrganizationId) {
              activeOrg = memberships.find((m) => m.organizationId === activeOrganizationId)?.organization ?? null
            }
            if (!activeOrg && memberships.length > 0) {
              activeOrg = memberships[0].organization ?? null
            }

            set({
              memberships,
              activeOrganization: activeOrg,
              activeOrganizationId: activeOrg?.id ?? null,
              hasLoaded: true,
            })
          }
        } catch {
          // Don't crash the UI
        } finally {
          set({ isLoading: false })
        }
      },

      reset: () => set({
        activeOrganizationId: null,
        activeOrganization: null,
        memberships: [],
        isLoading: false,
        hasLoaded: false,
      }),
    }),
    {
      name: 'soms-active-org',
      partialize: (state) => ({
        activeOrganizationId: state.activeOrganizationId,
      }),
    }
  )
)
