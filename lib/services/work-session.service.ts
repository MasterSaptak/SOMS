// @ts-nocheck
import { workSessionRepository, WorkSession } from '@/lib/repositories/work-session.repository'
import { Result, success, failure } from '@/lib/utils/result'

export class WorkSessionService {
  async getEmployeeWorkSessions(employeeId: string, organizationId: string): Promise<Result<WorkSession[]>> {
    try {
      return await workSessionRepository.findByEmployee(employeeId, organizationId);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async startSession(taskId: string, employeeId: string, organizationId: string): Promise<Result<WorkSession>> {
    try {
      return await workSessionRepository.create({
        organization_id: organizationId,
        task_id: taskId,
        employee_id: employeeId,
        start_time: new Date().toISOString(),
      });
    } catch (error) {
      return failure(error as Error);
    }
  }

  async endSession(sessionId: string, organizationId: string, notes?: string): Promise<Result<WorkSession>> {
    try {
      const sessionResult = await workSessionRepository.getClient()
        .then(client => (client as any).from('work_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('organization_id', organizationId)
        .single());

      if (sessionResult.error) throw sessionResult.error;
      const session = sessionResult.data as WorkSession;

      const startTime = new Date(session.start_time);
      const endTime = new Date();
      const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      return await workSessionRepository.update(sessionId, organizationId, {
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        notes: notes || null,
      });
    } catch (error) {
      return failure(error as Error);
    }
  }
}

export const workSessionService = new WorkSessionService();
