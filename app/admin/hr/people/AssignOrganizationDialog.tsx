"use client"

import React, { useState, useEffect, useTransition } from 'react'
import { X, Building2 } from 'lucide-react'
import { toast } from 'sonner'
import { getUserOrganizationsAction } from '@/app/actions/organization.actions'
import { updatePersonAction } from '@/app/actions/people.actions'
import { assignToOrganization } from '@/app/actions/identity.actions'
import type { Organization } from '@/types/organizations'

interface Props {
  employee: any // PersonSummary
  onClose: () => void
  onAssigned: () => void
}

export default function AssignOrganizationDialog({ employee, onClose, onAssigned }: Props) {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadOrgs() {
      const result = await getUserOrganizationsAction()
      if (result.success && result.data) {
        const orgs = result.data.map(m => m.organization || (m as any).organizations).filter(Boolean) as Organization[]
        setOrganizations(orgs)
      }
      setIsLoading(false)
    }
    loadOrgs()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOrgId) {
      toast.error('Please select an organization')
      return
    }

    startTransition(async () => {
      try {
        // 1. Update employees table
        const updateResult = await updatePersonAction(employee.id, { organization_id: selectedOrgId })
        if (!updateResult.success) {
          throw new Error('Failed to update employee profile')
        }

        // 2. If user_id exists, assign in auth and organization_members
        if (employee.user_id) {
          const assignResult = await assignToOrganization(employee.user_id, selectedOrgId, 'employee')
          if (assignResult.error) {
            console.error('Auth assign error:', assignResult.error)
            // It might fail if already assigned, which is fine, we continue
          }
        }

        toast.success(`Successfully assigned ${employee.full_name} to organization`)
        onAssigned()
      } catch (err: any) {
        toast.error(err.message || 'An error occurred during assignment')
      }
    })
  }

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-6 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground leading-none">Assign Organization</h2>
                <p className="text-sm text-muted-foreground mt-1">Assign {employee.full_name}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Select Organization</label>
              {isLoading ? (
                <div className="h-10 w-full animate-pulse bg-muted rounded-lg"></div>
              ) : organizations.length === 0 ? (
                <p className="text-sm text-destructive">No organizations found. Please create one first.</p>
              ) : (
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                >
                  <option value="" disabled>Select an organization...</option>
                  {organizations.map(org => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || isLoading || organizations.length === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
