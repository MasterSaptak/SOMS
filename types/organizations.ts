// ============================================================
// SOMS Enterprise — Organization Domain Types
// ============================================================

export type OrgMemberRole = 'owner' | 'admin' | 'manager' | 'employee' | 'guest'
export type OrgMemberStatus = 'active' | 'invited' | 'suspended' | 'left'
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired'

export interface Organization {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  website: string | null
  industry: string | null
  size: string | null
  plan: 'free' | 'pro' | 'enterprise'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OrganizationMember {
  id: string
  organizationId: string
  userId: string
  role: OrgMemberRole
  status: OrgMemberStatus
  joinedAt: string
  // Eager-loaded relations (optional)
  organization?: Organization
  user?: { email: string; full_name?: string }
}

export interface OrganizationInvitation {
  id: string
  organizationId: string
  invitedByUserId: string
  email: string
  role: OrgMemberRole
  token: string
  status: InvitationStatus
  expiresAt: string
  createdAt: string
}

export interface OrganizationDomain {
  id: string
  organizationId: string
  domain: string
  isVerified: boolean
  verificationToken: string | null
  verifiedAt: string | null
  createdAt: string
}

export interface OrganizationSettings {
  id: string
  organizationId: string
  key: string
  value: unknown
  updatedBy: string
  updatedAt: string
}

// Context type used in React providers
export interface OrganizationContext {
  activeOrg: Organization | null
  memberships: OrganizationMember[]
  isLoading: boolean
  switchOrganization: (orgId: string) => Promise<void>
  refreshOrganization: () => Promise<void>
}
