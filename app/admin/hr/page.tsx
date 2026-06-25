// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Building2, Layers3, Briefcase, FolderKanban, BadgeCheck, TrendingUp, UserPlus, UserMinus, Clock } from 'lucide-react'
import { WorkforceWorkspace } from './components/WorkforceWorkspace'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  return createAdmin(supabaseUrl, supabaseKey)
}

export default async function HRDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return <div className="text-center py-20 text-muted-foreground">Please log in</div>
  
  const adminSb = await getAdminClient()

  // Get user's organization
  const { data: orgMembers } = await adminSb
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
  
  const organizationId = orgMembers?.[0]?.organization_id

  // Fetch stats using service role to avoid RLS issues
  let totalPeople = 0, activePeople = 0, totalDepts = 0, totalOrgs = 0, totalProjects = 0

  const { count: empCount } = await adminSb
    .from('employees')
    .select('id', { count: 'exact', head: true })
  totalPeople = empCount || 0

  const { count: activeCount } = await adminSb
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('employment_status', 'active')
  activePeople = activeCount || 0

  const { count: deptCount } = await adminSb
    .from('departments')
    .select('id', { count: 'exact', head: true })
  totalDepts = deptCount || 0

  const { count: projCount } = await adminSb
    .from('projects')
    .select('id', { count: 'exact', head: true })
  totalProjects = projCount || 0

  const { count: orgCount } = await adminSb
    .from('organizations')
    .select('id', { count: 'exact', head: true })
  totalOrgs = orgCount || 0

  const stats = {
    totalPeople,
    activePeople,
    totalDepts,
    totalOrgs,
    totalProjects,
    onLeave: 0, // Placeholder
    probation: 0, // Placeholder
    newHires: 0, // Placeholder
  }

  // Fetch initial people data for the People tab
  const { getPeopleAction, getFilterOptionsAction } = await import('@/app/actions/people.actions')
  
  const [peopleResult, filterOptions] = await Promise.all([
    getPeopleAction({ organizationId: null, page: 1, pageSize: 50 }),
    getFilterOptionsAction(null),
  ])

  const initialPeopleData = peopleResult.success ? peopleResult.data! : { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }

  return (
    <WorkforceWorkspace 
      stats={stats}
      initialPeopleData={initialPeopleData}
      filterOptions={filterOptions}
      organizationId={null}
    />
  )
}
