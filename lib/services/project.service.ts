import { projectRepository, Project, BudgetCategory } from '@/lib/repositories/project.repository'
import { Result, success, failure } from '@/lib/utils/result'

export class ProjectService {
  private async enforceProjectRole(organizationId: string, projectId: string, actorId: string, allowedRoles: string[]): Promise<void> {
    const projectRes = await projectRepository.findById(projectId, organizationId)
    if (!projectRes.success || !projectRes.data) throw new Error('Project not found')
    
    const member = projectRes.data.project_members?.find((m: any) => m.employee_id === actorId)
    if (!member) throw new Error('Not a member of this project')
    if (!allowedRoles.includes(member.role)) throw new Error('Insufficient permissions')
  }
  async getOrganizationProjects(organizationId: string, options?: any): Promise<Result<any[]>> {
    return await projectRepository.findByOrganization(organizationId, options)
  }

  async getAllProjects(options?: any): Promise<Result<any[]>> {
    return await projectRepository.findAllUserProjects(options)
  }

  async getProject(projectId: string, organizationId?: string): Promise<Result<any>> {
    return await projectRepository.findById(projectId, organizationId)
  }

  async createProject(organizationId: string, projectData: Partial<Project>, memberIds: string[] = [], teamIds: string[] = []): Promise<Result<any>> {
    try {
      // Calculate initial health score based on data or default to On Track
      const health_score = projectData.health_score || 'On Track'
      const result = await projectRepository.create({ ...projectData, organization_id: organizationId, health_score })
      if (!result.success) throw result.error

      const project = result.data

      // Add owner as a Manager/Owner automatically
      const initialMembers = Array.from(new Set([
        ...(projectData.owner_id ? [projectData.owner_id] : []),
        ...memberIds
      ]))

      if (initialMembers.length > 0) {
        await Promise.all(initialMembers.map(empId =>
          projectRepository.addMember(project.id, empId, organizationId, empId === projectData.owner_id ? 'Owner' : 'Member')
        ))
      }

      if (teamIds.length > 0) {
        await Promise.all(teamIds.map(teamId => 
          projectRepository.addTeam(project.id, teamId, organizationId)
        ))
      }

      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: project.id,
        actor_id: projectData.created_by || null,
        action_type: 'created',
        description: `Project created: ${project.name}`
      })

      return success(project)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async updateProject(organizationId: string, projectId: string, updates: Partial<Project>, actorId: string): Promise<Result<any>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      const result = await projectRepository.update(projectId, organizationId, updates)
      if (!result.success) throw result.error

      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'updated',
        description: `Project updated.`
      })

      return success(result.data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async deleteProject(organizationId: string, projectId: string, actorId: string): Promise<Result<void>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner'])
      return await projectRepository.softDelete(projectId, organizationId, actorId)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── MEMBERS ──

  async addProjectMember(organizationId: string, projectId: string, employeeId: string, role: string, actorId: string): Promise<Result<void>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      const res = await projectRepository.addMember(projectId, employeeId, organizationId, role)
      if (!res.success) throw res.error
      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'member_added',
        description: `Added member to project with role ${role}`
      })
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async removeProjectMember(organizationId: string, projectId: string, employeeId: string, actorId: string): Promise<Result<void>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      const res = await projectRepository.removeMember(projectId, employeeId, organizationId)
      if (!res.success) throw res.error
      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'member_removed',
        description: `Removed member from project`
      })
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async updateProjectMemberRole(organizationId: string, projectId: string, employeeId: string, role: string, actorId: string): Promise<Result<void>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      const res = await projectRepository.updateMemberRole(projectId, employeeId, organizationId, role)
      if (!res.success) throw res.error
      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'member_role_updated',
        description: `Updated member role to ${role}`
      })
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── TEAMS ──

  async addProjectTeam(organizationId: string, projectId: string, teamId: string, actorId: string): Promise<Result<void>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      const res = await projectRepository.addTeam(projectId, teamId, organizationId)
      if (!res.success) throw res.error
      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'team_added',
        description: `Added team to project`
      })
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async removeProjectTeam(organizationId: string, projectId: string, teamId: string, actorId: string): Promise<Result<void>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      const res = await projectRepository.removeTeam(projectId, teamId, organizationId)
      if (!res.success) throw res.error
      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'team_removed',
        description: `Removed team from project`
      })
      return success(undefined)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── MILESTONES ──

  async addMilestone(
    organizationId: string,
    projectId: string,
    actorId: string,
    milestone: { name: string; due_date?: string }
  ): Promise<Result<any>> {
    try {
      const result = await projectRepository.addMilestone({
        organization_id: organizationId,
        project_id: projectId,
        ...milestone
      })
      if (!result.success) throw result.error

      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'milestone_added',
        description: `Milestone added: ${milestone.name}`
      })

      return success(result.data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ── BUDGETS ──

  async getBudgetOverview(organizationId: string, projectId: string): Promise<Result<{ entries: any[]; requests: any[] }>> {
    try {
      const entriesRes = await projectRepository.getBudgetEntries(projectId, organizationId)
      const requestsRes = await projectRepository.getBudgetRequests(projectId, organizationId)
      
      return success({
        entries: entriesRes.success ? entriesRes.data : [],
        requests: requestsRes.success ? requestsRes.data : []
      })
    } catch (error) {
      return failure(error as Error)
    }
  }

  async requestBudget(
    organizationId: string,
    projectId: string,
    actorId: string,
    amount: number,
    category: BudgetCategory,
    description: string
  ): Promise<Result<any>> {
    try {
      const result = await projectRepository.createBudgetRequest({
        organization_id: organizationId,
        project_id: projectId,
        requested_by: actorId,
        amount,
        category,
        description
      })
      if (!result.success) throw result.error

      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'budget_requested',
        description: `Requested budget of ${amount} for ${category}`
      })

      return success(result.data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async approveBudgetRequest(
    organizationId: string,
    projectId: string,
    requestId: string,
    actorId: string,
    requestDetails: { amount: number; category: BudgetCategory; description?: string }
  ): Promise<Result<any>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      
      const requestsResult = await projectRepository.getBudgetRequests(projectId, organizationId)
      if (!requestsResult.success) throw new Error("Failed to fetch requests")
      const req = requestsResult.data?.find((r: any) => r.id === requestId)
      if (!req) throw new Error("Request not found")
      if (req.status !== 'Pending') throw new Error("Only pending requests can be approved")

      // 1. Update the request status
      const updateRes = await projectRepository.updateBudgetRequest(requestId, organizationId, {
        status: 'Approved',
        approved_by: actorId,
        decision_note: 'Approved'
      })
      if (!updateRes.success) throw updateRes.error

      // 2. Automatically create the budget entry reflecting the approved amount
      const entryRes = await projectRepository.addBudgetEntry({
        organization_id: organizationId,
        project_id: projectId,
        amount: requestDetails.amount,
        category: requestDetails.category,
        description: requestDetails.description || 'Approved budget request',
        date: new Date().toISOString(),
        recorded_by: actorId
      })
      if (!entryRes.success) throw entryRes.error

      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'budget_approved',
        description: `Approved budget request of ${requestDetails.amount} for ${requestDetails.category}`
      })

      return success(updateRes.data)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async rejectBudgetRequest(
    organizationId: string,
    projectId: string,
    requestId: string,
    actorId: string,
    reason: string
  ): Promise<Result<any>> {
    try {
      await this.enforceProjectRole(organizationId, projectId, actorId, ['Owner', 'Manager'])
      
      const requestsResult = await projectRepository.getBudgetRequests(projectId, organizationId)
      if (!requestsResult.success) throw new Error("Failed to fetch requests")
      const req = requestsResult.data?.find((r: any) => r.id === requestId)
      if (!req) throw new Error("Request not found")
      if (req.status !== 'Pending') throw new Error("Only pending requests can be rejected")

      const updateRes = await projectRepository.updateBudgetRequest(requestId, organizationId, {
        status: 'Rejected',
        approved_by: actorId,
        decision_note: reason
      })
      if (!updateRes.success) throw updateRes.error

      await projectRepository.logActivity({
        organization_id: organizationId,
        project_id: projectId,
        actor_id: actorId,
        action_type: 'budget_rejected',
        description: `Rejected budget request: ${reason}`
      })

      return success(updateRes.data)
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const projectService = new ProjectService()
