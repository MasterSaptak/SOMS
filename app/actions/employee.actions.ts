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
  
  if (!error && user) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const adminSupabase = createAdmin(supabaseUrl, supabaseKey)

    const { data: orgMembers } = await adminSupabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (orgMembers && orgMembers.length > 0) {
      return { supabase, userId: user.id, orgId: orgMembers[0].organization_id }
    }
  }

  console.warn('[getAuthContext] No auth found or no org member found, using dummy UUIDs.')
  
  // Attempt to get any existing organization for demo purposes
  const { data: orgData } = await (supabase as any).from('organizations').select('id').limit(1).single()
  const orgId = orgData ? orgData.id : '00000000-0000-0000-0000-000000000000'
  const userId = '00000000-0000-0000-0000-000000000000'

  return { supabase, userId, orgId }
}

export async function getEmployeesAction(orgId?: string): Promise<Result<Employee[]>> {
  try {
    const { userId, orgId: defaultOrgId, supabase } = await getAuthContext()
    const targetOrgId = orgId || defaultOrgId

    await permissionService.authorize(userId, targetOrgId, 'employee.read')

    const { data, error } = await (supabase as any)
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
    const { userId, orgId } = await getAuthContext()
    return await employeeService.getEmployee360(employeeId, userId, orgId)
  } catch (err) {
    return failure(err as Error)
  }
}

export async function updateEmployeeAction(employeeId: string, input: UpdateEmployeeInput): Promise<Result<boolean>> {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.updateEmployeeStructure(employeeId, input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

export async function updateEmployeeBasicInfoAction(employeeId: string, input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    
    // Check if this is self-edit: the employee's user_id matches the acting user
    const { employeeRepository } = await import('@/lib/repositories/employee.repository')
    const empRes = await employeeRepository.findById(employeeId)
    const isSelf = empRes.success && empRes.data.userId === userId
    
    // Only require permission for editing OTHER employees
    if (!isSelf) {
      await permissionService.authorize(userId, orgId, 'employee.profile.edit')
    }

    // Map the camelCase/custom payload to DB snake_case columns
    const updatePayload: any = {}
    if (input.full_name !== undefined) updatePayload.full_name = input.full_name
    if (input.phone !== undefined) updatePayload.phone = input.phone
    if (input.email !== undefined) updatePayload.email = input.email
    if (input.profile_photo !== undefined) updatePayload.profile_photo = input.profile_photo
    // For relationships that might be stored as text depending on the current schema state
    if (input.designation !== undefined) updatePayload.designation = input.designation
    if (input.department !== undefined) updatePayload.department = input.department
    
    // date_of_birth exists in the employees table
    if (input.date_of_birth !== undefined) updatePayload.date_of_birth = input.date_of_birth
    // if (input.manager_id !== undefined) updatePayload.manager_id = input.manager_id

    const { employeeRepository: empRepo } = await import('@/lib/repositories/employee.repository')
    const res = await empRepo.update(employeeId, updatePayload)
    
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

export async function updateEmploymentDetailsAction(employeeId: string, input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.updateEmploymentDetails(employeeId, input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

export async function addEmergencyContactAction(input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.addEmergencyContact(input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

export async function deleteEmergencyContactAction(employeeId: string, contactId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.deleteEmergencyContact(employeeId, contactId, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

export async function getAllSkillsAction() {
  try {
    await getAuthContext()
    return await employeeService.getAllSkills()
  } catch (err) {
    return failure(err as Error)
  }
}

export async function addEmployeeSkillAction(input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.addEmployeeSkill(input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

export async function deleteEmployeeSkillAction(employeeId: string, skillId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.deleteEmployeeSkill(employeeId, skillId, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

// Master Record Entities Actions

export async function addEmployeeDocumentAction(input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.addDocument(input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function deleteEmployeeDocumentAction(employeeId: string, documentId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.deleteDocument(employeeId, documentId, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function addEmployeeCertificationAction(input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.addCertification(input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function deleteEmployeeCertificationAction(employeeId: string, certId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.deleteCertification(employeeId, certId, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function addEmployeeEducationAction(input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.addEducation(input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function deleteEmployeeEducationAction(employeeId: string, eduId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.deleteEducation(employeeId, eduId, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function addEmployeeExperienceAction(input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.addExperience(input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function deleteEmployeeExperienceAction(employeeId: string, expId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.deleteExperience(employeeId, expId, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function updateEmployeePreferenceAction(employeeId: string, input: any) {
  try {
    const { userId, orgId } = await getAuthContext()
    const res = await employeeService.updatePreferences(employeeId, input, userId, orgId)
    if (res.success) revalidatePath('/', 'layout')
    return res
  } catch (err) { return failure(err as Error) }
}

export async function getEmployeeSummaryAction(employeeId: string) {
  try {
    const { supabase, userId, orgId } = await getAuthContext()
    await permissionService.authorize(userId, orgId, 'employee.summary.view')

    const [tasksRes, leavesRes, attendanceRes] = await Promise.all([
      (supabase as any).from('task_assignments').select('task_id, tasks(*)').eq('employee_id', employeeId).limit(5).order('created_at', { ascending: false }),
      (supabase as any).from('leaves').select('*').eq('employee_id', employeeId).limit(5).order('created_at', { ascending: false }),
      (supabase as any).from('attendance').select('*').eq('employee_id', employeeId).limit(30).order('date', { ascending: false })
    ])
    
    return success({
      tasks: tasksRes.data || [],
      leaves: leavesRes.data || [],
      attendance: attendanceRes.data || []
    })
  } catch (err) {
    return failure(err as Error)
  }
}
