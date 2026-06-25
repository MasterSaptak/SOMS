'use server'

import { hrService } from '@/lib/services/hr.service'
import { revalidatePath } from 'next/cache'

export async function getActiveEmployeesAction(organizationId: string) {
  return await hrService.getActiveEmployees(organizationId)
}

export async function getDashboardStatsAction(organizationId: string) {
  return await hrService.getDashboardStats(organizationId)
}

export async function getEmployeeDetailAction(organizationId: string, employeeId: string) {
  return await hrService.getEmployeeDetail(organizationId, employeeId)
}

export async function getEmployeeHistoryAction(organizationId: string, employeeId: string) {
  return await hrService.getEmployeeHistory(organizationId, employeeId)
}

export async function createEmployeeAction(organizationId: string, data: any, actorId: string) {
  const result = await hrService.createEmployee(organizationId, data, actorId)
  if (result.success) revalidatePath('/admin/hr')
  return result
}

export async function changeEmployeePositionAction(organizationId: string, employeeId: string, data: any, actorId: string) {
  const result = await hrService.changeEmployeePosition(organizationId, employeeId, data, actorId)
  if (result.success) revalidatePath('/admin/hr')
  return result
}

export async function assignEmployeeTeamsAction(organizationId: string, employeeId: string, teamIds: string[], actorId: string) {
  const result = await hrService.assignEmployeeTeams(organizationId, employeeId, teamIds, actorId)
  if (result.success) revalidatePath('/admin/hr')
  return result
}

export async function softDeleteEmployeeAction(organizationId: string, employeeId: string, actorId: string) {
  const result = await hrService.softDeleteEmployee(organizationId, employeeId, actorId)
  if (result.success) {
    revalidatePath('/admin/hr')
  }
  return result
}

export async function terminateEmployeeAction(organizationId: string, employeeId: string, actorId: string) {
  const result = await hrService.terminateEmployee(organizationId, employeeId, actorId)
  if (result.success) {
    revalidatePath('/admin/hr')
  }
  return result
}

export async function suspendEmployeeAction(organizationId: string, employeeId: string, actorId: string) {
  const result = await hrService.suspendEmployee(organizationId, employeeId, actorId)
  if (result.success) {
    revalidatePath('/admin/hr')
  }
  return result
}
