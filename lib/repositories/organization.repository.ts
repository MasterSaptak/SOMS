import { BaseRepository } from '@/lib/repositories/base.repository'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import type { Organization, OrganizationMember, OrganizationInvitation, OrgMemberRole } from '@/types/organizations'

// Helper: returns client cast to any for Sprint-A tables not yet in generated types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUntypedClient(): Promise<any> {
  const client = await createServerClient()
  return client as unknown as any
}

export class OrganizationRepository extends BaseRepository<'organizations'> {
  constructor() {
    super('organizations')
  }

  async findBySlug(slug: string): Promise<Result<Organization>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('organizations')
        .select('*')
        .eq('slug' as never, slug)
        .single()

      if (error || !data) return failure(new NotFoundError(`Organization with slug '${slug}' not found`))
      return success(data as object as Organization)
    } catch (err) {
      logger.error('[OrganizationRepository] findBySlug failed', err)
      return failure(err as Error)
    }
  }

  async findUserMemberships(userId: string): Promise<Result<OrganizationMember[]>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_members')
        .select('*, organizations(*)')
        .eq('user_id', userId)
        .eq('status', 'active')

      if (error) return failure(new Error(error.message))
      return success((data || []) as object[] as OrganizationMember[])
    } catch (err) {
      logger.error('[OrganizationRepository] findUserMemberships failed', err)
      return failure(err as Error)
    }
  }

  async findMember(orgId: string, userId: string): Promise<Result<OrganizationMember>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single()

      if (error || !data) return failure(new NotFoundError('Member not found'))
      return success(data as object as OrganizationMember)
    } catch (err) {
      logger.error('[OrganizationRepository] findMember failed', err)
      return failure(err as Error)
    }
  }

  async findMembers(orgId: string): Promise<Result<OrganizationMember[]>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_members')
        .select('*, employees(full_name, email, profile_photo)')
        .eq('organization_id', orgId)
        .neq('status', 'left')
        .order('joined_at', { ascending: true })

      if (error) return failure(new Error(error.message))
      return success((data || []) as object[] as OrganizationMember[])
    } catch (err) {
      logger.error('[OrganizationRepository] findMembers failed', err)
      return failure(err as Error)
    }
  }

  async addMember(orgId: string, userId: string, role: OrgMemberRole): Promise<Result<OrganizationMember>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: userId,
          role,
          status: 'active',
          joined_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) return failure(new Error(error.message))
      return success(data as object as OrganizationMember)
    } catch (err) {
      logger.error('[OrganizationRepository] addMember failed', err)
      return failure(err as Error)
    }
  }

  async updateMemberRole(memberId: string, role: OrgMemberRole): Promise<Result<OrganizationMember>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single()

      if (error) return failure(new Error(error.message))
      return success(data as object as OrganizationMember)
    } catch (err) {
      logger.error('[OrganizationRepository] updateMemberRole failed', err)
      return failure(err as Error)
    }
  }

  async removeMember(memberId: string): Promise<Result<boolean>> {
    try {
      const sb = await getUntypedClient()
      const { error } = await sb
        .from('organization_members')
        .update({ status: 'left' })
        .eq('id', memberId)

      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[OrganizationRepository] removeMember failed', err)
      return failure(err as Error)
    }
  }

  async createInvitation(payload: {
    organizationId: string
    invitedByUserId: string
    email: string
    role: OrgMemberRole
    token: string
    expiresAt: string
  }): Promise<Result<OrganizationInvitation>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_invitations')
        .insert({
          organization_id: payload.organizationId,
          invited_by_user_id: payload.invitedByUserId,
          email: payload.email,
          role: payload.role,
          token: payload.token,
          status: 'pending',
          expires_at: payload.expiresAt,
        })
        .select()
        .single()

      if (error) return failure(new Error(error.message))
      return success(data as object as OrganizationInvitation)
    } catch (err) {
      logger.error('[OrganizationRepository] createInvitation failed', err)
      return failure(err as Error)
    }
  }

  async findInvitationByToken(token: string): Promise<Result<OrganizationInvitation>> {
    try {
      const sb = await getUntypedClient()
      const { data, error } = await sb
        .from('organization_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (error || !data) return failure(new NotFoundError('Invitation not found or already used'))
      return success(data as object as OrganizationInvitation)
    } catch (err) {
      logger.error('[OrganizationRepository] findInvitationByToken failed', err)
      return failure(err as Error)
    }
  }

  async updateInvitationStatus(
    invitationId: string,
    status: 'accepted' | 'declined' | 'expired'
  ): Promise<Result<boolean>> {
    try {
      const sb = await getUntypedClient()
      const { error } = await sb
        .from('organization_invitations')
        .update({ status })
        .eq('id', invitationId)

      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[OrganizationRepository] updateInvitationStatus failed', err)
      return failure(err as Error)
    }
  }

  async archiveOrganization(orgId: string): Promise<Result<boolean>> {
    try {
      const client = await this.getClient()
      const { error } = await client
        .from('organizations')
        .update({ is_active: false } as never)
        .eq('id' as never, orgId)

      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[OrganizationRepository] archiveOrganization failed', err)
      return failure(err as Error)
    }
  }
}

export const organizationRepository = new OrganizationRepository()
