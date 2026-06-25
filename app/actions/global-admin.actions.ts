'use server'

import { createClient } from '@/lib/supabase/server'
import { AuthError, PermissionError } from '@/lib/errors'
import { globalAdminService } from '@/lib/services/global-admin.service'
import { revalidatePath } from 'next/cache'

async function assertSuperAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new AuthError('Not authenticated')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'super_admin' && profile?.role !== 'admin') {
    throw new PermissionError('Unauthorized. Super admin access required.')
  }
}

export async function getAllGlobalUsersAction() {
  try {
    await assertSuperAdmin()
    return await globalAdminService.getAllUsers()
  } catch (err: any) {
    return { success: false, error: { message: err.message } }
  }
}

export async function adminDeleteUserAction(userId: string) {
  try {
    await assertSuperAdmin()
    const result = await globalAdminService.deleteUser(userId)
    if (result.success) revalidatePath('/admin/hr')
    return result
  } catch (err: any) {
    return { success: false, error: { message: err.message } }
  }
}

export async function adminBanUserAction(userId: string, isBanned: boolean) {
  try {
    await assertSuperAdmin()
    const result = await globalAdminService.setBanStatus(userId, isBanned)
    if (result.success) revalidatePath('/admin/hr')
    return result
  } catch (err: any) {
    return { success: false, error: { message: err.message } }
  }
}

export async function adminUpdateUserRoleAction(userId: string, role: string) {
  try {
    await assertSuperAdmin()
    const result = await globalAdminService.updateUserRole(userId, role)
    if (result.success) revalidatePath('/admin/hr')
    return result
  } catch (err: any) {
    return { success: false, error: { message: err.message } }
  }
}

export async function getAllOrganizationsAction() {
  try {
    await assertSuperAdmin()
    return await globalAdminService.getAllOrganizations()
  } catch (err: any) {
    return { success: false, error: { message: err.message } }
  }
}

export async function assignUserToOrgAction(userId: string, email: string, orgId: string, role?: string) {
  try {
    await assertSuperAdmin()
    const result = await globalAdminService.assignUserToOrganization(userId, email, orgId, role)
    if (result.success) revalidatePath('/admin/hr')
    return result
  } catch (err: any) {
    return { success: false, error: { message: err.message } }
  }
}
