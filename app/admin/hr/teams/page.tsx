// @ts-nocheck
import { Briefcase, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeamsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  let teams: any[] = []
  try {
    const { data, error } = await adminSb.from('teams').select('*').order('name')
    if (!error) teams = data || []
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage cross-functional and departmental teams</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          Create Team
        </button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No teams configured</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Teams belong to departments. Run the database migration to create the teams table first, then set up your team structure.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: any) => (
            <div key={team.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{team.name}</h3>
                  <p className="text-xs text-muted-foreground">{team.description || 'No description'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                <span>Lead: {team.lead_id ? 'Assigned' : 'Not set'}</span>
                <span className={team.is_active !== false ? 'text-emerald-600' : 'text-red-500'}>{team.is_active !== false ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
