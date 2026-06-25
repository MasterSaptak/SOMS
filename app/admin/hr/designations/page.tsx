// @ts-nocheck
import { BadgeCheck, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DesignationsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  let designations: any[] = []
  try {
    const { data, error } = await adminSb.from('designations').select('*').order('level', { ascending: true })
    if (!error) designations = data || []
  } catch {}

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Designations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Job titles and hierarchy levels</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          New Designation
        </button>
      </div>

      {designations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <BadgeCheck size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No designations configured</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Designations define job titles like "Senior Backend Engineer" or "CEO". Run the database migration to create the designations table first.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {designations.map((d: any) => (
                <tr key={d.id} className="hover:bg-accent/30 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-foreground">{d.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.level}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {d.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
