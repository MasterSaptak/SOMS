import React from 'react'
import { TeamDirectory } from './team-directory'
import { teamService } from '@/lib/services/organization/team.service'
import { branchService } from '@/lib/services/organization/branch.service'
import { departmentService } from '@/lib/services/organization/department.service'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
  const cookieStore = await cookies()
  const currentOrgId = cookieStore.get('soms_current_org')?.value

  if (!currentOrgId) {
    return <div>No active organization selected.</div>
  }

  // Fetch initial data for the directory
  const [teamsRes, branchesRes, deptsRes] = await Promise.all([
    teamService.getTeamsByOrganization(currentOrgId),
    branchService.getBranches(currentOrgId),
    departmentService.getDepartments(currentOrgId)
  ])

  const teams = teamsRes.data || []
  const branches = branchesRes.data || []
  const departments = deptsRes.data || []

  return (
    <TeamDirectory 
      initialTeams={teams} 
      orgId={currentOrgId}
      branches={branches}
      departments={departments}
    />
  )
}
