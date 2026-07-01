'use server'

import { createClient } from '@/lib/supabase/server'
import { organizationService } from '@/lib/services/organization.service'
import { permissionService } from '@/lib/services/permission.service'
import { Result, failure } from '@/lib/utils/result'
import { AuthError, PermissionError } from '@/lib/errors'
import type { Organization, OrganizationMember, OrganizationInvitation } from '@/types/organizations'
import type { CreateOrganizationInput, UpdateOrganizationInput, InviteMemberInput } from '@/lib/validators/organization.validator'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new AuthError('Not authenticated')
  }
  return { supabase, userId: user.id }
}

/**
 * Create a new organization.
 */
export async function createOrganizationAction(
  input: CreateOrganizationInput
): Promise<Result<Organization>> {
  try {
    const { userId } = await getAuthContext()
    return await organizationService.createOrganization(input, userId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to create organization'))
  }
}

/**
 * Update an existing organization.
 */
export async function updateOrganizationAction(
  input: UpdateOrganizationInput
): Promise<Result<Organization>> {
  try {
    const { userId } = await getAuthContext()
    return await organizationService.updateOrganization(input, userId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to update organization'))
  }
}

/**
 * Get all organizations the current user belongs to.
 */
export async function getUserOrganizationsAction(): Promise<Result<OrganizationMember[]>> {
  try {
    const { userId } = await getAuthContext()
    return await organizationService.getUserOrganizations(userId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to fetch organizations'))
  }
}

/**
 * Get all members of an organization.
 */
export async function getOrganizationMembersAction(orgId: string): Promise<Result<OrganizationMember[]>> {
  try {
    const { userId } = await getAuthContext()

    // Authorization: user must be member of org
    await permissionService.authorize(userId, orgId, 'employee.read')

    return await organizationService.getOrganizationMembers(orgId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to fetch members'))
  }
}

/**
 * Invite a member to an organization.
 */
export async function inviteMemberAction(
  input: InviteMemberInput
): Promise<Result<OrganizationInvitation>> {
  try {
    const { userId } = await getAuthContext()

    // Authorization: must have user.invite permission
    const authResult = await permissionService.authorize(userId, input.organizationId, 'user.invite')
    if (!authResult.success) return failure(authResult.error)

    return await organizationService.inviteMember(input, userId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to invite member'))
  }
}

/**
 * Accept an organization invitation via token.
 */
export async function acceptInvitationAction(token: string): Promise<Result<OrganizationMember>> {
  try {
    const { userId } = await getAuthContext()
    return await organizationService.acceptInvitation(token, userId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to accept invitation'))
  }
}



/**
 * Remove a member from an organization.
 */
export async function removeMemberAction(
  memberId: string,
  organizationId: string
): Promise<Result<boolean>> {
  try {
    const { userId } = await getAuthContext()

    const authResult = await permissionService.authorize(userId, organizationId, 'user.remove')
    if (!authResult.success) return failure(authResult.error)

    return await organizationService.removeMember(memberId, userId, organizationId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to remove member'))
  }
}

/**
 * Archive an organization (owner only).
 */
export async function archiveOrganizationAction(orgId: string): Promise<Result<boolean>> {
  try {
    const { userId } = await getAuthContext()
    return await organizationService.archiveOrganization(orgId, userId)
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to archive organization'))
  }
}



export async function getFallbackOrganizationAction(): Promise<Result<Organization | null>> {
  try {
    const { getAdminClient } = await import('@/lib/supabase/server')
    const adminClient = getAdminClient()
    const { data, error } = await adminClient
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return { success: true, data: null } // No rows found
      throw error
    }
    
    return { success: true, data: data as unknown as Organization }
  } catch (err) {
    return failure(err instanceof Error ? err : new Error('Failed to fetch fallback organization'))
  }
}
