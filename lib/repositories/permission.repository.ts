import { createClient as createServerClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'
import type { Role, RolePermission, UserRole, EffectivePermissions, Permission } from '@/types/permissions'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getSB(): Promise<any> {
  const client = await createServerClient()
  return client as any
}

/**
 * PermissionRepository handles all RBAC database operations.
 * Does NOT extend BaseRepository because it manages multiple interrelated tables.
 */
export class PermissionRepository {
  async findRolesByOrg(organizationId: string): Promise<Result<Role[]>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('roles')
        .select('*, role_permissions(permission_key)')
        .or(`organization_id.eq.${organizationId},is_system.eq.true`)
        .order('is_system', { ascending: false })

      if (error) return failure(new Error(error.message))

      const roles = (data || []).map((row: Record<string, unknown>) => ({
        ...row,
        permissions: ((row.role_permissions as { permission_key: string }[]) || []).map(
          (rp) => rp.permission_key as Permission
        ),
      }))

      return success(roles as Role[])
    } catch (err) {
      logger.error('[PermissionRepository] findRolesByOrg failed', err)
      return failure(err as Error)
    }
  }

  async findUserRoles(userId: string, organizationId: string): Promise<Result<UserRole[]>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('user_roles')
        .select('*, roles(*, role_permissions(permission_key))')
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (error) return failure(new Error(error.message))
      return success((data || []) as object[] as UserRole[])
    } catch (err) {
      logger.error('[PermissionRepository] findUserRoles failed', err)
      return failure(err as Error)
    }
  }

  /**
   * Resolves all effective permissions for a user in an org.
   */
  async getEffectivePermissions(userId: string, organizationId: string): Promise<Result<EffectivePermissions>> {
    try {
      const sb = await getSB()

      const { data: userRoleData, error: roleError } = await sb
        .from('user_roles')
        .select(`
          roles (
            name,
            role_permissions ( permission_key )
          )
        `)
        .eq('user_id', userId)
        .eq('organization_id', organizationId)

      if (roleError) return failure(new Error(roleError.message))

      const permissionSet = new Set<Permission>()
      const roleNames: string[] = []

      for (const ur of userRoleData || []) {
        const role = ur.roles as {
          name: string
          role_permissions: { permission_key: string }[]
        } | null

        if (role) {
          roleNames.push(role.name)
          for (const rp of role.role_permissions || []) {
            permissionSet.add(rp.permission_key as Permission)
          }
        }
      }

      return success({
        userId,
        organizationId,
        roles: roleNames,
        permissions: permissionSet,
        resolvedAt: new Date().toISOString(),
      })
    } catch (err) {
      logger.error('[PermissionRepository] getEffectivePermissions failed', err)
      return failure(err as Error)
    }
  }

  async assignRoleToUser(userId: string, organizationId: string, roleId: string, assignedBy: string): Promise<Result<UserRole>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('user_roles')
        .upsert({
          user_id: userId,
          organization_id: organizationId,
          role_id: roleId,
          assigned_by: assignedBy,
          assigned_at: new Date().toISOString(),
        }, { onConflict: 'user_id,organization_id,role_id' })
        .select()
        .single()

      if (error) return failure(new Error(error.message))
      return success(data as object as UserRole)
    } catch (err) {
      logger.error('[PermissionRepository] assignRoleToUser failed', err)
      return failure(err as Error)
    }
  }

  async createRole(payload: {
    name: string
    displayName: string
    organizationId: string | null
    isSystem: boolean
  }): Promise<Result<Role>> {
    try {
      const sb = await getSB()
      const { data, error } = await sb
        .from('roles')
        .insert({
          name: payload.name,
          display_name: payload.displayName,
          organization_id: payload.organizationId,
          is_system: payload.isSystem,
        })
        .select()
        .single()

      if (error) return failure(new Error(error.message))
      return success({ ...data, permissions: [] } as object as Role)
    } catch (err) {
      logger.error('[PermissionRepository] createRole failed', err)
      return failure(err as Error)
    }
  }

  async setRolePermissions(roleId: string, permissionKeys: Permission[]): Promise<Result<boolean>> {
    try {
      const sb = await getSB()

      await sb.from('role_permissions').delete().eq('role_id', roleId)

      if (permissionKeys.length > 0) {
        const { error } = await sb
          .from('role_permissions')
          .insert(permissionKeys.map((key) => ({
            role_id: roleId,
            permission_key: key,
          })))

        if (error) return failure(new Error(error.message))
      }

      return success(true)
    } catch (err) {
      logger.error('[PermissionRepository] setRolePermissions failed', err)
      return failure(err as Error)
    }
  }
}

export const permissionRepository = new PermissionRepository()
