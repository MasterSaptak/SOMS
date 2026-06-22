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
        .select('*')
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

  async findByDepartmentId(deptId: string): Promise<Result<Team[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('teams')
        .select('*')
        .eq('department_id', deptId)
        .order('name')

      if (error) throw error
      return success(data as Team[])
    } catch (err) {
      logger.error('[TeamRepository] findByDepartmentId failed', err)
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
        .select('*')
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
        .select('*')
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
export const designationRepository = new DesignationRepository()
export const workLocationRepository = new WorkLocationRepository()
