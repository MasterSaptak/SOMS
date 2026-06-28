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

      setActiveOrganization: (org) => {
        if (typeof document !== 'undefined') {
          if (org?.id) {
            document.cookie = `soms_current_org=${org.id}; path=/; max-age=31536000; SameSite=Lax`
          } else {
            document.cookie = `soms_current_org=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        }
        set({
          activeOrganization: org,
          activeOrganizationId: org?.id ?? null,
        })
      },

      setMemberships: (memberships) => set({ memberships }),

      switchOrganization: (orgId: string) => {
        const { memberships } = get()
        const membership = memberships.find((m) => m.organizationId === orgId)
        if (membership?.organization) {
          if (typeof document !== 'undefined') {
            document.cookie = `soms_current_org=${orgId}; path=/; max-age=31536000; SameSite=Lax`
          }
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

            if (typeof document !== 'undefined' && activeOrg?.id) {
              document.cookie = `soms_current_org=${activeOrg.id}; path=/; max-age=31536000; SameSite=Lax`
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
