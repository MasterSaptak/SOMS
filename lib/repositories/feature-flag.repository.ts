import { createClient as createServerClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'
import type { FeatureFlag, OrganizationFeature, FeatureFlagKey } from '@/types/preferences'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSB(): Promise<any> {
  const client = await createServerClient()
  return client as any
}

export class FeatureFlagRepository {
  async findAll(): Promise<Result<FeatureFlag[]>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('features')
        .select('id, key, name, description, is_enabled, rollout_percentage, created_at, updated_at')
        .order('name', { ascending: true })

      if (error) return failure(new Error(error.message))
      return success(((data || []) as object[]).map((row) => this.mapToFeatureFlag(row as Record<string, unknown>)))
    } catch (err) {
      logger.error('[FeatureFlagRepository] findAll failed', err)
      return failure(err as Error)
    }
  }

  async findByKey(key: FeatureFlagKey): Promise<Result<FeatureFlag>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('features')
        .select('id, key, name, description, is_enabled, rollout_percentage, created_at, updated_at')
        .eq('key', key)
        .single()

      if (error || !data) return failure(new Error(`Feature flag '${key}' not found`))
      return success(this.mapToFeatureFlag(data as Record<string, unknown>))
    } catch (err) {
      logger.error('[FeatureFlagRepository] findByKey failed', err)
      return failure(err as Error)
    }
  }

  async findOrgFeatures(organizationId: string): Promise<Result<OrganizationFeature[]>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('organization_features')
        .select('id, organization_id, feature_key, is_enabled, enabled_at, enabled_by')
        .eq('organization_id', organizationId)

      if (error) return failure(new Error(error.message))
      return success((data || []) as object[] as OrganizationFeature[])
    } catch (err) {
      logger.error('[FeatureFlagRepository] findOrgFeatures failed', err)
      return failure(err as Error)
    }
  }

  async setFeatureEnabled(key: FeatureFlagKey, isEnabled: boolean): Promise<Result<boolean>> {
    try {
      const sb = await getSB()
      const { error } = await sb
        .from('features')
        .update({ is_enabled: isEnabled })
        .eq('key', key)

      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[FeatureFlagRepository] setFeatureEnabled failed', err)
      return failure(err as Error)
    }
  }

  async setOrgFeatureEnabled(
    organizationId: string,
    featureKey: FeatureFlagKey,
    isEnabled: boolean,
    enabledBy: string
  ): Promise<Result<OrganizationFeature>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('organization_features')
        .upsert({
          organization_id: organizationId,
          feature_key: featureKey,
          is_enabled: isEnabled,
          enabled_at: isEnabled ? new Date().toISOString() : null,
          enabled_by: isEnabled ? enabledBy : null,
        }, { onConflict: 'organization_id,feature_key' })
        .select()
        .single()

      if (error) return failure(new Error(error.message))
      return success(data as object as OrganizationFeature)
    } catch (err) {
      logger.error('[FeatureFlagRepository] setOrgFeatureEnabled failed', err)
      return failure(err as Error)
    }
  }

  async setRolloutPercentage(key: FeatureFlagKey, percentage: number): Promise<Result<boolean>> {
    try {
      const sb = await getSB()
      const { error } = await sb
        .from('features')
        .update({ rollout_percentage: Math.max(0, Math.min(100, percentage)) })
        .eq('key', key)

      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[FeatureFlagRepository] setRolloutPercentage failed', err)
      return failure(err as Error)
    }
  }

  private mapToFeatureFlag(row: Record<string, unknown>): FeatureFlag {
    return {
      id: row.id as string,
      key: row.key as FeatureFlagKey,
      name: row.name as string,
      description: (row.description as string) || null,
      isEnabled: (row.is_enabled as boolean) ?? false,
      rolloutPercentage: (row.rollout_percentage as number) ?? 100,
      createdAt: (row.created_at as string) || '',
      updatedAt: (row.updated_at as string) || '',
    }
  }
}

export const featureFlagRepository = new FeatureFlagRepository()
