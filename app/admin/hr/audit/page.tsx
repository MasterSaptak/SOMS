// @ts-nocheck
import { ScrollText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track all workforce changes and actions</p>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
        <ScrollText size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Audit Logs Module</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Every assignment, transfer, promotion, role change, department change, manager change, and deletion
          will be tracked here. This module will be implemented in Phase 8.
        </p>
      </div>
    </div>
  )
}
