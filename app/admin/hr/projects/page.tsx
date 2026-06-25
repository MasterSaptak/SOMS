// @ts-nocheck
import { FolderKanban, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ProjectsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  const { data: projects } = await adminSb
    .from('projects')
    .select('id, name, description, status, start_date, end_date, completion_percentage, created_at')
    .order('name')

  const statusColors: Record<string, string> = {
    'Planning': 'bg-slate-100 text-slate-700',
    'Active': 'bg-emerald-100 text-emerald-700',
    'On Hold': 'bg-amber-100 text-amber-700',
    'Completed': 'bg-blue-100 text-blue-700',
    'Cancelled': 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects?.length || 0} projects in the system</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {(!projects || projects.length === 0) ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
          <FolderKanban size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No projects yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Create your first project and assign team members to it.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj: any) => (
            <div key={proj.id} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <FolderKanban size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{proj.description || 'No description'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[proj.status] || 'bg-slate-100 text-slate-700'}`}>
                  {proj.status}
                </span>
              </div>
              {/* Progress */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{proj.completion_percentage || 0}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${proj.completion_percentage || 0}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
