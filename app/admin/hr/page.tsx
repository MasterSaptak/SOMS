// @ts-nocheck
import { getActiveEmployeesAction, getDashboardStatsAction } from '@/app/actions/hr.actions'
import { HRDashboardClient } from './components/HRDashboardClient'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

import { CreateOrganizationForm } from './components/CreateOrganizationForm'
import { GlobalAdminDashboard } from './components/GlobalAdminDashboard'

export default async function HRManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in</div>
  }

  // Get user profile to check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'super_admin' || profile?.role === 'admin') {
    return <GlobalAdminDashboard />
  }

  // Get user's organization (safely handle multiple memberships)
  let organizationId = null
  const { data: orgMembers } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)

  if (orgMembers && orgMembers.length > 0) {
    organizationId = orgMembers[0].organization_id
  }

  if (!organizationId) {
    return <CreateOrganizationForm />
  }

  const [employeesResult, statsResult] = await Promise.all([
    getActiveEmployeesAction(organizationId),
    getDashboardStatsAction(organizationId)
  ])
  
  if (!employeesResult.success || !statsResult.success) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <p className="text-destructive">Failed to load HR data.</p>
        <p className="text-sm text-muted-foreground">{employeesResult.error?.message || statsResult.error?.message}</p>
      </div>
    )
  }

  return (
    <HRDashboardClient 
      employees={employeesResult.data || []} 
      stats={statsResult.data!} 
      organizationId={organizationId} 
    />
  )
}
