"use server"

import { createClient, getAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// List users who are in auth.users but not assigned to the given organization
export async function listUnassignedUsers(organizationId: string) {
  const supabaseAdmin = getAdminClient()
  
  try {
    // Get all auth users
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (authError) throw authError

    // Get all members for this org
    const { data: orgMembers, error: membersError } = await supabaseAdmin
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organizationId)
      
    if (membersError) throw membersError

    // Filter out users already in the org
    const memberUserIds = new Set(orgMembers?.map(m => m.user_id) || [])
    const unassigned = users.filter(u => !memberUserIds.has(u.id))

    return { 
      data: unassigned.map(u => ({
        id: u.id,
        email: u.email,
        created_at: u.created_at
      })), 
      error: null 
    }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Assign user to organization
export async function assignToOrganization(userId: string, organizationId: string, roleName: string = 'employee') {
  const supabase = await createClient()
  const supabaseAdmin = getAdminClient()
  
  try {
    // 1. Check if user is authenticated (security)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error("Unauthorized")

    // 2. Insert into organization_members
    const { data: newMember, error: memberError } = await supabaseAdmin
      .from('organization_members')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        role: roleName,
        status: 'active'
      })
      .select()
      .single()

    if (memberError) throw memberError

    // 3. Find role ID to insert into member_roles
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .maybeSingle()
      
    if (roleData) {
      await supabaseAdmin
        .from('member_roles')
        .insert({
          organization_member_id: newMember.id,
          role_id: roleData.id,
          assigned_by: session.user.id
        })
    }
    
    // Log Activity
    await supabaseAdmin
      .from('member_activity')
      .insert({
        organization_member_id: newMember.id,
        event_type: 'Organization Assigned'
      })

    revalidatePath('/admin/settings/members')
    return { data: newMember, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Update Member Status
export async function updateMemberStatus(memberId: string, status: 'active' | 'suspended' | 'inactive') {
  const supabaseAdmin = getAdminClient()
  
  try {
    const { data, error } = await supabaseAdmin
      .from('organization_members')
      .update({ status })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error
    
    await supabaseAdmin
      .from('member_activity')
      .insert({
        organization_member_id: memberId,
        event_type: status === 'active' ? 'Membership Activated' : (status === 'suspended' ? 'Membership Suspended' : 'Membership Deactivated')
      })

    revalidatePath('/admin/settings/members')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}

// Update Member Role
export async function updateMemberRole(memberId: string, roleName: string) {
  const supabaseAdmin = getAdminClient()
  const supabase = await createClient()
  
  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Update primary role in organization_members
    const { data, error } = await supabaseAdmin
      .from('organization_members')
      .update({ role: roleName })
      .eq('id', memberId)
      .select()
      .single()

    if (error) throw error
    
    // Also add to member_roles (upsert logic to keep it simple, or just add if it doesn't exist)
    const { data: roleData } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .maybeSingle()
      
    if (roleData) {
      await supabaseAdmin
        .from('member_roles')
        .upsert({
          organization_member_id: memberId,
          role_id: roleData.id,
          assigned_by: session?.user?.id || null
        }, { onConflict: 'organization_member_id,role_id' })
    }

    await supabaseAdmin
      .from('member_activity')
      .insert({
        organization_member_id: memberId,
        event_type: 'Role Changed'
      })

    revalidatePath('/admin/settings/members')
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error: error.message }
  }
}
