"use client"

import { useEffect } from 'react'
import { useOrganizationStore } from '@/store/use-organization-store'
import { useFeatureStore } from '@/store/use-feature-store'
import type { FeatureFlagKey } from '@/types/preferences'

/**
 * Enterprise feature flag hook.
 * Replaces the old `useFeature` hook.
 * Checks org-specific overrides first, then global flags.
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const { activeOrganizationId } = useOrganizationStore()
  const { loadFlags, isEnabled, hasLoaded } = useFeatureStore()

  useEffect(() => {
    if (activeOrganizationId && !hasLoaded) {
      loadFlags(activeOrganizationId)
    }
  }, [activeOrganizationId, hasLoaded, loadFlags])

  return isEnabled(key)
}

/**
 * Get multiple feature flags at once.
 */
export function useFeatureFlags(keys: FeatureFlagKey[]): Record<FeatureFlagKey, boolean> {
  const { activeOrganizationId } = useOrganizationStore()
  const { loadFlags, isEnabled, hasLoaded } = useFeatureStore()

  useEffect(() => {
    if (activeOrganizationId && !hasLoaded) {
      loadFlags(activeOrganizationId)
    }
  }, [activeOrganizationId, hasLoaded, loadFlags])

  return keys.reduce(
    (acc, key) => {
      acc[key] = isEnabled(key)
      return acc
    },
    {} as Record<FeatureFlagKey, boolean>
  )
}
