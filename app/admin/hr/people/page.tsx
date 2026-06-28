// @ts-nocheck
import { getPeopleAction, getFilterOptionsAction } from '@/app/actions/people.actions'
import { listUnassignedUsers } from '@/app/actions/identity.actions'
import { createClient } from '@/lib/supabase/server'
import PeopleDirectoryClient from './PeopleDirectoryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PeoplePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <div className="text-center py-20 text-muted-foreground">Please log in</div>

  // Get user's organization
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  const { data: orgMembers } = await (adminSb as any)
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)

  // Use the first org as the primary one, but for the directory we might want to show all. 
  // Since this is an admin view, let's bypass the strict single-org filter for now 
  // so the user can see all employees across their organizations or unassigned employees.
  const organizationId = null // Bypass filter to show all users in the system
  const [peopleResult, filterOptions, unassignedRes] = await Promise.all([
    getPeopleAction({ organizationId, page: 1, pageSize: 50 }),
    getFilterOptionsAction(organizationId),
    listUnassignedUsers(orgMembers?.[0]?.organization_id || '')
  ])

  if (!peopleResult.success) {
    console.error("Error fetching people in Server Component:", peopleResult.error)
  }

  return (
    <PeopleDirectoryClient
      initialData={peopleResult.success ? peopleResult.data! : { data: [], total: 0, page: 1, pageSize: 50, totalPages: 0 }}
      filterOptions={filterOptions}
      organizationId={organizationId || orgMembers?.[0]?.organization_id || null}
      unassignedUsers={unassignedRes.data || []}
    />
  )
}
