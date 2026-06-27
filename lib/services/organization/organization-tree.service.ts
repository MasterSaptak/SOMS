import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'

export class OrganizationTreeService {
  async getFullTree(orgId: string): Promise<Result<any>> {
    try {
      const client = await createClient()

      // 1. Fetch branches
      const { data: branches, error: err1 } = await client
        .from('branches')
        .select('*')
        .eq('organization_id', orgId)
      if (err1) throw err1

      // 2. Fetch departments
      const { data: departments, error: err2 } = await client
        .from('departments')
        .select('*, head_employee:employees!head_id(id, full_name, profile_photo, email)')
        .eq('organization_id', orgId)
      if (err2) throw err2

      // 3. Fetch teams with managers
      const { data: teams, error: err3 } = await client
        .from('teams')
        .select('*, manager:employees!manager_employee_id(id, full_name, profile_photo, email)')
        .eq('organization_id', orgId)
      if (err3) throw err3

      // Compose the tree
      const tree = branches.map(branch => {
        const branchDepts = departments.filter(d => d.branch_id === branch.id)
        
        const deptsWithTeams = branchDepts.map(dept => {
          const deptTeams = teams.filter(t => t.department_id === dept.id)
          return { ...dept, teams: deptTeams }
        })

        return { ...branch, departments: deptsWithTeams }
      })

      // Also grab departments without a branch (root level)
      const rootDepts = departments
        .filter(d => !d.branch_id)
        .map(dept => {
          const deptTeams = teams.filter(t => t.department_id === dept.id)
          return { ...dept, teams: deptTeams }
        })

      return success({ branches: tree, unassignedDepartments: rootDepts })
    } catch (err) {
      logger.error('[OrganizationTreeService] getFullTree error', err)
      return failure(err as Error)
    }
  }
}

export const organizationTreeService = new OrganizationTreeService()
