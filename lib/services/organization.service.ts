import { organizationRepository } from '@/lib/repositories/organization.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { ValidationError, PermissionError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import { eventBus } from '@/lib/events/event-bus'
import {
  createOrganizationSchema,
  inviteMemberSchema,
  type CreateOrganizationInput,
  type InviteMemberInput,
} from '@/lib/validators/organization.validator'
import type { Organization, OrganizationMember, OrganizationInvitation, OrgMemberRole } from '@/types/organizations'

export class OrganizationService {
  /**
   * Creates a new organization and sets the creator as the owner.
   */
  async createOrganization(
    input: CreateOrganizationInput,
    createdByUserId: string
  ): Promise<Result<Organization>> {
    // Validate input
    const validation = createOrganizationSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid organization data', validation.error.flatten().fieldErrors))
    }

    const { name, slug, website, industry, size } = validation.data

    // Create organization record
    const orgResult = await organizationRepository.create({
      name,
      slug,
      website: website || null,
      industry: industry || null,
      size: size || null,
    } as never)

    if (!orgResult.success) {
      logger.error('[OrganizationService] createOrganization failed', orgResult.error)
      return failure(orgResult.error)
    }

    const org = orgResult.data as unknown as Organization

    // Add creator as owner
    const memberResult = await organizationRepository.addMember(org.id, createdByUserId, 'owner')
    if (!memberResult.success) {
      logger.warn('[OrganizationService] Failed to add owner member', { orgId: org.id })
    }

    // Publish event
    await eventBus.publish(
      eventBus.createEvent('organization.created', { org, createdByUserId })
    )

    logger.info('[OrganizationService] Organization created', { orgId: org.id, name })
    await logger.audit('organization.create', 'organizations', {
      userId: createdByUserId,
      details: { orgId: org.id, name, slug },
    })

    return success(org)
  }

  /**
   * Invites a user to join an organization via email.
   */
  async inviteMember(input: InviteMemberInput, invitedByUserId: string): Promise<Result<OrganizationInvitation>> {
    const validation = inviteMemberSchema.safeParse(input)
    if (!validation.success) {
      return failure(new ValidationError('Invalid invitation data', validation.error.flatten().fieldErrors))
    }

    const { organizationId, email, role } = validation.data

    // Generate a secure token
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

    const invitationResult = await organizationRepository.createInvitation({
      organizationId,
      invitedByUserId,
      email,
      role: role as OrgMemberRole,
      token,
      expiresAt,
    })

    if (!invitationResult.success) {
      logger.error('[OrganizationService] inviteMember failed', invitationResult.error)
      return failure(invitationResult.error)
    }

    // Publish event — downstream handlers send the email
    await eventBus.publish(
      eventBus.createEvent('organization.member_invited', {
        invitation: invitationResult.data,
        invitedByUserId,
      })
    )

    logger.info('[OrganizationService] Member invited', { email, organizationId, role })

    return success(invitationResult.data)
  }

  /**
   * Accepts an invitation and adds the user to the organization.
   */
  async acceptInvitation(token: string, userId: string): Promise<Result<OrganizationMember>> {
    const invitationResult = await organizationRepository.findInvitationByToken(token)
    if (!invitationResult.success) {
      return failure(new NotFoundError('Invitation not found or already used'))
    }

    const invitation = invitationResult.data

    // Check expiry
    if (new Date(invitation.expiresAt) < new Date()) {
      await organizationRepository.updateInvitationStatus(invitation.id, 'expired')
      return failure(new ValidationError('Invitation has expired'))
    }

    // Add member
    const memberResult = await organizationRepository.addMember(
      invitation.organizationId,
      userId,
      invitation.role
    )

    if (!memberResult.success) {
      return failure(memberResult.error)
    }

    // Mark invitation as accepted
    await organizationRepository.updateInvitationStatus(invitation.id, 'accepted')

    // Publish event
    await eventBus.publish(
      eventBus.createEvent('organization.member_joined', {
        member: memberResult.data,
        invitationId: invitation.id,
      })
    )

    logger.info('[OrganizationService] Invitation accepted', { userId, orgId: invitation.organizationId })

    return success(memberResult.data)
  }

  /**
   * Removes a member from an organization (soft delete).
   */
  async removeMember(
    memberId: string,
    requestingUserId: string,
    organizationId: string
  ): Promise<Result<boolean>> {
    // Check the requesting user has permission to remove members
    const requesterResult = await organizationRepository.findMember(organizationId, requestingUserId)
    if (!requesterResult.success) {
      return failure(new PermissionError('You are not a member of this organization'))
    }

    const requesterRole = requesterResult.data.role
    if (!['owner', 'admin'].includes(requesterRole)) {
      return failure(new PermissionError('Only owners and admins can remove members'))
    }

    const removeResult = await organizationRepository.removeMember(memberId)
    if (!removeResult.success) {
      return failure(removeResult.error)
    }

    await eventBus.publish(
      eventBus.createEvent('organization.member_removed', { memberId, organizationId, removedBy: requestingUserId })
    )

    logger.info('[OrganizationService] Member removed', { memberId, organizationId })

    return success(true)
  }

  /**
   * Get all organizations a user belongs to.
   */
  async getUserOrganizations(userId: string): Promise<Result<OrganizationMember[]>> {
    return await organizationRepository.findUserMemberships(userId)
  }

  /**
   * Get all members of an organization.
   */
  async getOrganizationMembers(orgId: string): Promise<Result<OrganizationMember[]>> {
    return await organizationRepository.findMembers(orgId)
  }

  /**
   * Archive (soft-delete) an organization. Only owners can do this.
   */
  async archiveOrganization(orgId: string, requestingUserId: string): Promise<Result<boolean>> {
    const requesterResult = await organizationRepository.findMember(orgId, requestingUserId)
    if (!requesterResult.success) {
      return failure(new PermissionError('You are not a member of this organization'))
    }

    if (requesterResult.data.role !== 'owner') {
      return failure(new PermissionError('Only owners can archive an organization'))
    }

    const archiveResult = await organizationRepository.archiveOrganization(orgId)
    if (!archiveResult.success) {
      return failure(archiveResult.error)
    }

    await eventBus.publish(
      eventBus.createEvent('organization.archived', { orgId, archivedBy: requestingUserId })
    )

    logger.info('[OrganizationService] Organization archived', { orgId })
    await logger.audit('organization.archive', 'organizations', {
      userId: requestingUserId,
      details: { orgId },
    })

    return success(true)
  }
}

export const organizationService = new OrganizationService()
