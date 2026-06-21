'use server'

import { createClient } from '@/lib/supabase/server'
import { preferencesService } from '@/lib/services/preferences.service'
import { Result, failure } from '@/lib/utils/result'
import { AuthError } from '@/lib/errors'
import type { UserPreferences } from '@/types/preferences'
import type { UpdatePreferencesInput } from '@/lib/validators/preferences.validator'

async function getAuthEmployeeId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new AuthError('Not authenticated')

  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!employee) throw new AuthError('Employee profile not found')
  return employee.id
}

export async function getPreferencesAction(): Promise<Result<UserPreferences>> {
  try {
    const employeeId = await getAuthEmployeeId()
    return await preferencesService.getPreferences(employeeId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to get preferences'))
  }
}

export async function updatePreferencesAction(
  input: UpdatePreferencesInput
): Promise<Result<UserPreferences>> {
  try {
    const employeeId = await getAuthEmployeeId()
    return await preferencesService.updatePreferences(employeeId, input)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to update preferences'))
  }
}

export async function resetPreferencesAction(): Promise<Result<UserPreferences>> {
  try {
    const employeeId = await getAuthEmployeeId()
    return await preferencesService.resetPreferences(employeeId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to reset preferences'))
  }
}
