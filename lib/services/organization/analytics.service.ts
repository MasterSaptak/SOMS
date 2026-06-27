import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'

export class WorkforceAnalyticsService {
  async getOrganizationStats(orgId: string): Promise<Result<any>> {
    try {
      const client = await createClient()
      
      const [{ count: branchesCount }, { count: deptsCount }, { count: teamsCount }, { count: empsCount }] = await Promise.all([
        client.from('branches').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        client.from('departments').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        client.from('teams').select('*', { count: 'exact', head: true }).eq('organization_id', orgId),
        client.from('employees').select('*', { count: 'exact', head: true }).eq('organization_id', orgId)
      ])

      return success({
        totalBranches: branchesCount || 0,
        totalDepartments: deptsCount || 0,
        totalTeams: teamsCount || 0,
        totalEmployees: empsCount || 0
      })
    } catch (err) {
      logger.error('[WorkforceAnalyticsService] getOrganizationStats error', err)
      return failure(err as Error)
    }
  }

  async getTeamStats(teamId: string): Promise<Result<any>> {
    try {
      const client = await createClient()
      
      const { data: team, error } = await client.from('teams').select('max_members').eq('id', teamId).single()
      if (error) throw error

      const { count: membersCount, error: countErr } = await client.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', teamId)
      if (countErr) throw countErr

      const max = team.max_members || 10
      const current = membersCount || 0
      const capacityPct = Math.round((current / max) * 100)

      return success({
        currentMembers: current,
        maxMembers: max,
        capacityPercentage: capacityPct > 100 ? 100 : capacityPct,
        activeToday: 0 // Placeholder for future attendance integration
      })
    } catch (err) {
      logger.error('[WorkforceAnalyticsService] getTeamStats error', err)
      return failure(err as Error)
    }
  }
}

export const workforceAnalyticsService = new WorkforceAnalyticsService()
