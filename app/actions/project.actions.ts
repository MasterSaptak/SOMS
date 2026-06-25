"use server"

import { projectService } from "@/lib/services/project.service"
import { revalidatePath } from "next/cache"
import { Project, BudgetCategory } from "@/lib/repositories/project.repository"

export async function getProjectsAction(organizationId: string, options?: any) {
  return await projectService.getOrganizationProjects(organizationId, options)
}

export async function getProjectAction(projectId: string, organizationId: string) {
  return await projectService.getProject(projectId, organizationId)
}

export async function createProjectAction(organizationId: string, project: Partial<Project>, memberIds: string[] = []) {
  const result = await projectService.createProject(organizationId, project, memberIds)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function updateProjectAction(organizationId: string, projectId: string, updates: Partial<Project>, actorId: string) {
  const result = await projectService.updateProject(organizationId, projectId, updates, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function deleteProjectAction(organizationId: string, projectId: string, actorId: string) {
  const result = await projectService.deleteProject(organizationId, projectId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

// ── MEMBERS ──

export async function addProjectMemberAction(organizationId: string, projectId: string, employeeId: string, role: string, actorId: string) {
  const result = await projectService.addProjectMember(organizationId, projectId, employeeId, role, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function removeProjectMemberAction(organizationId: string, projectId: string, employeeId: string, actorId: string) {
  const result = await projectService.removeProjectMember(organizationId, projectId, employeeId, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function updateProjectMemberRoleAction(organizationId: string, projectId: string, employeeId: string, role: string, actorId: string) {
  const result = await projectService.updateProjectMemberRole(organizationId, projectId, employeeId, role, actorId)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

// ── MILESTONES ──

export async function addProjectMilestoneAction(organizationId: string, projectId: string, actorId: string, milestone: { name: string; due_date?: string }) {
  const result = await projectService.addMilestone(organizationId, projectId, actorId, milestone)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

// ── BUDGETS ──

export async function getBudgetOverviewAction(organizationId: string, projectId: string) {
  return await projectService.getBudgetOverview(organizationId, projectId)
}

export async function requestBudgetAction(
  organizationId: string,
  projectId: string,
  actorId: string,
  amount: number,
  category: BudgetCategory,
  description: string
) {
  const result = await projectService.requestBudget(organizationId, projectId, actorId, amount, category, description)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function approveBudgetRequestAction(
  organizationId: string,
  projectId: string,
  requestId: string,
  actorId: string,
  requestDetails: { amount: number; category: BudgetCategory; description?: string }
) {
  const result = await projectService.approveBudgetRequest(organizationId, projectId, requestId, actorId, requestDetails)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}

export async function rejectBudgetRequestAction(
  organizationId: string,
  projectId: string,
  requestId: string,
  actorId: string,
  reason: string
) {
  const result = await projectService.rejectBudgetRequest(organizationId, projectId, requestId, actorId, reason)
  if (result.success) {
    revalidatePath("/admin/tasks")
  }
  return result
}
