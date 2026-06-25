import { createClient } from '@supabase/supabase-js'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'

// We use a singleton service role client exclusively for global admin operations
function getServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables for Service Role')
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )
}

export class GlobalAdminRepository {
  async getAllUsers(): Promise<Result<any[]>> {
    try {
      const sb = getServiceClient()
      
      // 1. Fetch all auth users
      const { data: authData, error: authError } = await sb.auth.admin.listUsers()
      if (authError) return failure(new Error(authError.message))
      
      // 2. Fetch all profiles to get roles
      const { data: profiles, error: profError } = await sb
        .from('profiles')
        .select('*')
      if (profError) return failure(new Error(profError.message))
      
      // 3. Fetch all organization memberships
      const { data: memberships, error: memError } = await sb
        .from('organization_members')
        .select('user_id, role, organizations(id, name, slug)')
        .eq('status', 'active')
      if (memError) return failure(new Error(memError.message))

      // 4. Fetch all employees to get employee ids
      const { data: employees, error: empError } = await sb
        .from('employees')
        .select('id, user_id, organization_id')
      if (empError) return failure(new Error(empError.message))

      // Combine the data
      const users = authData.users.map(u => {
        const profile = profiles.find(p => p.id === u.id)
        const userMemberships = memberships.filter(m => m.user_id === u.id)
        
        return {
          id: u.id,
          email: u.email,
          createdAt: u.created_at,
          lastSignInAt: u.last_sign_in_at,
          role: profile?.role || 'user',
          isBanned: !!u.banned_until,
          memberships: userMemberships.map(m => {
            const orgs = m.organizations as any;
            const emp = employees?.find(e => e.user_id === u.id && e.organization_id === orgs?.id) || employees?.find(e => e.user_id === u.id);
            return {
              orgId: orgs?.id,
              orgName: orgs?.name,
              role: m.role,
              employeeId: emp?.id
            }
          })
        }
      })

      return success(users)
    } catch (err) {
      logger.error('[GlobalAdminRepository] getAllUsers failed', err)
      return failure(err as Error)
    }
  }

  async deleteUser(userId: string): Promise<Result<boolean>> {
    try {
      const sb = getServiceClient()
      // Deleting from auth.users cascades to profiles and employees in most setups.
      const { error } = await sb.auth.admin.deleteUser(userId)
      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[GlobalAdminRepository] deleteUser failed', err)
      return failure(err as Error)
    }
  }

  async setBanStatus(userId: string, isBanned: boolean): Promise<Result<boolean>> {
    try {
      const sb = getServiceClient()
      let error
      if (isBanned) {
        // Ban for 100 years
        const { error: banErr } = await sb.auth.admin.updateUserById(userId, { ban_duration: '876000h' })
        error = banErr
      } else {
        const { error: unbanErr } = await sb.auth.admin.updateUserById(userId, { ban_duration: 'none' })
        error = unbanErr
      }
      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[GlobalAdminRepository] setBanStatus failed', err)
      return failure(err as Error)
    }
  }

  async updateUserRole(userId: string, role: string): Promise<Result<boolean>> {
    try {
      const sb = getServiceClient()
      const { error } = await sb.from('profiles').update({ role }).eq('id', userId)
      if (error) return failure(new Error(error.message))
      return success(true)
    } catch (err) {
      logger.error('[GlobalAdminRepository] updateUserRole failed', err)
      return failure(err as Error)
    }
  }

  async getAllOrganizations(): Promise<Result<any[]>> {
    try {
      const sb = getServiceClient()
      const { data, error } = await sb.from('organizations').select('id, name, slug')
      if (error) return failure(new Error(error.message))
      return success(data || [])
    } catch (err) {
      logger.error('[GlobalAdminRepository] getAllOrganizations failed', err)
      return failure(err as Error)
    }
  }

  async assignUserToOrganization(userId: string, email: string, orgId: string, role: string = 'employee'): Promise<Result<boolean>> {
    try {
      const sb = getServiceClient()

      // 1. Create organization_members record
      const { error: memErr } = await sb.from('organization_members').upsert({
        user_id: userId,
        organization_id: orgId,
        role: role,
        status: 'active'
      }, { onConflict: 'user_id,organization_id' })
      if (memErr) return failure(new Error(`Membership: ${memErr.message}`))

      // 2. Create employee record if not exists
      const { data: existingEmp } = await sb.from('employees')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (!existingEmp) {
        const { error: empErr } = await sb.from('employees').insert({
          user_id: userId,
          organization_id: orgId,
          full_name: email.split('@')[0], // Use email prefix as initial name
          email: email,
          status: 'active',
          joining_date: new Date().toISOString().split('T')[0],
        })
        if (empErr) return failure(new Error(`Employee: ${empErr.message}`))
      }

      return success(true)
    } catch (err) {
      logger.error('[GlobalAdminRepository] assignUserToOrganization failed', err)
      return failure(err as Error)
    }
  }
}

export const globalAdminRepository = new GlobalAdminRepository()

