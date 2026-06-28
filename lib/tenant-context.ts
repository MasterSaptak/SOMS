import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { cookies } from 'next/headers'

/**
 * Service to resolve the current active organization context for a user.
 */
export async function getCurrentOrganizationId(): Promise<Result<string>> {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return failure(new Error('Not authenticated'))
    }

    // Check if the user has an explicitly selected active organization in cookies
    const cookieStore = await cookies()
    const activeOrgId = cookieStore.get('soms_active_org_id')?.value

    if (activeOrgId) {
      // Verify they are actually a member of this org
      const { data: member, error } = await (supabase as any)
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('organization_id', activeOrgId)
        .eq('status', 'active')
        .single()
        
      if (!error && member) {
        return success(activeOrgId)
      }
      // If error or not found, fall back to default logic
    }

    // Default: find the first active organization this user belongs to
    const { data: members, error: memberError } = await (supabase as any)
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)

    if (memberError) throw memberError
    if (!members || members.length === 0) {
      return failure(new Error('User does not belong to any active organization'))
    }

    return success(members[0].organization_id)
  } catch (error) {
    return failure(error as Error)
  }
}
