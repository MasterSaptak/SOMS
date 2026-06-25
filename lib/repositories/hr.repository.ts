// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'

export type EmployeeStatus = 'pending' | 'active' | 'probation' | 'on_leave' | 'suspended' | 'terminated' | 'inactive'

export interface EmployeeSummary {
  id: string
  organization_id: string
  user_id: string
  employee_id_string: string | null
  full_name: string
  email: string
  phone: string | null
  profile_photo: string | null
  status: EmployeeStatus
  department: {
    id: string
    name: string
  } | null
  designation: {
    id: string
    title: string
  } | null
  manager_id: string | null
}

export interface HRDashboardStats {
  totalEmployees: number
  active: number
  inactive: number
  onLeave: number
  probation: number
  contractors: number
  departments: number
  teams: number
  managers: number
  newHires: number
  terminations: number
}

export interface EmployeeDetail extends EmployeeSummary {
  address: string | null
  emergency_contact: string | null
  joining_date: string | null
  date_of_birth: string | null
  manager: { id: string; full_name: string; email: string } | null
  teams: { id: string; name: string; role_in_team: string }[]
  projects: { id: string; name: string; role: string; start_date: string; end_date: string | null }[]
}

export interface EmployeePositionHistory {
  id: string
  title: string
  department_name: string | null
  start_date: string
  end_date: string | null
  change_reason: string | null
}

export interface EmployeeSkill {
  id: string
  skill_name: string
  proficiency_level: string
}

export interface EmployeeCertification {
  id: string
  name: string
  issuing_authority: string
  issue_date: string
  expiry_date: string | null
}

export interface EmployeeDocument {
  id: string
  document_type: string
  file_url: string
  file_name: string
  created_at: string
}

export class HRRepository {
  /**
   * Retrieves all active (non-deleted) employees for an organization as summaries.
   */
  async findActiveEmployees(organizationId: string): Promise<Result<EmployeeSummary[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id, organization_id, user_id, employee_id_string, full_name, email, phone, profile_photo, status, manager_id,
          departments!department_id(id, name),
          designations!designation_id(id, title)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('full_name')

      if (error) throw error

      const summaries: EmployeeSummary[] = data.map((row: any) => ({
        id: row.id,
        organization_id: row.organization_id,
        user_id: row.user_id,
        employee_id_string: row.employee_id_string,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        profile_photo: row.profile_photo,
        status: row.status,
        manager_id: row.manager_id,
        department: row.departments ? { id: row.departments.id, name: row.departments.name } : null,
        designation: row.designations ? { id: row.designations.id, title: row.designations.title } : null,
      }))

      return success(summaries)
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Retrieves deleted employees (Recycle Bin functionality)
   */
  async findDeletedEmployees(organizationId: string): Promise<Result<EmployeeSummary[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .select(`
          id, organization_id, user_id, employee_id_string, full_name, email, phone, profile_photo, status, manager_id,
          departments!department_id(id, name),
          designations!designation_id(id, title)
        `)
        .eq('organization_id', organizationId)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })

      if (error) throw error

      const summaries: EmployeeSummary[] = data.map((row: any) => ({
        id: row.id,
        organization_id: row.organization_id,
        user_id: row.user_id,
        employee_id_string: row.employee_id_string,
        full_name: row.full_name,
        email: row.email,
        phone: row.phone,
        profile_photo: row.profile_photo,
        status: row.status,
        manager_id: row.manager_id,
        department: row.departments ? { id: row.departments.id, name: row.departments.name } : null,
        designation: row.designations ? { id: row.designations.id, title: row.designations.title } : null,
      }))

      return success(summaries)
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Retrieves comprehensive dashboard stats
   */
  async getDashboardStats(organizationId: string): Promise<Result<HRDashboardStats>> {
    try {
      const supabase = await createClient()
      
      const { data: emps, error: e1 } = await supabase
        .from('employees')
        .select('id, status, joining_date, manager_id, employment_type')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (e1) throw e1

      const { count: deptCount, error: e2 } = await supabase
        .from('departments')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', organizationId)

      if (e2) throw e2

      // teams doesn't have organization_id directly, it links through department
      // But we can just count teams by joining. For now, let's query all teams 
      // in departments that belong to this org.
      const { data: orgDepts } = await supabase.from('departments').select('id').eq('organization_id', organizationId)
      const deptIds = orgDepts?.map(d => d.id) || []
      
      let teamCount = 0
      if (deptIds.length > 0) {
        const { count: tCount } = await supabase
          .from('teams')
          .select('id', { count: 'exact', head: true })
          .in('department_id', deptIds)
        teamCount = tCount || 0
      }

      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

      const active = emps.filter((e: any) => e.status === 'active').length
      const inactive = emps.filter((e: any) => e.status === 'inactive').length
      const onLeave = emps.filter((e: any) => e.status === 'on_leave').length
      const probation = emps.filter((e: any) => e.status === 'probation').length
      const contractors = emps.filter((e: any) => e.employment_type === 'contract').length
      const managers = new Set(emps.map((e: any) => e.manager_id).filter(Boolean)).size
      
      const newHires = emps.filter((e: any) => e.joining_date && new Date(e.joining_date) > oneMonthAgo).length
      const terminations = emps.filter((e: any) => e.status === 'terminated').length

      const stats: HRDashboardStats = {
        totalEmployees: emps.length,
        active,
        inactive,
        onLeave,
        probation,
        contractors,
        departments: deptCount || 0,
        teams: teamCount,
        managers,
        newHires,
        terminations
      }

      return success(stats)
    } catch (error) {
      return failure(error as Error)
    }
  }

  /**
   * Retrieves full details for a single employee
   */
  async getEmployeeDetail(employeeId: string, organizationId: string): Promise<Result<EmployeeDetail>> {
    try {
      const supabase = await createClient()
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          departments!department_id(id, name),
          designations!designation_id(id, title),
          manager:employees!manager_id(id, full_name, email),
          employee_teams(
            role_in_team,
            team:teams(id, name)
          ),
          project_members(
            role,
            joined_at,
            left_at,
            project:projects(id, name)
          )
        `)
        .eq('id', employeeId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .single()

      if (error) throw error

      const detail: EmployeeDetail = {
        id: data.id,
        organization_id: data.organization_id,
        user_id: data.user_id,
        employee_id_string: data.employee_id_string,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        profile_photo: data.profile_photo,
        status: data.status,
        address: data.address,
        emergency_contact: data.emergency_contact,
        joining_date: data.joining_date,
        manager_id: data.manager_id,
        department: data.departments ? { id: data.departments.id, name: data.departments.name } : null,
        designation: data.designations ? { id: data.designations.id, title: data.designations.title } : null,
        manager: data.manager ? { id: data.manager.id, full_name: data.manager.full_name, email: data.manager.email } : null,
        teams: data.employee_teams?.map((et: any) => ({
          id: et.team.id,
          name: et.team.name,
          role_in_team: et.role_in_team
        })) || [],
        projects: data.project_members?.map((pm: any) => ({
          id: pm.project.id,
          name: pm.project.name,
          role: pm.role,
          start_date: pm.joined_at,
          end_date: pm.left_at
        })) || []
      }

      return success(detail)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getEmployeeHistory(employeeId: string, organizationId: string): Promise<Result<EmployeePositionHistory[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employee_position_history')
        .select(`
          id, title, start_date, end_date, change_reason,
          departments(name)
        `)
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)
        .order('start_date', { ascending: false })

      if (error) throw error

      const history = data.map((h: any) => ({
        id: h.id,
        title: h.title,
        department_name: h.departments?.name || null,
        start_date: h.start_date,
        end_date: h.end_date,
        change_reason: h.change_reason
      }))

      return success(history)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // Basic Mutation Wrappers
  async softDelete(employeeId: string, organizationId: string, actorId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('employees')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: actorId,
          status: 'inactive'
        })
        .eq('id', employeeId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async updateStatus(employeeId: string, organizationId: string, status: EmployeeStatus): Promise<Result<void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('employees')
        .update({ status })
        .eq('id', employeeId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async update(employeeId: string, organizationId: string, updates: any): Promise<Result<void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', employeeId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async createEmployee(organizationId: string, employeeData: any, actorId: string): Promise<Result<string>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .insert({
          organization_id: organizationId,
          ...employeeData,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (error) throw error
      return success(data.id)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async addPositionHistory(organizationId: string, employeeId: string, historyData: any, actorId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('employee_position_history')
        .insert({
          organization_id: organizationId,
          employee_id: employeeId,
          recorded_by: actorId,
          ...historyData
        })

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async assignTeams(organizationId: string, employeeId: string, teamIds: string[], actorId: string): Promise<Result<void>> {
    try {
      const supabase = await createClient()
      
      // Remove old assignments
      await supabase
        .from('employee_teams')
        .delete()
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)

      // Add new assignments
      if (teamIds.length > 0) {
        const inserts = teamIds.map(tid => ({
          organization_id: organizationId,
          employee_id: employeeId,
          team_id: tid
        }))
        const { error } = await supabase
          .from('employee_teams')
          .insert(inserts)

        if (error) throw error
      }
      
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const hrRepository = new HRRepository()
