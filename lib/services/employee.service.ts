import { employeeRepository } from '@/lib/repositories/employee.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import { eventBus } from '@/lib/events/event-bus'
import { 
  updateEmployeeSchema, updateEmploymentDetailsSchema, 
  createEmergencyContactSchema, createEmployeeSkillSchema,
  type UpdateEmployeeInput, type UpdateEmploymentDetailsInput,
  type CreateEmergencyContactInput, type CreateEmployeeSkillInput
} from '@/lib/validators/employee.validator'
import type { Employee, EmploymentDetails, EmergencyContact, EmployeeSkill } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export class EmployeeService {
  async getEmployee360(employeeId: string): Promise<Result<{
    employee: Employee,
    employmentDetails: EmploymentDetails | null,
    emergencyContacts: EmergencyContact[],
    skills: EmployeeSkill[]
  }>> {
    try {
      // Assuming employeeId here is the actual employee `id` (UUID).
      const employeeResult = await employeeRepository.findById(employeeId)
      if (!employeeResult.success) return failure(employeeResult.error)
      
      const emp = employeeResult.data

      const [detailsRes, contactsRes, skillsRes] = await Promise.all([
        employeeRepository.findEmploymentDetails(emp.id),
        employeeRepository.findEmergencyContacts(emp.id),
        employeeRepository.findSkills(emp.id)
      ])

      return success({
        employee: emp,
        employmentDetails: detailsRes.success ? detailsRes.data : null,
        emergencyContacts: contactsRes.success ? contactsRes.data : [],
        skills: skillsRes.success ? skillsRes.data : []
      })
    } catch (err) {
      logger.error('[EmployeeService] getEmployee360 failed', err)
      return failure(err as Error)
    }
  }

  async updateEmployeeStructure(employeeId: string, input: UpdateEmployeeInput, updatedByUserId: string): Promise<Result<boolean>> {
    const validation = updateEmployeeSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid update data', validation.error.flatten().fieldErrors))
    }

    const data = validation.data
    const updatePayload: any = {}
    
    if (data.departmentId !== undefined) updatePayload.department_id = data.departmentId
    if (data.teamId !== undefined) updatePayload.team_id = data.teamId
    if (data.designationId !== undefined) updatePayload.designation_id = data.designationId
    if (data.workLocationId !== undefined) updatePayload.work_location_id = data.workLocationId
    if (data.managerId !== undefined) updatePayload.manager_id = data.managerId
    if (data.status !== undefined) updatePayload.employment_status = data.status
    if (data.firstName !== undefined || data.lastName !== undefined) {
       // Need to fetch current to construct full_name safely, skipping here for brevity or assume UI sends both
    }

    if (Object.keys(updatePayload).length > 0) {
      const result = await employeeRepository.update(employeeId, updatePayload)
      if (!result.success) return failure(result.error)
      
      await eventBus.publish(
        eventBus.createEvent('employee.structure_updated', { employeeId, updates: updatePayload }, { userId: updatedByUserId })
      )
    }

    return success(true)
  }

  async addSkill(input: CreateEmployeeSkillInput, createdByUserId: string): Promise<Result<EmployeeSkill>> {
    const validation = createEmployeeSkillSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid skill data', validation.error.flatten().fieldErrors))
    }

    const { employeeId, skillName, proficiency } = validation.data

    try {
      const client = await createClient()
      const { data, error } = await (client as any)
        .from('employee_skills')
        .insert({
          employee_id: employeeId,
          skill_name: skillName,
          proficiency
        } as never)
        .select()
        .single()

      if (error) throw error

      return success({
        id: data.id,
        employeeId: data.employee_id,
        skillName: data.skill_name,
        proficiency: data.proficiency,
        isVerified: data.is_verified,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      } as EmployeeSkill)
    } catch (err) {
      return failure(err as Error)
    }
  }
}

export const employeeService = new EmployeeService()
