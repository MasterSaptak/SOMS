// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'

// ── Types ──────────────────────────────────────────────────────────────────

export type TaskCategory =
  | 'Task' | 'Daily Task' | 'Weekly Task' | 'Monthly Mission'
  | 'Quarterly Goal' | 'Organization Task' | 'Team Task' | 'Project Task'

export type TaskPriority = 'Critical' | 'High' | 'Medium' | 'Low'

export type TaskStatus =
  | 'Draft' | 'Scheduled' | 'Active' | 'Blocked' | 'In Progress'
  | 'Review' | 'Completed' | 'Archived' | 'Cancelled'

export interface Task {
  id: string
  organization_id: string
  project_id: string | null
  department_id: string | null
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  start_date: string | null
  start_time: string | null
  due_date: string | null
  due_time: string | null
  activate_at: string | null
  estimated_hours: number | null
  actual_hours: number | null
  completion_percentage: number
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at?: string | null
  deleted_by?: string | null
  version?: number
}

export interface TaskAssignment {
  id: string
  organization_id: string
  task_id: string
  employee_id: string
  assigned_by: string | null
  created_at: string
}

export interface TaskWithAssignees extends Task {
  task_assignments?: Array<{
    employee_id: string
    assigned_by: string
    employees?: { id: string; full_name: string; profile_photo: string | null }
  }>
  task_labels?: Array<{ id: string; label: string; color: string }>
  projects?: { id: string; name: string; project_code: string | null } | null
  dependencies?: Array<{
    depends_on_id: string
    type: string
  }>
}

// ── Repository ─────────────────────────────────────────────────────────────

export class TaskRepository {
  async getClient() {
    return await createClient()
  }

  // ── READ ──

  async findByOrganization(
    organizationId: string,
    options?: { status?: TaskStatus; category?: TaskCategory; limit?: number; offset?: number; projectId?: string }
  ): Promise<Result<TaskWithAssignees[]>> {
    try {
      const client = await this.getClient()
      let query = (client as any).from('tasks').select(`
        *,
        task_assignments ( employee_id, assigned_by, employees ( id, full_name, profile_photo ) ),
        task_labels ( id, label, color ),
        projects ( id, name, project_code ),
        dependencies:task_dependencies!task_dependencies_task_id_fkey ( depends_on_id, type )
      `)
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options?.status) query = query.eq('status', options.status)
      if (options?.category) query = query.eq('category', options.category)
      if (options?.projectId) query = query.eq('project_id', options.projectId)
      if (options?.limit) query = query.limit(options.limit)
      if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)

      const { data, error } = await query
      if (error) throw error
      return success((data || []) as TaskWithAssignees[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findByEmployee(employeeId: string, organizationId: string): Promise<Result<TaskWithAssignees[]>> {
    try {
      const client = await this.getClient()
      // Get task IDs assigned to this employee, then fetch full task data
      const { data: assignments, error: aErr } = await (client as any)
        .from('task_assignments')
        .select('task_id')
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)

      if (aErr) throw aErr
      const taskIds = (assignments || []).map(a => a.task_id)
      if (taskIds.length === 0) return success([])

      const { data, error } = await client
        .from('tasks')
        .select(`
          *,
          task_assignments ( employee_id, employees ( id, full_name, profile_photo ) ),
          task_labels ( label, color ),
          projects ( id, name, project_code )
        `)
        .in('id', taskIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return success((data || []) as TaskWithAssignees[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findByProject(projectId: string, organizationId: string): Promise<Result<TaskWithAssignees[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('tasks')
        .select(`
          *,
          task_assignments ( employee_id, employees ( id, full_name, profile_photo ) ),
          task_labels ( label, color )
        `)
        .eq('project_id', projectId)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return success((data || []) as TaskWithAssignees[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findById(id: string, organizationId: string): Promise<Result<TaskWithAssignees>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('tasks')
        .select(`
          *,
          task_assignments ( employee_id, assigned_by, employees ( id, full_name, profile_photo ) ),
          task_labels ( id, label, color ),
          projects ( id, name, project_code ),
          dependencies:task_dependencies!task_dependencies_task_id_fkey ( depends_on_id, type )
        `)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .single()

      if (error) throw error
      return success(data as TaskWithAssignees)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getOrganizationTasks(
    organizationId: string, 
    options?: { limit?: number; offset?: number }
  ): Promise<Result<TaskWithAssignees[]>> {
    try {
      const client = await this.getClient()
      let query = (client as any)
        .from('tasks')
        .select(`
          *,
          task_assignments ( employee_id, employees ( id, full_name, profile_photo ) ),
          task_labels ( label, color ),
          projects ( id, name, project_code )
        `)
        .eq('organization_id', organizationId)
        .eq('category', 'Organization Task')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (options?.limit) query = query.limit(options.limit)
      if (options?.offset) query = query.range(options.offset, options.offset + (options.limit || 50) - 1)

      const { data, error } = await query
      if (error) throw error
      return success((data || []) as TaskWithAssignees[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── WRITE ──

  async create(task: Partial<Task>): Promise<Result<Task>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('tasks')
        .insert(task)
        .select()
        .single()

      if (error) throw error
      return success(data as Task)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async update(id: string, organizationId: string, updates: Partial<Task>): Promise<Result<Task>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) throw error
      return success(data as Task)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async softDelete(id: string, organizationId: string, deletedBy: string): Promise<Result<void>> {
    try {
      const client = await this.getClient()
      const { error } = await client
        .from('tasks')
        .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy })
        .eq('id', id)
        .eq('organization_id', organizationId)

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── ASSIGNMENTS ──

  async addAssignment(assignment: Omit<TaskAssignment, 'id' | 'created_at'>): Promise<Result<TaskAssignment>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('task_assignments')
        .insert(assignment)
        .select()
        .single()

      if (error) throw error
      return success(data as TaskAssignment)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async removeAssignment(taskId: string, employeeId: string, organizationId: string): Promise<Result<void>> {
    try {
      const client = await this.getClient()
      const { error } = await client
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)

      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── COMMENTS ──

  async getComments(taskId: string, organizationId: string): Promise<Result<any[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('task_comments')
        .select('*, employees ( id, full_name, profile_photo )')
        .eq('task_id', taskId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return success(data || [])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async addComment(comment: { organization_id: string; task_id: string; author_id: string; content: string }): Promise<Result<any>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('task_comments')
        .insert(comment)
        .select('*, employees ( id, full_name, profile_photo )')
        .single()

      if (error) throw error
      return success(data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── ACTIVITY ──

  async logActivity(log: {
    organization_id: string
    task_id: string
    actor_id: string | null
    action_type: string
    description: string
    metadata?: Record<string, unknown>
  }): Promise<Result<void>> {
    try {
      const client = await this.getClient()
      const { error } = await client.from('task_activity_logs').insert(log)
      if (error) throw error
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getActivityLogs(taskId: string, organizationId: string): Promise<Result<any[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('task_activity_logs')
        .select('*, employees:actor_id ( id, full_name, profile_photo )')
        .eq('task_id', taskId)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return success(data || [])
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── STATS ──

  async getStats(organizationId: string): Promise<Result<{
    total: number; active: number; completed: number; overdue: number
  }>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('tasks')
        .select('id, status, due_date')
        .eq('organization_id', organizationId)

      if (error) throw error
      const tasks = data || []
      const now = new Date().toISOString().split('T')[0]

      return success({
        total: tasks.length,
        active: tasks.filter(t => ['Active', 'In Progress', 'Review'].includes(t.status)).length,
        completed: tasks.filter(t => t.status === 'Completed').length,
        overdue: tasks.filter(t =>
          t.due_date && t.due_date < now && !['Completed', 'Archived', 'Cancelled'].includes(t.status)
        ).length,
      })
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const taskRepository = new TaskRepository()
