import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import {
  MOCK_ORG_ID,
  MOCK_WORK_LOCATIONS,
  MOCK_DESIGNATIONS,
  MOCK_DEPARTMENTS,
  MOCK_TEAMS,
  MOCK_EMPLOYEES,
  MOCK_EMPLOYMENT_DETAILS,
  MOCK_EMERGENCY_CONTACTS,
  MOCK_SKILLS
} from './generators/legacy-mock-data'
import { logger } from '@/lib/logger/logger'

export class SeedService {
  /**
   * Generates a realistic Demo Organization with mapped UUIDs.
   * If a config is provided, it could eventually scale the generation (e.g. 150 vs 1000 employees).
   * For now, it maps our legacy static arrays.
   */
  async seedDemoOrganization() {
    const supabase = await createClient()
    logger.info('[SeedService] Starting demo organization seed...')

    try {
      // 1. Generate UUID Maps
      const idMap: Record<string, string> = {
        [MOCK_ORG_ID]: uuidv4(),
        'none': null // for no manager
      }

      // Populate ID maps
      MOCK_WORK_LOCATIONS.forEach(l => { idMap[l.id] = uuidv4() })
      MOCK_DESIGNATIONS.forEach(d => { idMap[d.id] = uuidv4() })
      MOCK_DEPARTMENTS.forEach(d => { idMap[d.id] = uuidv4() })
      MOCK_TEAMS.forEach(t => { idMap[t.id] = uuidv4() })
      MOCK_EMPLOYEES.forEach(e => {
        idMap[e.id] = uuidv4()
        idMap[e.userId] = uuidv4() // fake user ids
      })

      // 2. Insert Organization
      logger.info('[SeedService] Inserting Organization...')
      const { error: orgErr } = await supabase.from('organizations').insert({
        id: idMap[MOCK_ORG_ID],
        name: 'SOMS Demo Company',
        domain: 'soms-demo.com',
        is_demo: true
      })
      if (orgErr) throw orgErr

      // 3. Insert Locations & Designations
      logger.info('[SeedService] Inserting Work Locations & Designations...')
      await supabase.from('work_locations').insert(MOCK_WORK_LOCATIONS.map(l => ({
        id: idMap[l.id],
        organization_id: idMap[MOCK_ORG_ID],
        name: l.name,
        address: l.address,
        timezone: l.timezone
      })))

      await supabase.from('designations').insert(MOCK_DESIGNATIONS.map(d => ({
        id: idMap[d.id],
        organization_id: idMap[MOCK_ORG_ID],
        title: d.title,
        level: d.level
      })))

      // 4. Insert Departments (Handle Self-Refs like Parent ID)
      logger.info('[SeedService] Inserting Departments...')
      await supabase.from('departments').insert(MOCK_DEPARTMENTS.map(d => ({
        id: idMap[d.id],
        organization_id: idMap[MOCK_ORG_ID],
        name: d.name,
        parent_id: d.parentId ? idMap[d.parentId] : null
      })))

      // 5. Insert Teams
      logger.info('[SeedService] Inserting Teams...')
      await supabase.from('teams').insert(MOCK_TEAMS.map(t => ({
        id: idMap[t.id],
        department_id: idMap[t.departmentId],
        name: t.name
      })))

      // 6. Insert Employees
      logger.info('[SeedService] Inserting Employees...')
      // We need to insert profiles first because employees reference profiles?
      // Wait, our mock employees have a userId. Let's just create raw profiles if required.
      // But employees also have `user_id` mapped to auth.users in standard setup.
      // For demo, we might need to bypass FK or insert into profiles.
      // Let's insert into `profiles` first.
      const profilesData = MOCK_EMPLOYEES.map(e => ({
        id: idMap[e.userId],
        role: 'employee'
      }))
      
      // Note: auth.users FK might fail if we don't insert auth users. 
      // If auth.users FK is active, we cannot insert profiles without auth.users.
      // In a real demo seeder, we might have to use Supabase Admin API to create auth users,
      // or temporarilly disable the FK constraint, or make `user_id` nullable in demo scenarios.
      // We'll map `user_id: null` for now to avoid auth constraints blocking the seed, 
      // assuming we made it nullable or we will alter the table to support unlinked employees.

      const employeesData = MOCK_EMPLOYEES.map(e => ({
        id: idMap[e.id],
        organization_id: idMap[MOCK_ORG_ID],
        employee_id_string: e.employeeCode,
        full_name: `${e.firstName} ${e.lastName}`,
        email: e.email,
        phone: e.phone,
        department_id: idMap[e.departmentId],
        team_id: e.teamId ? idMap[e.teamId] : null,
        designation_id: idMap[e.designationId],
        work_location_id: idMap[e.workLocationId],
        manager_id: e.managerId && e.managerId !== 'none' ? idMap[e.managerId] : null,
        joining_date: e.joinDate,
        employment_status: e.status
      }))

      // Since manager_id is self-referential, we can insert all employees safely as long as they are deferred
      // or we just insert them in one batch and Postgres handles it if deferrable,
      // OR we insert them with manager_id = null first, then update them.
      const { error: empErr } = await supabase.from('employees').insert(
        employeesData.map(e => ({ ...e, manager_id: null }))
      )
      if (empErr) throw empErr

      // Update managers
      for (const e of employeesData) {
        if (e.manager_id) {
          await supabase.from('employees').update({ manager_id: e.manager_id }).eq('id', e.id)
        }
      }

      // Update Department Heads and Team Leads
      logger.info('[SeedService] Updating Heads & Leads...')
      for (const d of MOCK_DEPARTMENTS) {
        if (d.headId) {
          await supabase.from('departments').update({ head_id: idMap[d.headId] }).eq('id', idMap[d.id])
        }
      }
      for (const t of MOCK_TEAMS) {
        if (t.leadId) {
          await supabase.from('teams').update({ lead_id: idMap[t.leadId] }).eq('id', idMap[t.id])
        }
      }

      // 7. Insert Employee 360 Data
      logger.info('[SeedService] Inserting 360 Data...')
      await supabase.from('employment_details').insert(MOCK_EMPLOYMENT_DETAILS.map(ed => ({
        id: uuidv4(),
        employee_id: idMap[ed.employeeId],
        employment_type: ed.employmentType,
        probation_end_date: ed.probationEndDate,
        notice_period_days: ed.noticePeriodDays,
        work_schedule: ed.workSchedule
      })))

      await supabase.from('emergency_contacts').insert(MOCK_EMERGENCY_CONTACTS.map(ec => ({
        id: uuidv4(),
        employee_id: idMap[ec.employeeId],
        name: ec.name,
        relationship: ec.relationship,
        phone: ec.phone,
        email: ec.email,
        is_primary: ec.isPrimary
      })))

      await supabase.from('employee_skills').insert(MOCK_SKILLS.map(sk => ({
        id: uuidv4(),
        employee_id: idMap[sk.employeeId],
        skill_name: sk.skillName,
        proficiency: sk.proficiency,
        is_verified: sk.isVerified
      })))

      logger.info('[SeedService] Demo Seed Complete! 🎉')
      return { success: true }
    } catch (err) {
      logger.error('[SeedService] Seed failed:', err)
      return { success: false, error: err }
    }
  }

  async resetDemoOrganization() {
    await this.deleteDemoOrganization()
    return this.seedDemoOrganization()
  }

  async deleteDemoOrganization() {
    const supabase = await createClient()
    logger.info('[SeedService] Deleting Demo Organizations...')
    // Cascade delete will handle employees, departments, teams, etc.
    const { error } = await supabase.from('organizations').delete().eq('is_demo', true)
    if (error) {
      logger.error('[SeedService] Delete failed:', error)
      return { success: false, error }
    }
    return { success: true }
  }
}

export const seedService = new SeedService()
