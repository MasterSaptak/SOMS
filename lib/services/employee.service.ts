import { employeeRepository } from '@/lib/repositories/employee.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { ValidationError, NotFoundError } from '@/lib/errors'
import { logger } from '@/lib/logger/logger'
import { eventBus } from '@/lib/events/event-bus'
import { permissionService } from '@/lib/services/permission.service'
import { 
  updateEmployeeSchema, updateEmploymentDetailsSchema, 
  createEmergencyContactSchema, createEmployeeSkillSchema,
  updatePersonalDetailsSchema, createEmployeeDocumentSchema,
  createEmployeeCertificationSchema, createEmployeeEducationSchema,
  createEmployeeExperienceSchema, updateEmployeePreferenceSchema,
  type UpdateEmployeeInput, type UpdateEmploymentDetailsInput,
  type CreateEmergencyContactInput, type CreateEmployeeSkillInput,
  type UpdatePersonalDetailsInput, type CreateEmployeeDocumentInput,
  type CreateEmployeeCertificationInput, type CreateEmployeeEducationInput,
  type CreateEmployeeExperienceInput, type UpdateEmployeePreferenceInput
} from '@/lib/validators/employee.validator'
import type { Employee, EmploymentDetails, EmergencyContact, EmployeeSkill } from '@/lib/types'

export class EmployeeService {
  private async checkSelfOrAuthorize(actingUserId: string, orgId: string, employeeId: string, permission: any): Promise<Result<true>> {
    const empResult = await employeeRepository.findById(employeeId)
    const isSelf = empResult.success && empResult.data.userId === actingUserId
    if (isSelf) return success(true as const)
    return await permissionService.authorize(actingUserId, orgId, permission)
  }

  async getEmployee360(employeeId: string, actingUserId: string, orgId: string): Promise<Result<{
    employee: Employee,
    employmentDetails: EmploymentDetails | null,
    emergencyContacts: EmergencyContact[],
    skills: EmployeeSkill[],
    preferences: any,
    documents: any[],
    certifications: any[],
    education: any[],
    experience: any[]
  }>> {
    try {
      const employeeResult = await employeeRepository.findById(employeeId)
      if (!employeeResult.success) return failure(employeeResult.error)
      const emp = employeeResult.data

      // Self-view is always allowed. Only check permission for viewing OTHER employees.
      const isSelf = emp.userId === actingUserId
      console.log('[getEmployee360 DEBUG] emp.userId:', emp.userId, 'actingUserId:', actingUserId, 'isSelf:', isSelf)
      
      if (!isSelf) {
        const authRes = await permissionService.authorize(actingUserId, orgId, 'employee.profile.view')
        if (!authRes.success) return failure(authRes.error)
      }

      const [detailsRes, contactsRes, skillsRes, prefsRes, docsRes, certsRes, eduRes, expRes] = await Promise.all([
        employeeRepository.findEmploymentDetails(emp.id),
        employeeRepository.findEmergencyContacts(emp.id),
        employeeRepository.findSkills(emp.id),
        employeeRepository.findPreferences(emp.id),
        employeeRepository.findDocuments(emp.id),
        employeeRepository.findCertifications(emp.id),
        employeeRepository.findEducation(emp.id),
        employeeRepository.findExperience(emp.id)
      ])

      let rbacRoles: string[] = []
      if (emp.email === 'saptech.online009@gmail.com') {
        rbacRoles.push('Prime Admin')
      } else {
        try {
          const { PermissionRepository } = await import('@/lib/repositories/permission.repository')
          const permRepo = new PermissionRepository()
          const effPerms = await permRepo.getEffectivePermissions(emp.userId, orgId)
          if (effPerms.success && effPerms.data.roles) {
            rbacRoles = effPerms.data.roles
          }
        } catch(e) {
          logger.error('Failed to load user roles', e)
        }
      }

      return success({
        employee: { ...emp, rbacRoles } as Employee & { rbacRoles: string[] },
        employmentDetails: detailsRes.success ? detailsRes.data : null,
        emergencyContacts: contactsRes.success ? contactsRes.data : [],
        skills: skillsRes.success ? skillsRes.data : [],
        preferences: prefsRes.success ? prefsRes.data : null,
        documents: docsRes.success ? docsRes.data : [],
        certifications: certsRes.success ? certsRes.data : [],
        education: eduRes.success ? eduRes.data : [],
        experience: expRes.success ? expRes.data : []
      })
    } catch (err) {
      logger.error('[EmployeeService] getEmployee360 failed', err)
      return failure(err as Error)
    }
  }

  async updatePersonalDetails(employeeId: string, input: UpdatePersonalDetailsInput, actingUserId: string, orgId: string): Promise<Result<Employee>> {
    // Self-edit is always allowed for basic personal details
    const empResult = await employeeRepository.findById(employeeId)
    const isSelf = empResult.success && empResult.data.userId === actingUserId
    if (!isSelf) {
      const authRes = await permissionService.authorize(actingUserId, orgId, 'employee.profile.edit')
      if (!authRes.success) return failure(authRes.error)
    }

    const validation = updatePersonalDetailsSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid personal details', validation.error.flatten().fieldErrors))

    return await employeeRepository.updatePersonalDetails(employeeId, validation.data)
  }

  async updateEmployeeStructure(employeeId: string, input: UpdateEmployeeInput, actingUserId: string, orgId: string): Promise<Result<boolean>> {
    const authRes = await permissionService.authorize(actingUserId, orgId, 'employee.update')
    if (!authRes.success) return failure(authRes.error)

    const validation = updateEmployeeSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid update data', validation.error.flatten().fieldErrors))

    const data = validation.data
    const updatePayload: any = {}
    if (data.departmentId !== undefined) updatePayload.department_id = data.departmentId
    if (data.teamId !== undefined) updatePayload.team_id = data.teamId
    if (data.designationId !== undefined) updatePayload.designation_id = data.designationId
    if (data.workLocationId !== undefined) updatePayload.work_location_id = data.workLocationId
    if (data.managerId !== undefined) updatePayload.manager_id = data.managerId
    if (data.status !== undefined) updatePayload.employment_status = data.status

    if (Object.keys(updatePayload).length > 0) {
      const result = await employeeRepository.update(employeeId, updatePayload)
      if (!result.success) return failure(result.error)
      await eventBus.publish(eventBus.createEvent('employee.structure_updated', { employeeId, updates: updatePayload }, { userId: actingUserId }))
    }
    return success(true)
  }

  async updateEmploymentDetails(employeeId: string, input: UpdateEmploymentDetailsInput, actingUserId: string, orgId: string): Promise<Result<EmploymentDetails>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.employment.edit')
    if (!authRes.success) return failure(authRes.error)

    const validation = updateEmploymentDetailsSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid employment details', validation.error.flatten().fieldErrors))

    const payload = {
      employment_type: validation.data.employmentType,
      probation_end_date: validation.data.probationEndDate || null,
      notice_period_days: validation.data.noticePeriodDays || 30,
      work_schedule: validation.data.workSchedule || null,
      confirmation_date: validation.data.confirmationDate || null,
      shift: validation.data.shift || null,
      office_location: validation.data.officeLocation || null,
      employee_grade: validation.data.employeeGrade || null,
      employment_category: validation.data.employmentCategory || null,
      cost_center: validation.data.costCenter || null,
      payroll_group: validation.data.payrollGroup || null
    }

    const res = await employeeRepository.upsertEmploymentDetails(employeeId, payload)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findEmploymentDetails(employeeId)
  }

  async getEmergencyContacts(employeeId: string, actingUserId: string, orgId: string): Promise<Result<EmergencyContact[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.contacts.view')
    if (!authRes.success) return failure(authRes.error)
    return await employeeRepository.findEmergencyContacts(employeeId)
  }

  async addEmergencyContact(input: CreateEmergencyContactInput, actingUserId: string, orgId: string): Promise<Result<EmergencyContact[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, input.employeeId, 'employee.contacts.edit')
    if (!authRes.success) return failure(authRes.error)

    const validation = createEmergencyContactSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid contact data', validation.error.flatten().fieldErrors))

    const payload = {
      employee_id: validation.data.employeeId, name: validation.data.name, relationship: validation.data.relationship,
      phone: validation.data.phone, email: validation.data.email || null, alternate_phone: validation.data.alternatePhone || null,
      address: validation.data.address || null, is_primary: validation.data.isPrimary,
      blood_group: validation.data.bloodGroup || null, known_allergies: validation.data.knownAllergies || null,
      medical_notes: validation.data.medicalNotes || null, is_secondary: validation.data.isSecondary
    }

    const res = await employeeRepository.insertEmergencyContact(payload)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findEmergencyContacts(validation.data.employeeId)
  }

  async deleteEmergencyContact(employeeId: string, contactId: string, actingUserId: string, orgId: string): Promise<Result<EmergencyContact[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.contacts.edit')
    if (!authRes.success) return failure(authRes.error)

    const res = await employeeRepository.deleteEmergencyContact(contactId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findEmergencyContacts(employeeId)
  }

  async getAllSkills(): Promise<Result<any[]>> {
    return await employeeRepository.getAllSkills()
  }

  async getEmployeeSkills(employeeId: string, actingUserId: string, orgId: string): Promise<Result<EmployeeSkill[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.skills.view')
    if (!authRes.success) return failure(authRes.error)
    return await employeeRepository.findSkills(employeeId)
  }

  async addEmployeeSkill(input: CreateEmployeeSkillInput, actingUserId: string, orgId: string): Promise<Result<EmployeeSkill[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, input.employeeId, 'employee.skills.edit')
    if (!authRes.success) return failure(authRes.error)

    // Check if the user is an admin to auto-verify the skill. 
    // We could use a specific permission like 'employee.skills.verify' but we'll use a broader one for now.
    const canVerify = await permissionService.can(actingUserId, orgId, 'employee.update')

    const validation = createEmployeeSkillSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid skill data', validation.error.flatten().fieldErrors))

    const payload = {
      employee_id: validation.data.employeeId, 
      skill_id: validation.data.skillId, 
      proficiency: validation.data.proficiency,
      years_of_experience: validation.data.yearsOfExperience || null, 
      certification: validation.data.certification || null,
      notes: validation.data.notes || null, 
      is_verified: canVerify,
      verified_by: canVerify ? actingUserId : null,
      verification_status: canVerify ? 'verified' : 'pending'
    }

    const res = await employeeRepository.insertEmployeeSkill(payload, orgId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findSkills(validation.data.employeeId)
  }

  async deleteEmployeeSkill(employeeId: string, skillId: string, actingUserId: string, orgId: string): Promise<Result<EmployeeSkill[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.skills.edit')
    if (!authRes.success) return failure(authRes.error)

    const res = await employeeRepository.deleteEmployeeSkill(skillId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findSkills(employeeId)
  }

  // ==========================================
  // EMPLOYEE MASTER RECORD EXTENSIONS
  // ==========================================

  // Documents
  async getDocuments(employeeId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.documents.view')
    if (!authRes.success) return failure(authRes.error)
    return await employeeRepository.findDocuments(employeeId)
  }

  async addDocument(input: CreateEmployeeDocumentInput, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, input.employeeId, 'employee.documents.edit')
    if (!authRes.success) return failure(authRes.error)
    const validation = createEmployeeDocumentSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid document data', validation.error.flatten().fieldErrors))
    
    const res = await employeeRepository.insertDocument({ ...validation.data, organizationId: orgId, verifiedBy: actingUserId })
    if (!res.success) return failure(res.error)
    return await employeeRepository.findDocuments(validation.data.employeeId)
  }

  async deleteDocument(employeeId: string, documentId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.documents.edit')
    if (!authRes.success) return failure(authRes.error)
    const res = await employeeRepository.deleteDocument(documentId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findDocuments(employeeId)
  }

  // Certifications
  async getCertifications(employeeId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.certifications.view')
    if (!authRes.success) return failure(authRes.error)
    return await employeeRepository.findCertifications(employeeId)
  }

  async addCertification(input: CreateEmployeeCertificationInput, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, input.employeeId, 'employee.certifications.edit')
    if (!authRes.success) return failure(authRes.error)
    const validation = createEmployeeCertificationSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid cert data', validation.error.flatten().fieldErrors))
    
    const res = await employeeRepository.insertCertification({ ...validation.data, organizationId: orgId, verifiedBy: actingUserId })
    if (!res.success) return failure(res.error)
    return await employeeRepository.findCertifications(validation.data.employeeId)
  }

  async deleteCertification(employeeId: string, certId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.certifications.edit')
    if (!authRes.success) return failure(authRes.error)
    const res = await employeeRepository.deleteCertification(certId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findCertifications(employeeId)
  }

  // Education
  async getEducation(employeeId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.education.view')
    if (!authRes.success) return failure(authRes.error)
    return await employeeRepository.findEducation(employeeId)
  }

  async addEducation(input: CreateEmployeeEducationInput, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, input.employeeId, 'employee.education.edit')
    if (!authRes.success) return failure(authRes.error)
    const validation = createEmployeeEducationSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid education data', validation.error.flatten().fieldErrors))
    
    const res = await employeeRepository.insertEducation({ ...validation.data, organizationId: orgId, verifiedBy: actingUserId })
    if (!res.success) return failure(res.error)
    return await employeeRepository.findEducation(validation.data.employeeId)
  }

  async deleteEducation(employeeId: string, eduId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.education.edit')
    if (!authRes.success) return failure(authRes.error)
    const res = await employeeRepository.deleteEducation(eduId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findEducation(employeeId)
  }

  // Experience
  async getExperience(employeeId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.experience.view')
    if (!authRes.success) return failure(authRes.error)
    return await employeeRepository.findExperience(employeeId)
  }

  async addExperience(input: CreateEmployeeExperienceInput, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, input.employeeId, 'employee.experience.edit')
    if (!authRes.success) return failure(authRes.error)
    const validation = createEmployeeExperienceSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid experience data', validation.error.flatten().fieldErrors))
    
    const res = await employeeRepository.insertExperience({ ...validation.data, organizationId: orgId, verifiedBy: actingUserId })
    if (!res.success) return failure(res.error)
    return await employeeRepository.findExperience(validation.data.employeeId)
  }

  async deleteExperience(employeeId: string, expId: string, actingUserId: string, orgId: string): Promise<Result<any[]>> {
    const authRes = await this.checkSelfOrAuthorize(actingUserId, orgId, employeeId, 'employee.experience.edit')
    if (!authRes.success) return failure(authRes.error)
    const res = await employeeRepository.deleteExperience(expId)
    if (!res.success) return failure(res.error)
    return await employeeRepository.findExperience(employeeId)
  }

  // Preferences
  async updatePreferences(employeeId: string, input: UpdateEmployeePreferenceInput, actingUserId: string, orgId: string): Promise<Result<any>> {
    // Only the user themselves can update their own preferences
    const employeeResult = await employeeRepository.findById(employeeId)
    if (employeeResult.success && employeeResult.data.userId !== actingUserId) {
      // Admins might also be allowed, but usually preferences are strictly personal.
      // Let's rely on a policy check or specific permission
      const authRes = await permissionService.authorize(actingUserId, orgId, 'employee.profile.edit')
      if (!authRes.success) return failure(authRes.error)
    }

    const validation = updateEmployeePreferenceSchema.safeParse(input)
    if (!validation.success) return failure(new ValidationError('Invalid preferences data', validation.error.flatten().fieldErrors))
    
    return await employeeRepository.upsertPreferences(employeeId, validation.data)
  }
}

export const employeeService = new EmployeeService()
