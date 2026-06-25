// @ts-nocheck
"use server"
// @ts-nocheck

import { taskService } from "@/lib/services/task.service"
import { revalidatePath } from "next/cache"
import { Task, TaskStatus, TaskCategory } from "@/lib/repositories/task.repository"

export async function getOrganizationTasksAction(organizationId: string, options?: { status?: TaskStatus; category?: TaskCategory; limit?: number; offset?: number; projectId?: string }) {
  return await taskService.getOrganizationTasks(organizationId, options)
}

export async function getEmployeeTasksAction(employeeId: string, organizationId: string) {
  return await taskService.getEmployeeTasks(employeeId, organizationId)
}

export async function getTaskAction(taskId: string, organizationId: string) {
  return await taskService.getTask(taskId, organizationId)
}

export async function createTaskAction(organizationId: string, taskData: Partial<Task>, assignees: string[] = []) {
  const result = await taskService.createTask(organizationId, taskData, assignees)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}

export async function updateTaskAction(taskId: string, organizationId: string, actorId: string, updates: Partial<Task>) {
  const result = await taskService.updateTask(taskId, organizationId, actorId, updates)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}

export async function getTaskStatsAction(organizationId: string) {
  return await taskService.getStats(organizationId)
}

export async function addTaskCommentAction(taskId: string, organizationId: string, authorId: string, content: string) {
  const result = await taskService.addComment(taskId, organizationId, authorId, content)
  if (result.success) {
    revalidatePath(`/admin/tasks`)
  }
  return result
}

export async function deleteTaskAction(taskId: string, organizationId: string, actorId: string) {
  const result = await taskService.deleteTask(taskId, organizationId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}

export async function assignTaskAction(taskId: string, organizationId: string, employeeId: string, actorId: string) {
  const result = await taskService.assignTask(taskId, organizationId, employeeId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}

export async function unassignTaskAction(organizationId: string, taskId: string, employeeId: string, actorId: string) {
  const result = await taskService.unassignTask(organizationId, taskId, employeeId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}

export async function addDependencyAction(organizationId: string, taskId: string, dependsOnId: string, actorId: string) {
  const result = await taskService.addDependency(organizationId, taskId, dependsOnId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function removeDependencyAction(organizationId: string, taskId: string, dependsOnId: string, actorId: string) {
  const result = await taskService.removeDependency(organizationId, taskId, dependsOnId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}
