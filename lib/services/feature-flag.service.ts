import { featureFlagRepository } from '@/lib/repositories/feature-flag.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { PermissionError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import type { FeatureFlag, OrganizationFeature, FeatureFlagKey } from '@/types/preferences'

// In-memory cache: key = feature_key
const flagCache = new Map<string, { isEnabled: boolean; rollout: number; expiresAt: number }>()
// Per-org cache: key = `${orgId}:${feature_key}`
const orgFlagCache = new Map<string, { isEnabled: boolean; expiresAt: number }>()
const CACHE_TTL_MS = 2 * 60 * 1000 // 2 minutes

export class FeatureFlagService {
  private invalidateFlagCache(key: FeatureFlagKey) {
    flagCache.delete(key)
  }

  private invalidateOrgCache(orgId: string, key: FeatureFlagKey) {
    orgFlagCache.delete(`${orgId}:${key}`)
  }

  /**
   * Check if a global feature flag is enabled.
   * For org-specific checks, use isEnabledForOrg().
   */
  async isEnabled(key: FeatureFlagKey): Promise<boolean> {
    const cacheEntry = flagCache.get(key)
    if (cacheEntry && cacheEntry.expiresAt > Date.now()) {
      return this.evaluateRollout(cacheEntry.isEnabled, cacheEntry.rollout)
    }

    const result = await featureFlagRepository.findByKey(key)
    if (!result.success) {
      // Default to disabled if flag not found
      logger.warn(`[FeatureFlagService] Flag '${key}' not found, defaulting to disabled`)
      return false
    }

    const flag = result.data
    flagCache.set(key, {
      isEnabled: flag.isEnabled,
      rollout: flag.rolloutPercentage,
      expiresAt: Date.now() + CACHE_TTL_MS,
    })

    return this.evaluateRollout(flag.isEnabled, flag.rolloutPercentage)
  }

  /**
   * Check if a feature is enabled for a specific organization.
   * Org overrides take precedence over global flags.
   */
  async isEnabledForOrg(key: FeatureFlagKey, organizationId: string): Promise<boolean> {
    const cacheKey = `${organizationId}:${key}`
    const cached = orgFlagCache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.isEnabled
    }

    const orgFeaturesResult = await featureFlagRepository.findOrgFeatures(organizationId)
    if (orgFeaturesResult.success) {
      const orgFeature = orgFeaturesResult.data.find((f) => f.featureKey === key)
      if (orgFeature !== undefined) {
        orgFlagCache.set(cacheKey, { isEnabled: orgFeature.isEnabled, expiresAt: Date.now() + CACHE_TTL_MS })
        return orgFeature.isEnabled
      }
    }

    // Fall back to global flag
    return this.isEnabled(key)
  }

  /**
   * Enable a global feature flag.
   */
  async enable(key: FeatureFlagKey): Promise<Result<boolean>> {
    const result = await featureFlagRepository.setFeatureEnabled(key, true)
    if (result.success) {
      this.invalidateFlagCache(key)
      logger.info(`[FeatureFlagService] Feature '${key}' enabled globally`)
    }
    return result
  }

  /**
   * Disable a global feature flag.
   */
  async disable(key: FeatureFlagKey): Promise<Result<boolean>> {
    const result = await featureFlagRepository.setFeatureEnabled(key, false)
    if (result.success) {
      this.invalidateFlagCache(key)
      logger.info(`[FeatureFlagService] Feature '${key}' disabled globally`)
    }
    return result
  }

  /**
   * Set rollout percentage for a feature (0-100).
   */
  async rollout(key: FeatureFlagKey, percentage: number): Promise<Result<boolean>> {
    const result = await featureFlagRepository.setRolloutPercentage(key, percentage)
    if (result.success) {
      this.invalidateFlagCache(key)
      logger.info(`[FeatureFlagService] Feature '${key}' rollout set to ${percentage}%`)
    }
    return result
  }

  /**
   * Enable/disable a feature for a specific organization.
   */
  async setOrgFeature(
    key: FeatureFlagKey,
    organizationId: string,
    isEnabled: boolean,
    enabledBy: string
  ): Promise<Result<OrganizationFeature>> {
    const result = await featureFlagRepository.setOrgFeatureEnabled(organizationId, key, isEnabled, enabledBy)
    if (result.success) {
      this.invalidateOrgCache(organizationId, key)
    }
    return result
  }

  /**
   * Get all flags (for admin UI).
   */
  async getAllFlags(): Promise<Result<FeatureFlag[]>> {
    return await featureFlagRepository.findAll()
  }

  /**
   * Get all org-enabled features.
   */
  async getOrgFeatures(organizationId: string): Promise<Result<OrganizationFeature[]>> {
    return await featureFlagRepository.findOrgFeatures(organizationId)
  }

  private evaluateRollout(isEnabled: boolean, rolloutPercentage: number): boolean {
    if (!isEnabled) return false
    if (rolloutPercentage >= 100) return true
    if (rolloutPercentage <= 0) return false
    // Stable rollout (deterministic for the same process)
    return Math.random() * 100 < rolloutPercentage
  }
}

export const featureFlagService = new FeatureFlagService()
