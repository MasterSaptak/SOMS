import { z } from 'zod'

export const createDepartmentSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(100),
  headId: z.string().uuid().optional().nullable(),
  parentId: z.string().uuid().optional().nullable()
})

export const createTeamSchema = z.object({
  departmentId: z.string().uuid(),
  name: z.string().min(2).max(100),
  leadId: z.string().uuid().optional().nullable()
})

export const createDesignationSchema = z.object({
  organizationId: z.string().uuid(),
  title: z.string().min(2).max(100),
  level: z.number().int().min(1).max(1000)
})

export const createWorkLocationSchema = z.object({
  organizationId: z.string().uuid(),
  name: z.string().min(2).max(100),
  address: z.string().max(500).optional().nullable(),
  timezone: z.string().min(2).max(50)
})

export const updateEmployeeSchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  teamId: z.string().uuid().nullable().optional(),
  designationId: z.string().uuid().nullable().optional(),
  workLocationId: z.string().uuid().nullable().optional(),
  managerId: z.string().uuid().nullable().optional(),
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  status: z.enum(['active', 'on_leave', 'terminated']).optional()
})

export const updateEmploymentDetailsSchema = z.object({
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
  probationEndDate: z.string().optional().nullable(),
  noticePeriodDays: z.number().int().min(0).max(365).optional(),
  workSchedule: z.string().optional()
})

export const createEmergencyContactSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string().min(2).max(100),
  relationship: z.string().min(2).max(50),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional().nullable(),
  isPrimary: z.boolean().default(false)
})

export const createEmployeeSkillSchema = z.object({
  employeeId: z.string().uuid(),
  skillName: z.string().min(1).max(100),
  proficiency: z.enum(['beginner', 'intermediate', 'expert'])
})

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>
export type CreateWorkLocationInput = z.infer<typeof createWorkLocationSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type UpdateEmploymentDetailsInput = z.infer<typeof updateEmploymentDetailsSchema>
export type CreateEmergencyContactInput = z.infer<typeof createEmergencyContactSchema>
export type CreateEmployeeSkillInput = z.infer<typeof createEmployeeSkillSchema>
