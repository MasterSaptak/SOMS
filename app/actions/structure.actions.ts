'use server'

import { createClient } from '@/lib/supabase/server'
import { permissionService } from '@/lib/services/permission.service'
import { Result, failure, success } from '@/lib/utils/result'
import { AuthError } from '@/lib/errors'
import type { Department, Designation, WorkLocation } from '@/lib/types'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    console.warn('[getAuthContext] No auth found, using dummy user for Demo environment.')
    return { supabase, userId: 'dummy-demo-user' }
  }
  return { supabase, userId: user.id }
}

export async function getDepartmentsAction(orgId?: string): Promise<Result<Department[]>> {
  try {
    const { userId, supabase } = await getAuthContext()
    
    let targetOrgId = orgId
    if (!targetOrgId) {
      const { data: orgData } = await supabase.from('organizations').select('id').eq('is_demo', true).single()
      if (orgData) targetOrgId = orgData.id
      else return success([]) // No demo org found
    }

    await permissionService.authorize(userId, targetOrgId as string, 'employee.read')

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('organization_id', targetOrgId)

    if (error) throw error

    return success(data.map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      headId: row.head_id,
      parentId: row.parent_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })))
  } catch (err) {
    return failure(err as Error)
  }
}

export async function getDesignationsAction(orgId?: string): Promise<Result<Designation[]>> {
  try {
    const { userId, supabase } = await getAuthContext()

    let targetOrgId = orgId
    if (!targetOrgId) {
      const { data: orgData } = await supabase.from('organizations').select('id').eq('is_demo', true).single()
      if (orgData) targetOrgId = orgData.id
      else return success([])
    }

    await permissionService.authorize(userId, targetOrgId as string, 'employee.read')

    const { data, error } = await supabase
      .from('designations')
      .select('*')
      .eq('organization_id', targetOrgId)

    if (error) throw error

    return success(data.map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      title: row.title,
      level: row.level,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })))
  } catch (err) {
    return failure(err as Error)
  }
}

export async function getWorkLocationsAction(orgId?: string): Promise<Result<WorkLocation[]>> {
  try {
    const { userId, supabase } = await getAuthContext()

    let targetOrgId = orgId
    if (!targetOrgId) {
      const { data: orgData } = await supabase.from('organizations').select('id').eq('is_demo', true).single()
      if (orgData) targetOrgId = orgData.id
      else return success([])
    }

    await permissionService.authorize(userId, targetOrgId as string, 'employee.read')

    const { data, error } = await supabase
      .from('work_locations')
      .select('*')
      .eq('organization_id', targetOrgId)

    if (error) throw error

    return success(data.map((row: any) => ({
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      address: row.address,
      timezone: row.timezone,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })))
  } catch (err) {
    return failure(err as Error)
  }
}
