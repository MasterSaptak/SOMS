import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import { updatePreferencesSchema, type UpdatePreferencesInput } from '@/lib/validators/preferences.validator'
import { DEFAULT_USER_PREFERENCES, type UserPreferences } from '@/types/preferences'

export class PreferencesService {
  /**
   * Get user preferences, returning defaults if not set.
   */
  async getPreferences(employeeId: string): Promise<Result<UserPreferences>> {
    try {
      const client = await createClient()
      const { data, error } = await client
        .from('user_preferences')
        .select('*')
        .eq('employee_id' as never, employeeId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows found, that's fine
        return failure(new Error(error.message))
      }

      if (!data) {
        return success({ ...DEFAULT_USER_PREFERENCES })
      }

      // Merge DB data with defaults to handle new preference keys
      const stored = data as Record<string, unknown>
      const merged: UserPreferences = {
        ...DEFAULT_USER_PREFERENCES,
        ...(typeof stored.widget_order === 'object' && stored.widget_order !== null
          ? stored.widget_order
          : {}),
        theme: (stored.theme as UserPreferences['theme']) || DEFAULT_USER_PREFERENCES.theme,
      }

      return success(merged)
    } catch (err) {
      logger.error('[PreferencesService] getPreferences failed', err)
      return failure(err as Error)
    }
  }

  /**
   * Update user preferences (partial update).
   */
  async updatePreferences(employeeId: string, input: UpdatePreferencesInput): Promise<Result<UserPreferences>> {
    const validation = updatePreferencesSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid preferences data', validation.error.flatten().fieldErrors))
    }

    try {
      const client = await createClient()

      // Get existing preferences to merge
      const existingResult = await this.getPreferences(employeeId)
      const existing = existingResult.success ? existingResult.data : { ...DEFAULT_USER_PREFERENCES }

      const updated: UserPreferences = { ...existing, ...validation.data }

      const { data, error } = await client
        .from('user_preferences')
        .upsert({
          employee_id: employeeId,
          theme: updated.theme,
          widget_order: updated.dashboardLayout as unknown as object,
          quick_actions: updated.workingHours as unknown as object,
          updated_at: new Date().toISOString(),
        } as never, { onConflict: 'employee_id' })
        .select()
        .single()

      if (error) return failure(new Error(error.message))

      logger.info('[PreferencesService] Preferences updated', { employeeId })
      return success(updated)
    } catch (err) {
      logger.error('[PreferencesService] updatePreferences failed', err)
      return failure(err as Error)
    }
  }

  /**
   * Reset preferences to defaults.
   */
  async resetPreferences(employeeId: string): Promise<Result<UserPreferences>> {
    try {
      const client = await createClient()
      await client
        .from('user_preferences')
        .delete()
        .eq('employee_id' as never, employeeId)

      logger.info('[PreferencesService] Preferences reset', { employeeId })
      return success({ ...DEFAULT_USER_PREFERENCES })
    } catch (err) {
      logger.error('[PreferencesService] resetPreferences failed', err)
      return failure(err as Error)
    }
  }
}

export const preferencesService = new PreferencesService()
