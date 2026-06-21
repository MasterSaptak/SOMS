import { BaseRepository } from '@/lib/repositories/base.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'
import { createClient } from '@/lib/supabase/server'
import { NotFoundError } from '@/lib/errors'
import type { Employee, EmploymentDetails, EmergencyContact, EmployeeSkill } from '@/lib/types'

async function getUntypedClient(): Promise<any> {
  return await createClient()
}

export class EmployeeRepository extends BaseRepository<'employees'> {
  constructor() {
    super('employees')
  }

  async findById(id: string): Promise<Result<Employee>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employees')
        .select(`
          *,
          department:departments(*),
          team:teams(*),
          designation:designations(*),
          workLocation:work_locations(*),
          manager:employees!manager_id(id, full_name, email, profile_photo)
        `)
        .eq('id', id)
        .single()

      if (error || !data) return failure(new NotFoundError('Employee not found'))
      
      return success(this.mapToEntity(data))
    } catch (err) {
      logger.error('[EmployeeRepository] findById failed', err)
      return failure(err as Error)
    }
  }

  async findByUserId(userId: string): Promise<Result<Employee>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employees')
        .select(`
          *,
          department:departments(*),
          team:teams(*),
          designation:designations(*),
          workLocation:work_locations(*),
          manager:employees!manager_id(id, full_name, email, profile_photo)
        `)
        .eq('user_id', userId)
        .single()

      if (error || !data) return failure(new NotFoundError('Employee not found'))
      
      return success(this.mapToEntity(data))
    } catch (err) {
      logger.error('[EmployeeRepository] findByUserId failed', err)
      return failure(err as Error)
    }
  }

  private mapToEntity(data: any): Employee {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      departmentId: data.department_id,
      teamId: data.team_id,
      designationId: data.designation_id,
      workLocationId: data.work_location_id,
      managerId: data.manager_id,
      employeeCode: data.employee_id_string || '',
      firstName: data.full_name?.split(' ')[0] || '',
      lastName: data.full_name?.split(' ').slice(1).join(' ') || '',
      phone: data.phone || '',
      avatarUrl: data.profile_photo,
      joinDate: data.joining_date || '',
      status: data.employment_status || 'active',
      createdAt: data.created_at || '',
      department: data.department,
      team: data.team,
      designation: data.designation,
      workLocation: data.workLocation,
      manager: data.manager ? { 
        id: data.manager.id, 
        firstName: data.manager.full_name?.split(' ')[0], 
        lastName: data.manager.full_name?.split(' ').slice(1).join(' '),
        avatarUrl: data.manager.profile_photo
      } as Employee : undefined
    }
  }

  async findByOrganizationId(orgId: string): Promise<Result<Employee[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employees')
        .select(`
          *,
          department:departments(*),
          team:teams(*),
          designation:designations(*),
          workLocation:work_locations(*)
        `)
        .eq('organization_id', orgId)
        .order('full_name')

      if (error) throw error

      const mapped = data.map((d: any) => this.mapToEntity(d))

      return success(mapped as Employee[])
    } catch (err) {
      logger.error('[EmployeeRepository] findByOrganizationId failed', err)
      return failure(err as Error)
    }
  }

  async findEmploymentDetails(employeeId: string): Promise<Result<EmploymentDetails>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employment_details')
        .select('*')
        .eq('employee_id', employeeId)
        .single()

      if (error || !data) return failure(new NotFoundError('Employment details not found'))
      
      const mapped: EmploymentDetails = {
        id: data.id,
        employeeId: data.employee_id,
        employmentType: data.employment_type,
        probationEndDate: data.probation_end_date,
        noticePeriodDays: data.notice_period_days,
        workSchedule: data.work_schedule,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return success(mapped)
    } catch (err) {
      logger.error('[EmployeeRepository] findEmploymentDetails failed', err)
      return failure(err as Error)
    }
  }

  async findEmergencyContacts(employeeId: string): Promise<Result<EmergencyContact[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('emergency_contacts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      
      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        employeeId: d.employee_id,
        name: d.name,
        relationship: d.relationship,
        phone: d.phone,
        email: d.email,
        isPrimary: d.is_primary,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }))

      return success(mapped as EmergencyContact[])
    } catch (err) {
      logger.error('[EmployeeRepository] findEmergencyContacts failed', err)
      return failure(err as Error)
    }
  }

  async findSkills(employeeId: string): Promise<Result<EmployeeSkill[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employee_skills')
        .select('*')
        .eq('employee_id', employeeId)
        .order('skill_name')

      if (error) throw error

      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        employeeId: d.employee_id,
        skillName: d.skill_name,
        proficiency: d.proficiency,
        isVerified: d.is_verified,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }))

      return success(mapped as EmployeeSkill[])
    } catch (err) {
      logger.error('[EmployeeRepository] findSkills failed', err)
      return failure(err as Error)
    }
  }
}

export const employeeRepository = new EmployeeRepository()
