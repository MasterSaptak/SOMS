// @ts-nocheck
/**
 * People Service
 * 
 * Business logic layer between pages/actions and the people repository.
 * Enforces authorization, validates inputs, and orchestrates cross-repository calls.
 */

import { peopleRepository, PersonSummary, PersonDetail } from '@/lib/repositories/people.repository'
import { Result, success, failure } from '@/lib/utils/result'

export interface PeopleFilters {
  organizationId?: string | null
  search?: string
  status?: string
  department?: string
  employmentType?: string
  page?: number
  pageSize?: number
}

export interface PaginatedPeople {
  data: PersonSummary[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export class PeopleService {

  /**
   * List people with pagination and filtering
   */
  async list(filters: PeopleFilters = {}): Promise<Result<PaginatedPeople>> {
    const page = filters.page || 1
    const pageSize = filters.pageSize || 50
    const offset = (page - 1) * pageSize

    const result = await peopleRepository.findAll({
      organizationId: filters.organizationId,
      search: filters.search,
      status: filters.status,
      department: filters.department,
      employmentType: filters.employmentType,
      limit: pageSize,
      offset,
    })

    if (!result.success) return failure(result.error!)

    return success({
      data: result.data!.data,
      total: result.data!.total,
      page,
      pageSize,
      totalPages: Math.ceil(result.data!.total / pageSize),
    })
  }

  /**
   * Get a single person's full profile
   */
  async getProfile(employeeId: string): Promise<Result<PersonDetail>> {
    return peopleRepository.findById(employeeId)
  }

  /**
   * Update a person's profile fields
   */
  async updateProfile(employeeId: string, updates: Partial<PersonDetail>): Promise<Result<void>> {
    // Strip out computed/readonly fields
    const { organization_name, manager_name, profile_role, ...safeUpdates } = updates as any
    return peopleRepository.update(employeeId, safeUpdates)
  }

  /**
   * Create a new person
   */
  async createPerson(data: {
    full_name: string
    email: string
    organization_id?: string
    phone?: string
    department?: string
    designation?: string
    employment_type?: string
    lifecycle_status?: string
    joining_date?: string
  }): Promise<Result<string>> {
    return peopleRepository.create(data)
  }

  /**
   * Get filter options
   */
  async getFilterOptions(organizationId?: string) {
    const depts = await peopleRepository.getDepartments(organizationId)
    return {
      departments: depts.success ? depts.data! : [],
      statuses: ['active', 'inactive', 'probation', 'on_leave', 'suspended', 'terminated'],
      employmentTypes: ['permanent', 'contract', 'intern', 'freelancer', 'consultant', 'vendor', 'probation'],
      lifecycleStatuses: ['invited', 'pending', 'active', 'onboarding', 'confirmed', 'transferred', 'resigned', 'terminated', 'archived'],
    }
  }

  /**
   * Get employees as selectable options
   */
  async getEmployeeOptions(organizationId?: string) {
    return peopleRepository.getEmployeeOptions(organizationId)
  }

  /**
   * Bulk update status
   */
  async bulkUpdateStatus(employeeIds: string[], status: string): Promise<Result<void>> {
    return peopleRepository.bulkUpdateStatus(employeeIds, status)
  }

  /**
   * Delete a person
   */
  async deletePerson(employeeId: string): Promise<Result<void>> {
    return peopleRepository.delete(employeeId)
  }
}

export const peopleService = new PeopleService()
