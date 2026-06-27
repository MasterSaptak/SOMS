import { z } from 'zod'

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  slug: z.string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  website: z.string().url('Invalid website URL').optional().nullable(),
  industry: z.string().max(100).optional().nullable(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional().nullable(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial().extend({
  id: z.string().uuid('Invalid organization ID'),
})

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'manager', 'employee', 'guest']),
  organizationId: z.string().uuid('Invalid organization ID'),
})

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(['admin', 'manager', 'employee', 'guest']),
})

export const switchOrganizationSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
})

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
})

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>
export type SwitchOrganizationInput = z.infer<typeof switchOrganizationSchema>
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>
