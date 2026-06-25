import { BaseRepository } from '@/lib/repositories/base.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'
import { createClient } from '@/lib/supabase/server'
import { NotFoundError } from '@/lib/errors'
import type { Employee, EmploymentDetails, EmergencyContact, EmployeeSkill } from '@/lib/types'

async function getUntypedClient(): Promise<any> {
  return await createClient()
}

export class EmployeeRepository extends BaseRepository<'employees'> {
  constructor() {
    super('employees')
  }

  // @ts-expect-error - Custom return type
  async findById(id: string): Promise<Result<Employee>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employees')
        .select(`*`)
        .eq('id', id)
        .single()

      if (error || !data) return failure(new NotFoundError('Employee not found'))
      
      return success(this.mapToEntity(data))
    } catch (err) {
      logger.error('[EmployeeRepository] findById failed', err)
      return failure(err as Error)
    }
  }

  async findByUserId(userId: string): Promise<Result<Employee>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employees')
        .select(`*`)
        .eq('user_id', userId)
        .single()

      if (error || !data) return failure(new NotFoundError('Employee not found'))
      
      return success(this.mapToEntity(data))
    } catch (err) {
      logger.error('[EmployeeRepository] findByUserId failed', err)
      return failure(err as Error)
    }
  }

  private mapToEntity(data: any): Employee {
    return {
      id: data.id,
      userId: data.user_id,
      organizationId: data.organization_id,
      departmentId: data.department_id,
      teamId: data.team_id,
      designationId: data.designation_id,
      workLocationId: data.work_location_id,
      managerId: data.manager_id,
      employeeCode: data.employee_id_string || '',
      firstName: data.full_name?.split(' ')[0] || '',
      lastName: data.full_name?.split(' ').slice(1).join(' ') || '',
      phone: data.phone || '',
      email: data.email || '',
      avatarUrl: data.profile_photo,
      joinDate: data.joining_date || '',
      status: data.employment_status || 'active',
      createdAt: data.created_at || '',
      date_of_birth: data.date_of_birth,
      // Personal Info (Master Record)
      gender: data.gender,
      bloodGroup: data.blood_group,
      nationality: data.nationality,
      maritalStatus: data.marital_status,
      personalEmail: data.personal_email,
      address: data.address,
      aadhaarNid: data.aadhaar_nid,
      passportNo: data.passport_no,
      visaStatus: data.visa_status,
      drivingLicense: data.driving_license,
      department: data.department,
      team: data.team,
      designation: data.designation,
      workLocation: data.workLocation,
      manager: data.manager ? { 
        id: data.manager.id, 
        firstName: data.manager.full_name?.split(' ')[0], 
        lastName: data.manager.full_name?.split(' ').slice(1).join(' '),
        avatarUrl: data.manager.profile_photo
      } as Employee : undefined
    } as any
  }

  async findByOrganizationId(orgId: string): Promise<Result<Employee[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employees')
        .select(`*`)
        .eq('organization_id', orgId)
        .order('full_name')

      if (error) throw error

      const mapped = data.map((d: any) => this.mapToEntity(d))

      return success(mapped as Employee[])
    } catch (err) {
      logger.error('[EmployeeRepository] findByOrganizationId failed', err)
      return failure(err as Error)
    }
  }

  async findEmploymentDetails(employeeId: string): Promise<Result<EmploymentDetails>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employment_details')
        .select('*')
        .eq('employee_id', employeeId)
        .single()

      if (error && error.code !== 'PGRST116') return failure(new NotFoundError('Employment details not found'))
      if (!data) return failure(new NotFoundError('Employment details not found'))
      
      const mapped: EmploymentDetails = {
        id: data.id,
        employeeId: data.employee_id,
        employmentType: data.employment_type,
        probationEndDate: data.probation_end_date,
        noticePeriodDays: data.notice_period_days,
        workSchedule: data.work_schedule,
        confirmationDate: data.confirmation_date,
        shift: data.shift,
        officeLocation: data.office_location,
        employeeGrade: data.employee_grade,
        employmentCategory: data.employment_category,
        costCenter: data.cost_center,
        payrollGroup: data.payroll_group,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      }

      return success(mapped)
    } catch (err) {
      logger.error('[EmployeeRepository] findEmploymentDetails failed', err)
      return failure(err as Error)
    }
  }

  async findEmergencyContacts(employeeId: string): Promise<Result<EmergencyContact[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('emergency_contacts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('is_primary', { ascending: false })

      if (error) throw error
      
      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        employeeId: d.employee_id,
        name: d.name,
        relationship: d.relationship,
        phone: d.phone,
        email: d.email,
        alternatePhone: d.alternate_phone,
        address: d.address,
        bloodGroup: d.blood_group,
        knownAllergies: d.known_allergies,
        medicalNotes: d.medical_notes,
        isPrimary: d.is_primary,
        isSecondary: d.is_secondary,
        createdAt: d.created_at,
        updatedAt: d.updated_at
      }))

      return success(mapped as EmergencyContact[])
    } catch (err) {
      logger.error('[EmployeeRepository] findEmergencyContacts failed', err)
      return failure(err as Error)
    }
  }

  async findSkills(employeeId: string): Promise<Result<EmployeeSkill[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client
        .from('employee_skills')
        .select(`
          *,
          skill:skills(*)
        `)
        .eq('employee_id', employeeId)

      if (error) throw error

      const mapped = (data || []).map((d: any) => ({
        id: d.id,
        employeeId: d.employee_id,
        skillId: d.skill_id,
        proficiency: d.proficiency,
        yearsOfExperience: d.years_of_experience,
        certification: d.certification,
        notes: d.notes,
        verificationStatus: d.verification_status,
        isVerified: d.is_verified,
        verifiedBy: d.verified_by,
        verifiedAt: d.verified_at,
        verificationNotes: d.verification_notes,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
        skill: d.skill ? {
          id: d.skill.id,
          name: d.skill.name,
          category: d.skill.category,
          createdAt: d.skill.created_at,
          updatedAt: d.skill.updated_at
        } : undefined
      }))

      return success(mapped as EmployeeSkill[])
    } catch (err) {
      logger.error('[EmployeeRepository] findSkills failed', err)
      return failure(err as Error)
    }
  }

  async getAllSkills(): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('skills').select('*').order('name')
      if (error) throw error
      return success(data)
    } catch (err) {
      return failure(err as Error)
    }
  }

  async upsertEmploymentDetails(employeeId: string, payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      const { data: existing } = await client.from('employment_details').select('id').eq('employee_id', employeeId).single()
      
      let res
      if (existing) {
        res = await client.from('employment_details').update(payload).eq('id', existing.id).select().single()
      } else {
        res = await client.from('employment_details').insert({ employee_id: employeeId, ...payload }).select().single()
      }
      
      if (res.error) throw res.error
      return success(res.data)
    } catch (err) {
      return failure(err as Error)
    }
  }

  async insertEmergencyContact(payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      if (payload.is_primary) {
        await client.from('emergency_contacts').update({ is_primary: false }).eq('employee_id', payload.employee_id)
      }
      const { data, error } = await client.from('emergency_contacts').insert(payload).select().single()
      if (error) throw error
      return success(data)
    } catch (err) {
      return failure(err as Error)
    }
  }

  async deleteEmergencyContact(id: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      const { error } = await client.from('emergency_contacts').delete().eq('id', id)
      if (error) throw error
      return success(true)
    } catch (err) {
      return failure(err as Error)
    }
  }

  async insertEmployeeSkill(payload: any, orgId: string): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      
      // Fetch skill name to satisfy legacy NOT NULL constraint
      if (!payload.skill_name && payload.skill_id) {
        const { data: skill } = await client.from('skills').select('name').eq('id', payload.skill_id).single()
        if (skill) payload.skill_name = skill.name
      }

      const { data, error } = await client.from('employee_skills').insert(payload).select().single()
      if (error) throw error
      await this.addVerificationHistory(
        orgId, 
        payload.employee_id, 
        'skill', 
        data.id, 
        null, 
        payload.verification_status || 'pending', 
        payload.verified_by || null, 
        payload.verification_status === 'verified' ? 'Skill auto-verified by admin' : 'Skill added'
      )
      return success(data)
    } catch (err) {
      return failure(err as Error)
    }
  }

  async deleteEmployeeSkill(id: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      const { error } = await client.from('employee_skills').delete().eq('id', id)
      if (error) throw error
      return success(true)
    } catch (err) {
      return failure(err as Error)
    }
  }

  // ==========================================
  // EMPLOYEE MASTER RECORD EXTENSIONS
  // ==========================================

  async updatePersonalDetails(id: string, payload: any): Promise<Result<Employee>> {
    const snakeCasePayload = {
      gender: payload.gender,
      blood_group: payload.bloodGroup,
      nationality: payload.nationality,
      marital_status: payload.maritalStatus,
      personal_email: payload.personalEmail,
      address: payload.address,
      aadhaar_nid: payload.aadhaarNid,
      passport_no: payload.passportNo,
      visa_status: payload.visaStatus,
      driving_license: payload.drivingLicense
    }
    
    // Remove undefined
    Object.keys(snakeCasePayload).forEach(key => {
      if ((snakeCasePayload as any)[key] === undefined) {
        delete (snakeCasePayload as any)[key]
      }
    })

    const res = await this.update(id, snakeCasePayload)
    if (!res.success) return failure(res.error)
    return this.findById(id)
  }

  // Documents
  async findDocuments(employeeId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_documents').select('*').eq('employee_id', employeeId).order('uploaded_at', { ascending: false })
      if (error) throw error
      return success(data.map((d: any) => ({
        id: d.id, employeeId: d.employee_id, category: d.category, visibility: d.visibility, fileUrl: d.file_url, uploadedAt: d.uploaded_at, uploadedBy: d.uploaded_by
      })))
    } catch (err) { return failure(err as Error) }
  }

  async insertDocument(payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_documents').insert({
        employee_id: payload.employeeId, category: payload.category, visibility: payload.visibility, file_url: payload.fileUrl, file_name: payload.fileName || 'document', uploaded_by: payload.uploadedBy
      }).select().single()
      if (error) throw error
      return success(data)
    } catch (err) { return failure(err as Error) }
  }

  async deleteDocument(id: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      const { error } = await client.from('employee_documents').delete().eq('id', id)
      if (error) throw error
      return success(true)
    } catch (err) { return failure(err as Error) }
  }

  // Certifications
  async findCertifications(employeeId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_certifications').select('*').eq('employee_id', employeeId).order('issue_date', { ascending: false })
      if (error) throw error
      return success(data.map((d: any) => ({
        id: d.id, employeeId: d.employee_id, name: d.name, issuer: d.issuer, issueDate: d.issue_date, expiryDate: d.expiry_date, credentialUrl: d.credential_url,
        verificationStatus: d.verification_status, isVerified: d.is_verified, verifiedBy: d.verified_by, verifiedAt: d.verified_at, verificationNotes: d.verification_notes
      })))
    } catch (err) { return failure(err as Error) }
  }

  async insertCertification(payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_certifications').insert({
        employee_id: payload.employeeId, name: payload.name, issuing_authority: payload.issuer, issue_date: payload.issueDate, expiry_date: payload.expiryDate, credential_id: payload.credentialUrl
      }).select().single()
      if (error) throw error
      await this.addVerificationHistory(payload.organizationId, payload.employeeId, 'certification', data.id, null, 'pending', payload.verifiedBy || null, 'Certification added')
      return success(data)
    } catch (err) { return failure(err as Error) }
  }

  async deleteCertification(id: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      const { error } = await client.from('employee_certifications').delete().eq('id', id)
      if (error) throw error
      return success(true)
    } catch (err) { return failure(err as Error) }
  }

  // Education
  async findEducation(employeeId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_education').select('*').eq('employee_id', employeeId).order('start_date', { ascending: false })
      if (error) throw error
      return success(data.map((d: any) => ({
        id: d.id, employeeId: d.employee_id, school: d.school, degree: d.degree, fieldOfStudy: d.field_of_study, startDate: d.start_date, endDate: d.end_date, cgpa: d.cgpa,
        verificationStatus: d.verification_status, isVerified: d.is_verified, verifiedBy: d.verified_by, verifiedAt: d.verified_at, verificationNotes: d.verification_notes
      })))
    } catch (err) { return failure(err as Error) }
  }

  async insertEducation(payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_education').insert({
        employee_id: payload.employeeId, school: payload.school, degree: payload.degree, field_of_study: payload.fieldOfStudy, start_date: payload.startDate, end_date: payload.endDate, cgpa: payload.cgpa
      }).select().single()
      if (error) throw error
      await this.addVerificationHistory(payload.organizationId, payload.employeeId, 'education', data.id, null, 'pending', payload.verifiedBy || null, 'Education added')
      return success(data)
    } catch (err) { return failure(err as Error) }
  }

  async deleteEducation(id: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      const { error } = await client.from('employee_education').delete().eq('id', id)
      if (error) throw error
      return success(true)
    } catch (err) { return failure(err as Error) }
  }

  // Experience
  async findExperience(employeeId: string): Promise<Result<any[]>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_experience').select('*').eq('employee_id', employeeId).order('start_date', { ascending: false })
      if (error) throw error
      return success(data.map((d: any) => ({
        id: d.id, employeeId: d.employee_id, companyName: d.company_name, title: d.title, startDate: d.start_date, endDate: d.end_date, location: d.location, description: d.description,
        verificationStatus: d.verification_status, isVerified: d.is_verified, verifiedBy: d.verified_by, verifiedAt: d.verified_at, verificationNotes: d.verification_notes
      })))
    } catch (err) { return failure(err as Error) }
  }

  async insertExperience(payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_experience').insert({
        employee_id: payload.employeeId, company_name: payload.companyName, title: payload.title, start_date: payload.startDate, end_date: payload.endDate, location: payload.location, description: payload.description
      }).select().single()
      if (error) throw error
      await this.addVerificationHistory(payload.organizationId, payload.employeeId, 'experience', data.id, null, 'pending', payload.verifiedBy || null, 'Experience added')
      return success(data)
    } catch (err) { return failure(err as Error) }
  }

  async deleteExperience(id: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      const { error } = await client.from('employee_experience').delete().eq('id', id)
      if (error) throw error
      return success(true)
    } catch (err) { return failure(err as Error) }
  }

  // Preferences
  async findPreferences(employeeId: string): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      const { data, error } = await client.from('employee_preferences').select('*').eq('employee_id', employeeId).single()
      if (error && error.code !== 'PGRST116') throw error
      if (!data) return success(null)
      return success({
        employeeId: data.employee_id, theme: data.theme, language: data.language, timezone: data.timezone, dashboardWidgets: data.dashboard_widgets, notificationSettings: data.notification_settings
      })
    } catch (err) { return failure(err as Error) }
  }

  async upsertPreferences(employeeId: string, payload: any): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      
      const snakePayload: any = { employee_id: employeeId }
      if (payload.theme !== undefined) snakePayload.theme = payload.theme
      if (payload.language !== undefined) snakePayload.language = payload.language
      if (payload.timezone !== undefined) snakePayload.timezone = payload.timezone
      if (payload.dashboardWidgets !== undefined) snakePayload.dashboard_widgets = payload.dashboardWidgets
      if (payload.notificationSettings !== undefined) snakePayload.notification_settings = payload.notificationSettings

      const { data: existing } = await client.from('employee_preferences').select('employee_id').eq('employee_id', employeeId).single()
      
      let res
      if (existing) {
        res = await client.from('employee_preferences').update(snakePayload).eq('employee_id', employeeId).select().single()
      } else {
        res = await client.from('employee_preferences').insert(snakePayload).select().single()
      }
      
      if (res.error) throw res.error
      return success(res.data)
    } catch (err) { return failure(err as Error) }
  }

  // Verification Engine (HR Only)
  
  async addVerificationHistory(organizationId: string, employeeId: string, entityType: string, entityId: string, oldStatus: string | null, newStatus: string, performedBy: string | null, notes?: string) {
    try {
      const client = await getUntypedClient()
      await client.from('employee_verification_history').insert({
        organization_id: organizationId,
        employee_id: employeeId,
        entity_type: entityType,
        entity_id: entityId,
        old_status: oldStatus,
        new_status: newStatus,
        performed_by: performedBy,
        notes: notes || null
      })
    } catch (err) {
      logger.error(`[EmployeeRepository] addVerificationHistory failed for ${entityType} / ${entityId}`, err)
    }
  }

  async addTimelineEvent(organizationId: string, employeeId: string, eventType: string, title: string, description?: string) {
    try {
      const client = await getUntypedClient()
      await client.from('employee_timeline_events').insert({
        organization_id: organizationId,
        employee_id: employeeId,
        event_type: eventType,
        title,
        description
      })
    } catch (err) {
      logger.error(`[EmployeeRepository] addTimelineEvent failed`, err)
    }
  }

  async addNotification(userId: string, title: string, message: string, type: string = 'info') {
    try {
      const client = await getUntypedClient()
      await client.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type
      })
    } catch (err) {
      logger.error(`[EmployeeRepository] addNotification failed`, err)
    }
  }

  async verifySkill(orgId: string, empId: string, recordId: string, status: 'verified' | 'rejected', verifiedBy: string, notes?: string): Promise<Result<boolean>> {
    return this.updateVerificationStatus('employee_skills', orgId, empId, recordId, 'skill', status, verifiedBy, notes)
  }

  async verifyCertification(orgId: string, empId: string, recordId: string, status: 'verified' | 'rejected', verifiedBy: string, notes?: string): Promise<Result<boolean>> {
    return this.updateVerificationStatus('employee_certifications', orgId, empId, recordId, 'certification', status, verifiedBy, notes)
  }

  async verifyEducation(orgId: string, empId: string, recordId: string, status: 'verified' | 'rejected', verifiedBy: string, notes?: string): Promise<Result<boolean>> {
    return this.updateVerificationStatus('employee_education', orgId, empId, recordId, 'education', status, verifiedBy, notes)
  }

  async verifyExperience(orgId: string, empId: string, recordId: string, status: 'verified' | 'rejected', verifiedBy: string, notes?: string): Promise<Result<boolean>> {
    return this.updateVerificationStatus('employee_experience', orgId, empId, recordId, 'experience', status, verifiedBy, notes)
  }

  private async updateVerificationStatus(table: string, orgId: string, empId: string, recordId: string, entityType: string, status: 'verified' | 'rejected', verifiedBy: string, notes?: string): Promise<Result<boolean>> {
    try {
      const client = await getUntypedClient()
      
      const { data: oldRecord } = await client.from(table).select('verification_status').eq('id', recordId).single()
      
      const { error } = await client.from(table).update({
        verification_status: status,
        is_verified: status === 'verified',
        verified_by: verifiedBy,
        verified_at: new Date().toISOString(),
        verification_notes: notes || null
      }).eq('id', recordId)

      if (error) throw error
      
      await this.addVerificationHistory(orgId, empId, entityType, recordId, oldRecord?.verification_status || null, status, verifiedBy, notes)
      
      // Fetch the employee's user_id to send a notification
      const { data: emp } = await client.from('employees').select('user_id').eq('id', empId).single()
      if (emp?.user_id) {
        const title = status === 'verified' ? `${entityType} Verified` : `${entityType} Rejected`
        const message = status === 'verified' 
          ? `Your ${entityType} record has been successfully verified by HR.` 
          : `Your ${entityType} record was rejected by HR. ${notes ? 'Reason: ' + notes : ''}`
        await this.addNotification(emp.user_id, title, message, status === 'verified' ? 'success' : 'error')
      }

      await this.addTimelineEvent(
        orgId, 
        empId, 
        'verified', 
        `${entityType} ${status === 'verified' ? 'Verified' : 'Rejected'}`,
        status === 'verified' ? 'HR approved your record.' : 'HR rejected your record.'
      )

      return success(true)
    } catch (err) {
      logger.error(`[EmployeeRepository] updateVerificationStatus failed for ${table} / ${recordId}`, err)
      return failure(err as Error)
    }
  }
  
  async getPendingVerifications(orgId: string): Promise<Result<any>> {
    try {
      const client = await getUntypedClient()
      
      const [skillsRes, certsRes, eduRes, expRes] = await Promise.all([
        client.from('employee_skills').select('*, employee:employees(id, full_name, avatarUrl:profile_photo), skill:skills(name)').eq('organization_id', orgId).eq('verification_status', 'pending'),
        client.from('employee_certifications').select('*, employee:employees(id, full_name, avatarUrl:profile_photo)').eq('organization_id', orgId).eq('verification_status', 'pending'),
        client.from('employee_education').select('*, employee:employees(id, full_name, avatarUrl:profile_photo)').eq('organization_id', orgId).eq('verification_status', 'pending'),
        client.from('employee_experience').select('*, employee:employees(id, full_name, avatarUrl:profile_photo)').eq('organization_id', orgId).eq('verification_status', 'pending')
      ])

      return success({
        skills: skillsRes.data || [],
        certifications: certsRes.data || [],
        education: eduRes.data || [],
        experience: expRes.data || []
      })
    } catch (err) {
      logger.error(`[EmployeeRepository] getPendingVerifications failed`, err)
      return failure(err as Error)
    }
  }

  async calculateProfileCompletion(employeeId: string): Promise<Result<{ score: number, missing: string[] }>> {
    try {
      const client = await getUntypedClient()
      const { data: emp } = await client.from('employees').select('profile_photo, phone, date_of_birth, blood_group, marital_status').eq('id', employeeId).single()
      if (!emp) throw new Error('Employee not found')

      const [contacts, skills, certs, docs] = await Promise.all([
        client.from('emergency_contacts').select('id').eq('employee_id', employeeId).limit(1),
        client.from('employee_skills').select('id').eq('employee_id', employeeId).limit(1),
        client.from('employee_certifications').select('id').eq('employee_id', employeeId).limit(1),
        client.from('employee_documents').select('id').eq('employee_id', employeeId).eq('category', 'Resume/CV').limit(1)
      ])

      const missing: string[] = []
      let score = 0
      const totalPoints = 10
      
      if (emp.profile_photo) score += 1; else missing.push('Profile Photo')
      if (emp.phone) score += 1; else missing.push('Phone Number')
      if (emp.date_of_birth) score += 1; else missing.push('Date of Birth')
      if (emp.blood_group) score += 1; else missing.push('Blood Group')
      if (emp.marital_status) score += 1; else missing.push('Marital Status')
      if (contacts.data && contacts.data.length > 0) score += 2; else missing.push('Emergency Contact')
      if (skills.data && skills.data.length > 0) score += 1; else missing.push('Skills')
      if (certs.data && certs.data.length > 0) score += 1; else missing.push('Certification')
      if (docs.data && docs.data.length > 0) score += 1; else missing.push('Resume/CV Document')

      const percentage = Math.round((score / totalPoints) * 100)

      return success({ score: percentage, missing })
    } catch (err) {
      return failure(err as Error)
    }
  }
}

export const employeeRepository = new EmployeeRepository()
