// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Building2, Layers3, Briefcase, FolderKanban, BadgeCheck, TrendingUp, UserPlus, UserMinus, Clock } from 'lucide-react'

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

  const statCards = [
    { label: 'Total People', value: totalPeople, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', href: '/admin/hr/people' },
    { label: 'Active', value: activePeople, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', href: '/admin/hr/people' },
    { label: 'Organizations', value: totalOrgs, icon: Building2, color: 'text-violet-500', bg: 'bg-violet-500/10', href: '/admin/hr/organizations' },
    { label: 'Departments', value: totalDepts, icon: Layers3, color: 'text-amber-500', bg: 'bg-amber-500/10', href: '/admin/hr/departments' },
    { label: 'Projects', value: totalProjects, icon: FolderKanban, color: 'text-rose-500', bg: 'bg-rose-500/10', href: '/admin/hr/projects' },
  ]

  const quickActions = [
    { label: 'Add Person', href: '/admin/hr/people', icon: UserPlus, desc: 'Register a new employee or user' },
    { label: 'Create Department', href: '/admin/hr/departments', icon: Layers3, desc: 'Set up a new department' },
    { label: 'Create Team', href: '/admin/hr/teams', icon: Briefcase, desc: 'Build a new team under a department' },
    { label: 'Create Project', href: '/admin/hr/projects', icon: FolderKanban, desc: 'Initialize a new project' },
    { label: 'Send Invitation', href: '/admin/hr/invitations', icon: UserPlus, desc: 'Invite someone to the organization' },
    { label: 'Manage Designations', href: '/admin/hr/designations', icon: BadgeCheck, desc: 'Define job titles and levels' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">HR Dashboard</h1>
        <p className="text-muted-foreground mt-1">Enterprise Workforce Management overview</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border border-border/50 bg-card p-5 hover:shadow-md hover:border-border transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={18} className={stat.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200 group"
              >
                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground">{action.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
