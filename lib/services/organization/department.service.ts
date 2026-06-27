import { departmentRepository } from '@/lib/repositories/organization-structure.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'

export class DepartmentService {
  async getDepartments(orgId: string): Promise<Result<any[]>> {
    try {
      const res = await departmentRepository.findByOrganizationId(orgId)
      if (res.error) return failure(new Error(res.error))
      
      // We'll return the flat list. The UI or a tree service can construct the hierarchy.
      return success(res.data)
    } catch (err) {
      logger.error('[DepartmentService] getDepartments error', err)
      return failure(err as Error)
    }
  }

  async createDepartment(data: any): Promise<Result<any>> {
    try {
      const res = await departmentRepository.create(data)
      if (res.error) return failure(new Error(res.error))
      return success(res.data)
    } catch (err) {
      logger.error('[DepartmentService] createDepartment error', err)
      return failure(err as Error)
    }
  }

  async updateDepartment(id: string, data: any): Promise<Result<any>> {
    try {
      const res = await departmentRepository.update(id, data)
      if (res.error) return failure(new Error(res.error))
      return success(res.data)
    } catch (err) {
      logger.error('[DepartmentService] updateDepartment error', err)
      return failure(err as Error)
    }
  }

  async deleteDepartment(id: string): Promise<Result<void>> {
    try {
      const res = await departmentRepository.delete(id)
      if (res.error) return failure(new Error(res.error))
      return success(undefined)
    } catch (err) {
      logger.error('[DepartmentService] deleteDepartment error', err)
      return failure(err as Error)
    }
  }
}

export const departmentService = new DepartmentService()
