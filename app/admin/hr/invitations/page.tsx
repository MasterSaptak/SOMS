// @ts-nocheck
import { Mail } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function InvitationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Invitations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Invite people to join the organization</p>
      </div>
      <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
        <Mail size={48} className="mx-auto mb-4 text-muted-foreground/30" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Invitations Module</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          This module will be implemented in Phase 7. The invitation flow will be:
          Invite → Email → Accept → Supabase Auth → Profile Created → Employee Created → Assign Department → Assign Team.
        </p>
      </div>
    </div>
  )
}
