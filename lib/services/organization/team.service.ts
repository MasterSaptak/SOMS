import { teamRepository, teamMemberRepository } from '@/lib/repositories/organization-structure.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'
import { createClient } from '@/lib/supabase/server'

export class TeamService {
  async getTeamsByOrganization(orgId: string): Promise<Result<any[]>> {
    try {
      const res = await teamRepository.findByOrganizationId(orgId)
      if (!res.success) return failure(res.error)
      return success(res.data)
    } catch (err) {
      logger.error('[TeamService] getTeamsByOrganization error', err)
      return failure(err as Error)
    }
  }

  async getTeamDetails(teamId: string): Promise<Result<{ team: any, members: any[] }>> {
    try {
      const teamRes = await teamRepository.findById(teamId)
      if (!teamRes.success) return failure(teamRes.error)
      if (!teamRes.data) return failure(new Error('Team not found'))
      
      const membersRes = await teamMemberRepository.findByTeamId(teamId)
      
      return success({
        team: teamRes.data,
        members: membersRes.success ? membersRes.data : []
      })
    } catch (err) {
      logger.error('[TeamService] getTeamDetails error', err)
      return failure(err as Error)
    }
  }

  async createTeam(data: any): Promise<Result<any>> {
    try {
      // Auto-generate code if requested
      if (!data.code || data.code === 'AUTO') {
        const prefix = data.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'TEAM'
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
        data.code = `${prefix}-${randomStr}`
      }

      const res = await teamRepository.create(data)
      if (!res.success) return failure(res.error)
      return success(res.data)
    } catch (err) {
      logger.error('[TeamService] createTeam error', err)
      return failure(err as Error)
    }
  }

  async updateTeam(id: string, data: any): Promise<Result<any>> {
    try {
      const res = await teamRepository.update(id, data)
      if (!res.success) return failure(res.error)
      return success(res.data)
    } catch (err) {
      logger.error('[TeamService] updateTeam error', err)
      return failure(err as Error)
    }
  }

  async addTeamMember(teamId: string, employeeId: string, roleId: string | null = null, isPrimary: boolean = false): Promise<Result<any>> {
    try {
      const client = await createClient()

      if (isPrimary) {
        // Unset primary for this employee in other teams
        await (client as any)
          .from('team_members')
          .update({ is_primary: false })
          .eq('employee_id', employeeId)
      }

      const res = await teamMemberRepository.create({
        team_id: teamId,
        employee_id: employeeId,
        role_id: roleId,
        is_primary: isPrimary
      })

      if (!res.success) return failure(res.error)
      return success(res.data)
    } catch (err) {
      logger.error('[TeamService] addTeamMember error', err)
      return failure(err as Error)
    }
  }

  async removeTeamMember(teamId: string, employeeId: string): Promise<Result<void>> {
    try {
      const client = await createClient()
      const { error } = await (client as any)
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('employee_id', employeeId)

      if (error) return failure(new Error(error.message))
      return success(undefined)
    } catch (err) {
      logger.error('[TeamService] removeTeamMember error', err)
      return failure(err as Error)
    }
  }
}

export const teamService = new TeamService()
