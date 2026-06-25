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
  workSchedule: z.string().optional(),
  confirmationDate: z.string().optional().nullable(),
  shift: z.string().optional().nullable(),
  officeLocation: z.string().optional().nullable(),
  employeeGrade: z.string().optional().nullable(),
  employmentCategory: z.string().optional().nullable(),
  costCenter: z.string().optional().nullable(),
  payrollGroup: z.string().optional().nullable(),
})

export const createEmergencyContactSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string().min(2).max(100),
  relationship: z.string().min(2).max(50),
  phone: z.string().min(5).max(20),
  email: z.string().email().optional().nullable(),
  alternatePhone: z.string().max(20).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  bloodGroup: z.string().max(10).optional().nullable(),
  knownAllergies: z.string().max(500).optional().nullable(),
  medicalNotes: z.string().max(1000).optional().nullable(),
  isPrimary: z.boolean().default(false),
  isSecondary: z.boolean().default(false)
})

export const updateEmergencyContactSchema = createEmergencyContactSchema.partial().omit({ employeeId: true })

export const createSkillSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100).default('Uncategorized')
})

export const createEmployeeSkillSchema = z.object({
  employeeId: z.string().uuid(),
  skillId: z.string().uuid(),
  proficiency: z.enum(['beginner', 'intermediate', 'expert']),
  yearsOfExperience: z.number().min(0).max(100).optional().nullable(),
  certification: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable()
})

export const updateEmployeeSkillSchema = createEmployeeSkillSchema.partial().omit({ employeeId: true })

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>
export type CreateTeamInput = z.infer<typeof createTeamSchema>
export type CreateDesignationInput = z.infer<typeof createDesignationSchema>
export type CreateWorkLocationInput = z.infer<typeof createWorkLocationSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type UpdateEmploymentDetailsInput = z.infer<typeof updateEmploymentDetailsSchema>
export type CreateEmergencyContactInput = z.infer<typeof createEmergencyContactSchema>
export type UpdateEmergencyContactInput = z.infer<typeof updateEmergencyContactSchema>
export type CreateSkillInput = z.infer<typeof createSkillSchema>
export type CreateEmployeeSkillInput = z.infer<typeof createEmployeeSkillSchema>
export type UpdateEmployeeSkillInput = z.infer<typeof updateEmployeeSkillSchema>

// ============================================================
// EMPLOYEE MASTER RECORD EXTENSIONS
// ============================================================

export const updatePersonalDetailsSchema = z.object({
  gender: z.string().max(20).optional().nullable(),
  bloodGroup: z.string().max(10).optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  maritalStatus: z.string().max(50).optional().nullable(),
  personalEmail: z.string().email().optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  aadhaarNid: z.string().max(50).optional().nullable(),
  passportNo: z.string().max(50).optional().nullable(),
  visaStatus: z.string().max(100).optional().nullable(),
  drivingLicense: z.string().max(50).optional().nullable(),
})

export const createEmployeeDocumentSchema = z.object({
  employeeId: z.string().uuid(),
  documentType: z.string().min(1).max(50),
  fileUrl: z.string().url()
})

export const createEmployeeCertificationSchema = z.object({
  employeeId: z.string().uuid(),
  name: z.string().min(2).max(200),
  issuer: z.string().min(2).max(200),
  issueDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  credentialUrl: z.string().url().optional().nullable()
})

export const updateEmployeeCertificationSchema = createEmployeeCertificationSchema.partial().omit({ employeeId: true })

export const createEmployeeEducationSchema = z.object({
  employeeId: z.string().uuid(),
  school: z.string().min(2).max(200),
  degree: z.string().min(2).max(200),
  fieldOfStudy: z.string().max(200).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  cgpa: z.string().max(20).optional().nullable()
})

export const updateEmployeeEducationSchema = createEmployeeEducationSchema.partial().omit({ employeeId: true })

export const createEmployeeExperienceSchema = z.object({
  employeeId: z.string().uuid(),
  companyName: z.string().min(2).max(200),
  title: z.string().min(2).max(200),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  description: z.string().max(2000).optional().nullable()
})

export const updateEmployeeExperienceSchema = createEmployeeExperienceSchema.partial().omit({ employeeId: true })

export const updateEmployeePreferenceSchema = z.object({
  theme: z.string().max(50).optional(),
  language: z.string().max(20).optional(),
  timezone: z.string().max(100).optional().nullable(),
  dashboardWidgets: z.any().optional(),
  notificationSettings: z.record(z.string(), z.any()).optional()
})

export type UpdatePersonalDetailsInput = z.infer<typeof updatePersonalDetailsSchema>
export type CreateEmployeeDocumentInput = z.infer<typeof createEmployeeDocumentSchema>
export type CreateEmployeeCertificationInput = z.infer<typeof createEmployeeCertificationSchema>
export type UpdateEmployeeCertificationInput = z.infer<typeof updateEmployeeCertificationSchema>
export type CreateEmployeeEducationInput = z.infer<typeof createEmployeeEducationSchema>
export type UpdateEmployeeEducationInput = z.infer<typeof updateEmployeeEducationSchema>
export type CreateEmployeeExperienceInput = z.infer<typeof createEmployeeExperienceSchema>
export type UpdateEmployeeExperienceInput = z.infer<typeof updateEmployeeExperienceSchema>
export type UpdateEmployeePreferenceInput = z.infer<typeof updateEmployeePreferenceSchema>
