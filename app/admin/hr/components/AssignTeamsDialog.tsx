"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { X, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { assignEmployeeTeamsAction } from '@/app/actions/hr.actions'
import { createBrowserClient } from '@supabase/ssr'

export function AssignTeamsDialog({ 
  organizationId,
  employeeId,
  currentTeams,
  onClose,
  onSuccess
}: { 
  organizationId: string
  employeeId: string
  currentTeams: { id: string; name: string; role_in_team: string }[]
  onClose: () => void
  onSuccess?: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [allTeams, setAllTeams] = useState<{ id: string; name: string; department_id: string }[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set(currentTeams.map(t => t.id)))

  useEffect(() => {
    async function loadTeams() {
      // Create a local client to fetch teams. We can also do this via Server Action, but client works for read.
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      // Fetch all teams for the organization. Since teams links to departments, we need to join.
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id, name, department_id,
          departments!inner(organization_id)
        `)
        .eq('departments.organization_id', organizationId)

      if (data) {
        setAllTeams(data.map((d: any) => ({ id: d.id, name: d.name, department_id: d.department_id })))
      }
      setFetching(false)
    }
    loadTeams()
  }, [organizationId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const result = await assignEmployeeTeamsAction(
      organizationId, 
      employeeId, 
      Array.from(selectedTeamIds), 
      'system'
    )

    setLoading(false)

    if (!result.success) {
      setError(result.error?.message || 'Failed to update teams')
    } else {
      if (onSuccess) onSuccess()
      onClose()
    }
  }

  const toggleTeam = (teamId: string) => {
    const next = new Set(selectedTeamIds)
    if (next.has(teamId)) {
      next.delete(teamId)
    } else {
      next.add(teamId)
    }
    setSelectedTeamIds(next)
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-background border border-border shadow-2xl rounded-xl w-full max-w-md flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <h2 className="font-semibold text-lg">Assign Teams</h2>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>}

            <div className="space-y-3">
              {fetching ? (
                <div className="py-8 flex justify-center"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
              ) : allTeams.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No teams found in the organization.</p>
              ) : (
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {allTeams.map(team => (
                    <label key={team.id} className="flex items-center justify-between p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{team.name}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-primary rounded border-border"
                        checked={selectedTeamIds.has(team.id)}
                        onChange={() => toggleTeam(team.id)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading || fetching}>{loading ? 'Saving...' : 'Save Assignments'}</Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}
