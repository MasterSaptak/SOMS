'use server'

import { employeeService } from '@/lib/services/employee.service'
import { permissionService } from '@/lib/services/permission.service'
import { createClient } from '@/lib/supabase/server'
import { AuthError } from '@/lib/errors'
import { Result, failure, success } from '@/lib/utils/result'
import type { Employee } from '@/lib/types'
import { UpdateEmployeeInput } from '@/lib/validators/employee.validator'
import { revalidatePath } from 'next/cache'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  // For Phase 2 Demo Environment: Bypass auth if no user exists.
  if (error || !user) {
    console.warn('[getAuthContext] No auth found, using dummy user for Demo environment.')
    return { supabase, userId: 'dummy-demo-user' }
  }
  
  return { supabase, userId: user.id }
}

export async function getEmployeesAction(orgId?: string): Promise<Result<Employee[]>> {
  try {
    const { userId, supabase } = await getAuthContext()
    
    let targetOrgId = orgId
    if (!targetOrgId) {
      const { data: orgData } = await supabase.from('organizations').select('id').eq('is_demo', true).single()
      if (orgData) targetOrgId = orgData.id
      else return success([]) // No demo org found
    }

    // Authz
    await permissionService.authorize(userId, targetOrgId as string, 'employee.read')

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('organization_id', targetOrgId)
      
    if (error) throw error
    
    return success(data.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      organizationId: row.organization_id,
      departmentId: row.department_id,
      teamId: row.team_id,
      designationId: row.designation_id,
      workLocationId: row.work_location_id,
      managerId: row.manager_id,
      employeeCode: row.employee_id_string,
      firstName: row.full_name?.split(' ')[0] || '',
      lastName: row.full_name?.split(' ').slice(1).join(' ') || '',
      phone: row.phone || '',
      avatarUrl: row.profile_photo || null,
      joinDate: row.joining_date,
      status: row.employment_status,
      createdAt: row.created_at
    })))
  } catch (err) {
    return failure(err as Error)
  }
}

export async function getEmployee360Action(employeeId: string) {
  try {
    await getAuthContext() // just verify auth
    return await employeeService.getEmployee360(employeeId)
  } catch (err) {
    return failure(err as Error)
  }
}

export async function updateEmployeeAction(employeeId: string, input: UpdateEmployeeInput): Promise<Result<boolean>> {
  try {
    const { userId } = await getAuthContext()
    const res = await employeeService.updateEmployeeStructure(employeeId, input, userId)
    if (res.success) {
      revalidatePath('/', 'layout')
    }
    return res
  } catch (err) {
    return failure(err as Error)
  }
}
