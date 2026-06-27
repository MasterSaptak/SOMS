import React from 'react'
import { teamService } from '@/lib/services/organization/team.service'
import { workforceAnalyticsService } from '@/lib/services/organization/analytics.service'
import { TeamDashboardClient } from './client'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function TeamDetailsPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const orgId = cookieStore.get('soms_current_org')?.value

  if (!orgId) return <div>No active organization selected.</div>

  const { id } = params
  const [detailsRes, statsRes] = await Promise.all([
    teamService.getTeamDetails(id),
    workforceAnalyticsService.getTeamStats(id)
  ])

  if (detailsRes.error) {
    return notFound()
  }

  const { team, members } = detailsRes.data
  const stats = statsRes.data

  return (
    <TeamDashboardClient 
      team={team} 
      members={members} 
      stats={stats} 
      orgId={orgId}
    />
  )
}
