import React from 'react'
import { getUserOrganizationsAction } from '@/app/actions/organization.actions'
import OrganizationClient from './OrganizationClient'

export const dynamic = 'force-dynamic'

export default async function OrganizationSettingsPage() {
  const result = await getUserOrganizationsAction()
  
  // Extract organizations from members if the action returns members 
  // with joined organizations. 
  // Let's pass the raw data, OrganizationClient will handle it.
  const orgMembers = result.success ? result.data! : []

  return <OrganizationClient initialMembers={orgMembers} />
}
