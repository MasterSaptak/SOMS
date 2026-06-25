"use server"
// @ts-nocheck

import { workSessionService } from "@/lib/services/work-session.service"
import { revalidatePath } from "next/cache"

export async function getEmployeeWorkSessionsAction(employeeId: string, organizationId: string) {
  return await workSessionService.getEmployeeWorkSessions(employeeId, organizationId)
}

export async function startWorkSessionAction(taskId: string, employeeId: string, organizationId: string) {
  const result = await workSessionService.startSession(taskId, employeeId, organizationId)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}

export async function endWorkSessionAction(sessionId: string, organizationId: string, notes?: string) {
  const result = await workSessionService.endSession(sessionId, organizationId, notes)
  if (result.success) {
    revalidatePath("/admin/tasks")
    revalidatePath("/employee/tasks")
  }
  return result
}
