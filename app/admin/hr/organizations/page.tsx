// @ts-nocheck
import { Building2, Plus, MoreHorizontal, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function OrganizationsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  const { data: orgs, error } = await adminSb
    .from('organizations')
    .select('id, name, slug, logo_url, industry, size, is_active, created_at')
    .order('name')

  const { data: memberCounts } = await (adminSb as any)
    .from('organization_members')
    .select('organization_id')

  const countMap: Record<string, number> = {}
  memberCounts?.forEach((m: any) => {
    countMap[m.organization_id] = (countMap[m.organization_id] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{orgs?.length || 0} organizations in the system</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          New Organization
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(orgs || []).map((org: any) => (
          <div key={org.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-border transition-all duration-200 group cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {org.logo_url ? (
                  <img src={org.logo_url} alt="" className="w-10 h-10 rounded-lg object-cover ring-1 ring-border" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{org.name}</h3>
                  <p className="text-xs text-muted-foreground">{org.slug}</p>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${org.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600'}`}>
                {org.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-lg font-bold text-foreground">{countMap[org.id] || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Members</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-lg font-bold text-foreground">—</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Teams</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/30">
                <p className="text-lg font-bold text-foreground">—</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Projects</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
              <span>{org.industry || 'No industry'}</span>
              <span>Created {new Date(org.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        ))}

        {(!orgs || orgs.length === 0) && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <Building2 size={40} className="text-muted-foreground/30 mb-3" />
            <p className="text-base font-medium text-muted-foreground">No organizations yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Create your first organization to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
