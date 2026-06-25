import { hrRepository, EmployeeStatus, EmployeeDetail } from '@/lib/repositories/hr.repository'
import { Result, success, failure } from '@/lib/utils/result'

export class HRService {
  async softDeleteEmployee(organizationId: string, employeeId: string, actorId: string): Promise<Result<void>> {
    // You could add checks here to ensure `actorId` has Admin or HR Manager permissions
    return hrRepository.softDelete(employeeId, organizationId, actorId)
  }

  async terminateEmployee(organizationId: string, employeeId: string, actorId: string): Promise<Result<void>> {
    // A termination might involve specific cleanup, but for now we update the status.
    // We could also record an employee_position_history entry for the termination.
    return hrRepository.updateStatus(employeeId, organizationId, 'terminated')
  }

  async suspendEmployee(organizationId: string, employeeId: string, actorId: string): Promise<Result<void>> {
    return hrRepository.updateStatus(employeeId, organizationId, 'suspended')
  }

  async updateEmployee(organizationId: string, employeeId: string, updates: any, actorId: string): Promise<Result<void>> {
    // TODO: If designation_id or department_id changed, we should ideally log to employee_position_history automatically.
    return hrRepository.update(employeeId, organizationId, updates)
  }

  async getActiveEmployees(organizationId: string) {
    return hrRepository.findActiveEmployees(organizationId)
  }

  async getDashboardStats(organizationId: string) {
    return hrRepository.getDashboardStats(organizationId)
  }

  async getEmployeeDetail(organizationId: string, employeeId: string) {
    return hrRepository.getEmployeeDetail(employeeId, organizationId)
  }

  async getEmployeeHistory(organizationId: string, employeeId: string) {
    return hrRepository.getEmployeeHistory(employeeId, organizationId)
  }

  async createEmployee(organizationId: string, data: any, actorId: string): Promise<Result<string>> {
    const res = await hrRepository.createEmployee(organizationId, data, actorId)
    // Add default initial position history if department/designation provided
    if (res.success && (data.department_id || data.designation_id)) {
      await hrRepository.addPositionHistory(organizationId, res.data, {
        department_id: data.department_id,
        designation_id: data.designation_id,
        title: data.title || 'Initial Position',
        change_reason: 'New Hire',
        start_date: new Date().toISOString().split('T')[0]
      }, actorId)
    }
    return res
  }

  async changeEmployeePosition(organizationId: string, employeeId: string, data: any, actorId: string): Promise<Result<void>> {
    // 1. Update employee record
    const updateRes = await hrRepository.update(employeeId, organizationId, {
      department_id: data.department_id,
      designation_id: data.designation_id
    })
    
    if (!updateRes.success) return updateRes

    // 2. Insert position history
    await hrRepository.addPositionHistory(organizationId, employeeId, {
      department_id: data.department_id,
      designation_id: data.designation_id,
      title: data.title,
      change_reason: data.change_reason,
      start_date: data.start_date || new Date().toISOString().split('T')[0]
    }, actorId)

    return success(undefined)
  }

  async assignEmployeeTeams(organizationId: string, employeeId: string, teamIds: string[], actorId: string): Promise<Result<void>> {
    return hrRepository.assignTeams(organizationId, employeeId, teamIds, actorId)
  }
}

export const hrService = new HRService()
