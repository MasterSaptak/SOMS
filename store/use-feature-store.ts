"use client"

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { FeatureFlag, OrganizationFeature, FeatureFlagKey } from '@/types/preferences'

interface FeatureState {
  globalFlags: Map<FeatureFlagKey, boolean>
  orgFlags: Map<FeatureFlagKey, boolean>
  organizationId: string | null
  isLoading: boolean
  hasLoaded: boolean

  loadFlags: (organizationId: string) => Promise<void>
  isEnabled: (key: FeatureFlagKey) => boolean
  invalidate: () => void
}

export const useFeatureStore = create<FeatureState>((set, get) => ({
  globalFlags: new Map(),
  orgFlags: new Map(),
  organizationId: null,
  isLoading: false,
  hasLoaded: false,

  loadFlags: async (organizationId: string) => {
    const { organizationId: loadedOrgId, hasLoaded } = get()
    if (hasLoaded && loadedOrgId === organizationId) return

    set({ isLoading: true })

    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any

      // Load global feature flags
      const { data: globalData } = await sb
        .from('features')
        .select('key, is_enabled')

      // Load org-specific feature overrides
      const { data: orgData } = await sb
        .from('organization_features')
        .select('feature_key, is_enabled')
        .eq('organization_id', organizationId)

      const globalFlags = new Map<FeatureFlagKey, boolean>()
      const orgFlags = new Map<FeatureFlagKey, boolean>()

      for (const flag of globalData || []) {
        globalFlags.set(flag.key as FeatureFlagKey, flag.is_enabled)
      }

      for (const orgFeature of orgData || []) {
        orgFlags.set(orgFeature.feature_key as FeatureFlagKey, orgFeature.is_enabled)
      }

      set({
        globalFlags,
        orgFlags,
        organizationId,
        isLoading: false,
        hasLoaded: true,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  isEnabled: (key: FeatureFlagKey): boolean => {
    const { orgFlags, globalFlags } = get()

    // Org override takes priority
    if (orgFlags.has(key)) {
      return orgFlags.get(key)!
    }

    // Fall back to global flag
    return globalFlags.get(key) ?? false
  },

  invalidate: () => {
    set({
      globalFlags: new Map(),
      orgFlags: new Map(),
      hasLoaded: false,
    })
  },
}))
