import { BaseRepository } from '@/lib/repositories/base.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'
import { createClient } from '@/lib/supabase/server'
import type { Department, Team, Designation, WorkLocation } from '@/lib/types'

async function getUntypedClient(): Promise<any> {
  return await createClient()
}

export class DepartmentRepository extends BaseRepository<'departments'> {
  constructor() {
    super('departments')
  }

  async findByOrganizationId(orgId: string): Promise<Result<Department[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('departments')
        .select('id, organization_id, branch_id, name, parent_id, head_id, created_at, updated_at')
        .eq('organization_id', orgId)
        .order('name')

      if (error) throw error
      return success(data as Department[])
    } catch (err) {
      logger.error('[DepartmentRepository] findByOrganizationId failed', err)
      return failure(err as Error)
    }
  }
}

export class TeamRepository extends BaseRepository<'teams'> {
  constructor() {
    super('teams')
  }

  async findByDepartmentId(deptId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('teams')
        .select('id, organization_id, branch_id, department_id, code, name, team_type, status, manager_employee_id, deputy_employee_id, max_members, color, icon, created_at, updated_at')
        .eq('department_id', deptId)
        .order('name')

      if (error) throw error
      return success(data || [])
    } catch (err) {
      logger.error('[TeamRepository] findByDepartmentId failed', err)
      return failure(err as Error)
    }
  }

  async findByOrganizationId(orgId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('teams')
        .select('id, organization_id, branch_id, department_id, code, name, team_type, status, manager_employee_id, deputy_employee_id, max_members, color, icon, created_at, updated_at')
        .eq('organization_id', orgId)
        .order('name')

      if (error) throw error
      return success(data || [])
    } catch (err) {
      logger.error('[TeamRepository] findByOrganizationId failed', err)
      return failure(err as Error)
    }
  }
}

// @ts-expect-error - Table not in generated types
export class TeamMemberRepository extends BaseRepository<'team_members'> {
  constructor() {
    super('team_members')
  }

  async findByTeamId(teamId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('team_members')
        .select('team_id, employee_id, role_id, is_primary, joined_at, employees(*)')
        .eq('team_id', teamId)

      if (error) throw error
      return success(data || [])
    } catch (err) {
      logger.error('[TeamMemberRepository] findByTeamId failed', err)
      return failure(err as Error)
    }
  }
}

// @ts-expect-error - Table not in generated types
export class DesignationRepository extends BaseRepository<'designations'> {
  constructor() {
    super('designations')
  }

  async findByOrganizationId(orgId: string): Promise<Result<Designation[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('designations')
        .select('id, organization_id, title, name, level, department_id, created_at')
        .eq('organization_id', orgId)
        .order('level', { ascending: false })

      if (error) throw error
      return success(data as Designation[])
    } catch (err) {
      logger.error('[DesignationRepository] findByOrganizationId failed', err)
      return failure(err as Error)
    }
  }
}

// @ts-expect-error - Table not in generated types
export class WorkLocationRepository extends BaseRepository<'work_locations'> {
  constructor() {
    super('work_locations')
  }

  async findByOrganizationId(orgId: string): Promise<Result<WorkLocation[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('work_locations')
        .select('id, organization_id, name, address, city, country, type, created_at')
        .eq('organization_id', orgId)
        .order('name')

      if (error) throw error
      return success(data as WorkLocation[])
    } catch (err) {
      logger.error('[WorkLocationRepository] findByOrganizationId failed', err)
      return failure(err as Error)
    }
  }
}

export const departmentRepository = new DepartmentRepository()
export const teamRepository = new TeamRepository()
export const teamMemberRepository = new TeamMemberRepository()
export const designationRepository = new DesignationRepository()
export const workLocationRepository = new WorkLocationRepository()
