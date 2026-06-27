import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'

export class OrgEmployeeService {
  /**
   * Fetches the complete organizational hierarchy path for a given employee.
   */
  async getEmployeeHierarchyContext(employeeId: string): Promise<Result<any>> {
    try {
      const client = await createClient()

      // 1. Get employee basic info, department, designation
      const { data: employee, error: empErr } = await client
        .from('employees')
        .select(`
          id, full_name, organization_id, department_id, manager_id,
          manager:employees!manager_id(id, full_name, profile_photo, email),
          organizations(id, name),
          departments!employees_department_id_fkey(id, name, branch_id)
        `)
        .eq('id', employeeId)
        .single()
        
      if (empErr) throw empErr

      // 2. Get teams
      const { data: teamMembers, error: tmErr } = await client
        .from('team_members')
        .select(`
          teams(id, name, department_id, lead_id)
        `)
        .eq('employee_id', employeeId)
        
      if (tmErr) throw tmErr

      const primaryTeam = teamMembers?.[0] || null
      const otherTeams = teamMembers?.slice(1) || []

      // 3. Get branch (derive from primary team or department)
      let branch = null
      const branchId = employee.departments?.branch_id
      if (branchId) {
        const { data: branchData } = await client.from('branches').select('id, name').eq('id', branchId).single()
        branch = branchData
      }

      return success({
        organization: employee.organizations,
        branch: branch,
        department: employee.departments,
        primaryTeam: primaryTeam,
        otherTeams: otherTeams,
        manager: employee.manager,
        designation: null // Assuming designation is plain string in some tables, or relations in others
      })
    } catch (err) {
      logger.error('[OrgEmployeeService] getEmployeeHierarchyContext error', err)
      return failure(err as Error)
    }
  }
}

export const orgEmployeeService = new OrgEmployeeService()
