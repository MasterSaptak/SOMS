// @ts-nocheck
import { taskRepository } from '@/lib/repositories/task.repository'
import { Result, success, failure } from '@/lib/utils/result'

export class ProductivityService {
  /**
   * Calculates an enterprise productivity score (0-100) based on task completion,
   * adherence to estimated vs actual hours, and session logging consistency.
   */
  async calculateEmployeeScore(employeeId: string, organizationId: string): Promise<Result<number>> {
    try {
      const client = await taskRepository.getClient()
      
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: assignments, error: tasksError } = await (client as any)
        .from('task_assignments')
        .select(`
          task_id,
          tasks!inner (
            status,
            due_date,
            estimated_hours,
            actual_hours,
            completion_percentage
          )
        `)
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)
        .gte('created_at', thirtyDaysAgo.toISOString())

      if (tasksError) throw tasksError

      const totalTasks = assignments?.length || 0
      if (totalTasks === 0) return success(85) // Baseline

      // 1. Completion Rate (weighted heavily)
      const completedTasks = assignments.filter((t: any) => t.tasks.status === 'Completed').length
      const completionRate = (completedTasks / totalTasks) * 100

      // 2. Estimation Accuracy (Penalty for taking >150% of estimated time)
      let estimationPenalty = 0
      const tasksWithEstimates = assignments.filter((t: any) => t.tasks.estimated_hours && t.tasks.estimated_hours > 0)
      if (tasksWithEstimates.length > 0) {
        const overBudgetTasks = tasksWithEstimates.filter((t: any) => {
          const actual = t.tasks.actual_hours || 0
          const est = t.tasks.estimated_hours
          return actual > (est * 1.5)
        }).length
        estimationPenalty = (overBudgetTasks / tasksWithEstimates.length) * 20 // Up to 20 point penalty
      }

      // 3. Get work sessions consistency
      const { data: sessions, error: sessionsError } = await (client as any)
        .from('work_sessions')
        .select('duration_minutes')
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)
        .gte('start_time', thirtyDaysAgo.toISOString())
        .not('end_time', 'is', null)

      if (sessionsError) throw sessionsError

      const totalLoggedMinutes = sessions?.reduce((sum: number, session: any) => sum + (session.duration_minutes || 0), 0) || 0
      const expectedWorkingMinutes = 20 * 8 * 60 // Roughly 20 working days * 8 hours
      const loggingConsistency = Math.min((totalLoggedMinutes / expectedWorkingMinutes) * 100, 100)

      // Final Score Weighting: 70% Completion, 30% Session Logging - Penalty
      const finalScore = Math.round((completionRate * 0.7) + (loggingConsistency * 0.3) - estimationPenalty)

      // Floor the score to 50
      return success(Math.max(50, finalScore))
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getWorkloadMetrics(employeeId: string, organizationId: string): Promise<Result<any>> {
    try {
      const client = await taskRepository.getClient()
      const { data, error } = await (client as any)
        .from('employee_workload_metrics')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('organization_id', organizationId)
        .single()
        
      if (error) throw error
      return success(data)
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const productivityService = new ProductivityService()
