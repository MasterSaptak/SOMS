import { globalAdminRepository } from '@/lib/repositories/global-admin.repository'
import { Result, failure } from '@/lib/utils/result'

export class GlobalAdminService {
  async getAllUsers(): Promise<Result<any[]>> {
    return globalAdminRepository.getAllUsers()
  }

  async deleteUser(userId: string): Promise<Result<boolean>> {
    return globalAdminRepository.deleteUser(userId)
  }

  async setBanStatus(userId: string, isBanned: boolean): Promise<Result<boolean>> {
    return globalAdminRepository.setBanStatus(userId, isBanned)
  }

  async updateUserRole(userId: string, role: string): Promise<Result<boolean>> {
    return globalAdminRepository.updateUserRole(userId, role)
  }

  async getAllOrganizations(): Promise<Result<any[]>> {
    return globalAdminRepository.getAllOrganizations()
  }

  async assignUserToOrganization(userId: string, email: string, orgId: string, role?: string): Promise<Result<boolean>> {
    return globalAdminRepository.assignUserToOrganization(userId, email, orgId, role)
  }
}

export const globalAdminService = new GlobalAdminService()

