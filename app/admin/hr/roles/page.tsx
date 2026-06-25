// @ts-nocheck
import { Shield } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Enterprise RBAC management</p>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
        <Shield size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Roles & Permissions Module</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">This module will be implemented in Phase 6 of the build sequence. It will provide enterprise RBAC with assignable roles and custom permission overrides.</p>
      </div>
    </div>
  )
}
