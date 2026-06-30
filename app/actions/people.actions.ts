// @ts-nocheck
'use server'

import { peopleService, PeopleFilters } from '@/lib/services/people.service'

export async function getPeopleAction(filters: PeopleFilters) {
  return peopleService.list(filters)
}

export async function getPersonProfileAction(employeeId: string) {
  return peopleService.getProfile(employeeId)
}

export async function updatePersonAction(employeeId: string, updates: Record<string, any>) {
  return peopleService.updateProfile(employeeId, updates)
}

export async function createPersonAction(data: {
  full_name: string
  email: string
  organization_id?: string
  organization_member_id?: string
  user_id?: string
  phone?: string
  department?: string
  designation?: string
  employment_type?: string
  lifecycle_status?: string
  joining_date?: string
}) {
  return peopleService.createPerson(data)
}

export async function getFilterOptionsAction(organizationId?: string) {
  return peopleService.getFilterOptions(organizationId)
}

export async function getEmployeeOptionsAction(organizationId?: string) {
  return peopleService.getEmployeeOptions(organizationId)
}

export async function bulkUpdateStatusAction(employeeIds: string[], status: string) {
  return peopleService.bulkUpdateStatus(employeeIds, status)
}

import { createClient } from '@/lib/supabase/server'
import { permissionService } from '@/lib/services/permission.service'
import { failure } from '@/lib/utils/result'
import { revalidatePath } from 'next/cache'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!error && user) {
    if (user.email === 'saptech.online009@gmail.com') {
      permissionService.registerPrimeAdmin(user.id)
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const adminSupabase = createAdmin(supabaseUrl, supabaseKey)

    const { data: orgMembers } = await (adminSupabase as any)
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)

    if (orgMembers && orgMembers.length > 0) {
      return { supabase, userId: user.id, orgId: orgMembers[0].organization_id }
    }
    
    // For users not in organization_members, just return the user id
    return { supabase, userId: user.id, orgId: '00000000-0000-0000-0000-000000000000' }
  }

  return { supabase, userId: '00000000-0000-0000-0000-000000000000', orgId: '00000000-0000-0000-0000-000000000000' }
}

export async function deletePersonAction(employeeId: string) {
  try {
    const { userId, orgId } = await getAuthContext()
    
    // For admin users: check profile role directly as a bypass
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const { createClient: createAdmin } = await import('@supabase/supabase-js')
    const adminSb = createAdmin(supabaseUrl, supabaseKey)
    const { data: profile } = await adminSb.from('profiles').select('role').eq('id', userId).single()
    const isAdminRole = profile && ['super_admin', 'admin'].includes(profile.role)
    
    if (!isAdminRole) {
      const authRes = await permissionService.authorize(userId, orgId, 'employee.delete' as any)
      if (!authRes.success) return authRes as any
    }

    const res = await peopleService.deletePerson(employeeId)
    
    if (res.success) {
      revalidatePath('/admin/hr/people')
      revalidatePath('/admin/hr')
    }
    
    return res
  } catch (err) {
    return failure(err as Error)
  }
}

