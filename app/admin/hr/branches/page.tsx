// @ts-nocheck
import { GitBranch, Plus, MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BranchesPage() {
  // Branches table may not exist yet — handle gracefully
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  let branches: any[] = []
  try {
    const { data, error } = await adminSb.from('branches').select('*').order('name')
    if (!error) branches = data || []
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Branches</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage office locations and branches</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          New Branch
        </button>
      </div>

      {branches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <GitBranch size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No branches configured</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Branches represent physical office locations. Run the database migration first, then create branches to organize departments by location.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch: any) => (
            <div key={branch.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{branch.name}</h3>
                  <p className="text-xs text-muted-foreground">{branch.city}{branch.state ? `, ${branch.state}` : ''}{branch.country ? `, ${branch.country}` : ''}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
                <span>{branch.is_headquarters ? '🏢 Headquarters' : 'Branch Office'}</span>
                <span className={branch.is_active ? 'text-emerald-600' : 'text-red-500'}>{branch.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
