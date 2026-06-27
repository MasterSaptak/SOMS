// @ts-nocheck
/**
 * People Repository
 * 
 * Handles all database operations for the People directory.
 * Uses the service role client to bypass RLS for admin operations.
 */

import { Result, success, failure } from '@/lib/utils/result'

export interface PersonSummary {
  id: string
  user_id: string | null
  employee_id_string: string | null
  full_name: string
  email: string
  phone: string | null
  profile_photo: string | null
  employment_status: string
  employment_type: string | null
  lifecycle_status: string | null
  department: string | null
  designation: string | null
  organization_id: string | null
  organization_name: string | null
  reports_to_employee_id: string | null
  manager_name: string | null
  joining_date: string | null
  created_at: string
  updated_at: string
}

export interface PersonDetail extends PersonSummary {
  gender: string | null
  blood_group: string | null
  nationality: string | null
  marital_status: string | null
  personal_email: string | null
  address: string | null
  emergency_contact: string | null
  aadhaar_nid: string | null
  passport_no: string | null
  visa_status: string | null
  driving_license: string | null
  date_of_birth: string | null
  branch_id: string | null
  department_id: string | null
  designation_id: string | null
  team_id: string | null
  work_location_id: string | null
  cost_center_id: string | null
  profile_role: string | null
}

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  // Dynamic import to allow both server and client-side usage
  const { createClient } = require('@supabase/supabase-js')
  return createClient(supabaseUrl, supabaseKey)
}

export class PeopleRepository {

  /**
   * Get all people across the system or filtered by organization
   */
  async findAll(filters?: {
    organizationId?: string | null
    search?: string
    status?: string
    department?: string
    employmentType?: string
    limit?: number
    offset?: number
  }): Promise<Result<{ data: PersonSummary[]; total: number }>> {
    try {
      const sb = getAdminClient()

      let query = sb
        .from('employees')
        .select('id, user_id, employee_id_string, full_name, email, phone, profile_photo, employment_status, employment_type, lifecycle_status, department, designation, organization_id, reports_to_employee_id, joining_date, created_at, updated_at', { count: 'exact' })

      if (filters?.organizationId) {
        query = query.eq('organization_id', filters.organizationId)
      }

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_id_string.ilike.%${filters.search}%`)
      }

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('employment_status', filters.status)
      }

      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department', filters.department)
      }

      if (filters?.employmentType && filters.employmentType !== 'all') {
        query = query.eq('employment_type', filters.employmentType)
      }

      const limit = filters?.limit || 50
      const offset = filters?.offset || 0

      query = query.order('full_name').range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      // Enrich with organization names
      const orgIds = [...new Set((data || []).map((e: any) => e.organization_id).filter(Boolean))]
      let orgMap: Record<string, string> = {}
      if (orgIds.length > 0) {
        const { data: orgs } = await sb
          .from('organizations')
          .select('id, name')
          .in('id', orgIds)
        orgs?.forEach((o: any) => { orgMap[o.id] = o.name })
      }

      // Enrich with manager names
      const mgrIds = [...new Set((data || []).map((e: any) => e.reports_to_employee_id).filter(Boolean))]
      let mgrMap: Record<string, string> = {}
      if (mgrIds.length > 0) {
        const { data: mgrs } = await sb
          .from('employees')
          .select('id, full_name')
          .in('id', mgrIds)
        mgrs?.forEach((m: any) => { mgrMap[m.id] = m.full_name })
      }

      const summaries: PersonSummary[] = (data || []).map((row: any) => ({
        ...row,
        organization_name: orgMap[row.organization_id] || null,
        manager_name: mgrMap[row.reports_to_employee_id] || null,
      }))

      return success({ data: summaries, total: count || 0 })
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Get a single person's full detail
   */
  async findById(employeeId: string): Promise<Result<PersonDetail>> {
    try {
      const sb = getAdminClient()

      const { data, error } = await sb
        .from('employees')
        .select('id, user_id, organization_id, department_id, team_id, designation_id, work_location_id, manager_id, employee_id_string, full_name, email, phone, profile_photo, joining_date, employment_status, date_of_birth, gender, blood_group, nationality, marital_status, personal_email, address, aadhaar_nid, passport_no, visa_status, driving_license, department, designation, created_at, updated_at')
        .eq('id', employeeId)
        .single()

      if (error) throw error

      // Get profile role
      let profileRole = null
      if (data.user_id) {
        const { data: profile } = await sb
          .from('profiles')
          .select('role')
          .eq('id', data.user_id)
          .single()
        profileRole = profile?.role || null
      }

      // Get org name
      let orgName = null
      if (data.organization_id) {
        const { data: org } = await sb
          .from('organizations')
          .select('name')
          .eq('id', data.organization_id)
          .single()
        orgName = org?.name || null
      }

      // Get manager name
      let mgrName = null
      if (data.reports_to_employee_id) {
        const { data: mgr } = await sb
          .from('employees')
          .select('full_name')
          .eq('id', data.reports_to_employee_id)
          .single()
        mgrName = mgr?.full_name || null
      }

      const detail: PersonDetail = {
        ...data,
        organization_name: orgName,
        manager_name: mgrName,
        profile_role: profileRole,
      }

      return success(detail)
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Update a person's record
   */
  async update(employeeId: string, updates: Partial<PersonDetail>): Promise<Result<void>> {
    try {
      const sb = getAdminClient()
      const { error } = await sb
        .from('employees')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', employeeId)

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Create a new person
   */
  async create(data: {
    full_name: string
    email: string
    organization_id?: string
    phone?: string
    department?: string
    designation?: string
    employment_type?: string
    employment_status?: string
    lifecycle_status?: string
    joining_date?: string
  }): Promise<Result<string>> {
    try {
      const sb = getAdminClient()
      const { data: created, error } = await sb
        .from('employees')
        .insert({
          ...data,
          employment_status: data.employment_status || 'active',
          lifecycle_status: data.lifecycle_status || 'active',
          employment_type: data.employment_type || 'permanent',
          created_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) throw error
      return success(created.id)
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Get unique departments for filter dropdowns
   */
  async getDepartments(organizationId?: string): Promise<Result<string[]>> {
    try {
      const sb = getAdminClient()
      let query = sb.from('employees').select('department')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data, error } = await query
      if (error) throw error
      const depts = [...new Set((data || []).map((d: any) => d.department).filter(Boolean))]
      return success(depts as string[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Get all employees as options (for manager assignment, etc.)
   */
  async getEmployeeOptions(organizationId?: string): Promise<Result<{ id: string; full_name: string }[]>> {
    try {
      const sb = getAdminClient()
      let query = sb.from('employees').select('id, full_name').order('full_name')
      if (organizationId) query = query.eq('organization_id', organizationId)
      const { data, error } = await query
      if (error) throw error
      return success(data || [])
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(employeeIds: string[], status: string): Promise<Result<void>> {
    try {
      const sb = getAdminClient()
      const { error } = await sb
        .from('employees')
        .update({ employment_status: status, updated_at: new Date().toISOString() })
        .in('id', employeeIds)
      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }
  /**
   * Delete a person
   */
  async delete(employeeId: string): Promise<Result<void>> {
    try {
      const sb = getAdminClient()
      const { error } = await sb
        .from('employees')
        .delete()
        .eq('id', employeeId)
      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const peopleRepository = new PeopleRepository()
