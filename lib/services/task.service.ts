// @ts-nocheck
import { taskRepository, Task, TaskCategory, TaskStatus } from '@/lib/repositories/task.repository'
import { Result, success, failure } from '@/lib/utils/result'

export class TaskService {
  // Admin only: Get all tasks in the org
  async getOrganizationTasks(organizationId: string, options?: { status?: TaskStatus; category?: TaskCategory; limit?: number; offset?: number }): Promise<Result<any[]>> {
    try {
      const result = await taskRepository.findByOrganization(organizationId, options)
      if (!result.success) throw result.error
      return success(result.data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // Employee: Get tasks assigned to them + organization-wide tasks
  async getEmployeeTasks(employeeId: string, organizationId: string): Promise<Result<any[]>> {
    try {
      const [assignedRes, orgRes] = await Promise.all([
        taskRepository.findByEmployee(employeeId, organizationId),
        taskRepository.getOrganizationTasks(organizationId)
      ])

      if (!assignedRes.success) throw assignedRes.error
      if (!orgRes.success) throw orgRes.error

      // Combine and deduplicate
      const allTasks = [...assignedRes.data, ...orgRes.data]
      const uniqueTasks = Array.from(new Map(allTasks.map(t => [t.id, t])).values())

      // Sort by created_at desc
      uniqueTasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      return success(uniqueTasks)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getTask(taskId: string, organizationId: string): Promise<Result<any>> {
    return await taskRepository.findById(taskId, organizationId)
  }

  async createTask(organizationId: string, taskData: Partial<Task>, assignees: string[] = []): Promise<Result<any>> {
    try {
      const result = await taskRepository.create({ ...taskData, organization_id: organizationId })
      if (!result.success) throw result.error

      const task = result.data

      // Add assignments
      if (assignees.length > 0) {
        await Promise.all(assignees.map(empId =>
          taskRepository.addAssignment({
            organization_id: organizationId,
            task_id: task.id,
            employee_id: empId,
            assigned_by: taskData.created_by || null
          })
        ))
      }

      // Log activity
      await taskRepository.logActivity({
        organization_id: organizationId,
        task_id: task.id,
        actor_id: taskData.created_by || null,
        action_type: 'created',
        description: `Task created: ${task.title}`
      })

      return success(task)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async updateTask(taskId: string, organizationId: string, actorId: string, updates: Partial<Task>): Promise<Result<any>> {
    try {
      // Get current task to diff
      const currentRes = await taskRepository.findById(taskId, organizationId)
      if (!currentRes.success) throw currentRes.error
      const current = currentRes.data

      const result = await taskRepository.update(taskId, organizationId, updates)
      if (!result.success) throw result.error

      // Log status change
      if (updates.status && updates.status !== current.status) {
        await taskRepository.logActivity({
          organization_id: organizationId,
          task_id: taskId,
          actor_id: actorId,
          action_type: 'status_changed',
          description: `Status changed from ${current.status} to ${updates.status}`
        })
      }

      return success(result.data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getTaskActivity(taskId: string, organizationId: string): Promise<Result<any[]>> {
    return await taskRepository.getActivityLogs(taskId, organizationId)
  }

  async getTaskComments(taskId: string, organizationId: string): Promise<Result<any[]>> {
    return await taskRepository.getComments(taskId, organizationId)
  }

  async addComment(taskId: string, organizationId: string, authorId: string, content: string): Promise<Result<any>> {
    return await taskRepository.addComment({
      organization_id: organizationId,
      task_id: taskId,
      author_id: authorId,
      content
    })
  }

  async getStats(organizationId: string): Promise<Result<any>> {
    return await taskRepository.getStats(organizationId)
  }

  async deleteTask(taskId: string, organizationId: string, actorId: string): Promise<Result<void>> {
    return await taskRepository.softDelete(taskId, organizationId, actorId)
  }

  async assignTask(taskId: string, organizationId: string, employeeId: string, actorId: string): Promise<Result<any>> {
    return await taskRepository.addAssignment({
      organization_id: organizationId,
      task_id: taskId,
      employee_id: employeeId,
      assigned_by: actorId
    })
  }

  async unassignTask(taskId: string, organizationId: string, employeeId: string): Promise<Result<void>> {
    return await taskRepository.removeAssignment(taskId, employeeId, organizationId)
  }
}

export const taskService = new TaskService()
