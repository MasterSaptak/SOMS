import { departmentRepository, teamRepository, designationRepository, workLocationRepository } from '@/lib/repositories/organization-structure.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { ValidationError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import { eventBus } from '@/lib/events/event-bus'
import { 
  createDepartmentSchema, createTeamSchema, 
  createDesignationSchema, createWorkLocationSchema,
  type CreateDepartmentInput, type CreateTeamInput,
  type CreateDesignationInput, type CreateWorkLocationInput
} from '@/lib/validators/employee.validator'
import type { Department, Team, Designation, WorkLocation } from '@/lib/types'

export class OrganizationStructureService {
  async createDepartment(input: CreateDepartmentInput, createdByUserId: string): Promise<Result<Department>> {
    const validation = createDepartmentSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid department data', validation.error.flatten().fieldErrors))
    }

    const { organizationId, name, headId, parentId } = validation.data

    const result = await departmentRepository.create({
      organization_id: organizationId,
      name,
      head_id: headId,
      parent_id: parentId
    } as never)

    if (!result.success) return failure(result.error)

    await eventBus.publish(
      eventBus.createEvent('department.created', { departmentId: (result.data as any).id, name }, { userId: createdByUserId, organizationId })
    )

    logger.info('[OrganizationStructureService] Department created', { name, organizationId })
    return success(result.data as unknown as Department)
  }

  async createTeam(input: CreateTeamInput, createdByUserId: string): Promise<Result<Team>> {
    const validation = createTeamSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid team data', validation.error.flatten().fieldErrors))
    }

    const { departmentId, name, leadId } = validation.data

    const result = await teamRepository.create({
      department_id: departmentId,
      name,
      lead_id: leadId
    } as never)

    if (!result.success) return failure(result.error)

    await eventBus.publish(
      eventBus.createEvent('team.created', { teamId: (result.data as any).id, name }, { userId: createdByUserId })
    )

    return success(result.data as unknown as Team)
  }

  async createDesignation(input: CreateDesignationInput, createdByUserId: string): Promise<Result<Designation>> {
    const validation = createDesignationSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid designation data', validation.error.flatten().fieldErrors))
    }

    const { organizationId, title, level } = validation.data

    const result = await designationRepository.create({
      organization_id: organizationId,
      title,
      level
    } as never)

    if (!result.success) return failure(result.error)

    return success(result.data as unknown as Designation)
  }

  async createWorkLocation(input: CreateWorkLocationInput, createdByUserId: string): Promise<Result<WorkLocation>> {
    const validation = createWorkLocationSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid work location data', validation.error.flatten().fieldErrors))
    }

    const { organizationId, name, address, timezone } = validation.data

    const result = await workLocationRepository.create({
      organization_id: organizationId,
      name,
      address,
      timezone
    } as never)

    if (!result.success) return failure(result.error)

    return success(result.data as unknown as WorkLocation)
  }
}

export const organizationStructureService = new OrganizationStructureService()
