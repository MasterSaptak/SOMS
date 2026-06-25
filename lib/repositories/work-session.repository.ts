// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'

export interface WorkSession {
  id: string
  organization_id: string
  task_id: string
  employee_id: string
  start_time: string
  end_time: string | null
  duration_minutes: number | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WorkSessionWithDetails extends WorkSession {
  tasks?: { id: string; title: string; project_id: string | null } | null
  employees?: { id: string; full_name: string; profile_photo: string | null } | null
}

export class WorkSessionRepository {
  async getClient() {
    return await createClient()
  }

  async findByOrganization(organizationId: string): Promise<Result<WorkSessionWithDetails[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await (client as any)
        .from('work_sessions')
        .select('*, tasks(id, title, project_id), employees(id, full_name, profile_photo)')
        .eq('organization_id', organizationId)
        .order('start_time', { ascending: false })

      if (error) throw error
      return success(data as WorkSessionWithDetails[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findByEmployee(employeeId: string, organizationId: string): Promise<Result<WorkSessionWithDetails[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await (client as any)
        .from('work_sessions')
        .select('*, tasks(id, title, project_id), employees(id, full_name, profile_photo)')
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)
        .order('start_time', { ascending: false })

      if (error) throw error
      return success(data as WorkSessionWithDetails[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findActive(employeeId: string, organizationId: string): Promise<Result<WorkSessionWithDetails[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await (client as any)
        .from('work_sessions')
        .select('*, tasks(id, title, project_id), employees(id, full_name, profile_photo)')
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)
        .is('end_time', null)

      if (error) throw error
      return success(data as WorkSessionWithDetails[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async create(session: Partial<WorkSession>): Promise<Result<WorkSession>> {
    try {
      const client = await this.getClient()
      const { data, error } = await (client as any)
        .from('work_sessions')
        .insert(session)
        .select()
        .single()

      if (error) throw error
      return success(data as WorkSession)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async update(id: string, organizationId: string, updates: Partial<WorkSession>): Promise<Result<WorkSession>> {
    try {
      const client = await this.getClient()
      const { data, error } = await (client as any)
        .from('work_sessions')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error
      return success(data as WorkSession)
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const workSessionRepository = new WorkSessionRepository()
