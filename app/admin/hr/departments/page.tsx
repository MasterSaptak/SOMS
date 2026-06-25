// @ts-nocheck
import { Layers3, Plus } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DepartmentsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const { createClient: createAdmin } = await import('@supabase/supabase-js')
  const adminSb = createAdmin(supabaseUrl, supabaseKey)

  const { data: depts } = await adminSb
    .from('departments')
    .select('id, name, organization_id, head_id, created_at')
    .order('name')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Departments</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{depts?.length || 0} departments configured</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          New Department
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Department</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Employees</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Head</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {(depts || []).map((dept: any) => (
              <tr key={dept.id} className="hover:bg-accent/30 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Layers3 size={16} />
                    </div>
                    <span className="font-medium text-foreground">{dept.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">—</td>
                <td className="px-4 py-3 text-muted-foreground">{dept.head_id ? 'Assigned' : 'Not set'}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(dept.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
            {(!depts || depts.length === 0) && (
              <tr><td colSpan={4} className="px-4 py-16 text-center text-muted-foreground">
                <Layers3 size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-base font-medium">No departments yet</p>
                <p className="text-sm mt-1">Create your first department to organize your workforce</p>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
