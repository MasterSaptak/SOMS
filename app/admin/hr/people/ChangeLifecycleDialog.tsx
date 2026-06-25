// @ts-nocheck
import React, { useState, useTransition } from 'react'
import { X, Loader2, ArrowRight } from 'lucide-react'
import { updatePersonAction } from '@/app/actions/people.actions'

interface Props {
  employeeId: string
  currentStatus: string | null
  personName: string
  onClose: () => void
  onUpdate: () => void
}

const lifecycleStates = [
  'invited', 'pending', 'active', 'onboarding', 'confirmed', 
  'transferred', 'resigned', 'terminated', 'archived'
]

const stateDescriptions: Record<string, string> = {
  invited: 'User has been sent an invitation but has not registered yet.',
  pending: 'User has registered but HR has not confirmed their employment.',
  onboarding: 'User is currently going through the onboarding process.',
  active: 'Standard active state for regular employees.',
  confirmed: 'Employee has successfully completed probation.',
  transferred: 'Employee has been transferred to another branch or team.',
  resigned: 'Employee has formally resigned.',
  terminated: 'Employee has been terminated by the company.',
  archived: 'Former employee record is archived for compliance.'
}

export default function ChangeLifecycleDialog({ employeeId, currentStatus, personName, onClose, onUpdate }: Props) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'active')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    if (selectedStatus === currentStatus) {
      onClose()
      return
    }

    startTransition(async () => {
      const result = await updatePersonAction(employeeId, { lifecycle_status: selectedStatus })
      if (result.success) {
        onUpdate()
        onClose()
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground">Change Lifecycle Status</h2>
              <p className="text-sm text-muted-foreground">Updating status for {personName}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {lifecycleStates.map((status) => (
              <label
                key={status}
                className={`
                  flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${selectedStatus === status ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}
                `}
              >
                <div className="pt-0.5">
                  <input
                    type="radio"
                    name="lifecycle_status"
                    value={status}
                    checked={selectedStatus === status}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-4 h-4 text-primary bg-background border-border focus:ring-primary"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold capitalize text-foreground">{status}</span>
                    {currentStatus === status && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">Current</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stateDescriptions[status] || ''}</p>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isPending || selectedStatus === currentStatus}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Update Status
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
