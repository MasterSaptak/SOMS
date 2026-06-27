"use client"

import React, { useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TeamCard } from '@/components/hr/team-card'
import { TeamForm } from '@/components/hr/team-form'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function TeamDirectory({ initialTeams, orgId, branches, departments }: any) {
  const router = useRouter()
  const [teams, setTeams] = useState(initialTeams)
  const [isCreating, setIsCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const filteredTeams = teams.filter((t: any) => {
    const matchSearch = (t.name?.toLowerCase().includes(search.toLowerCase())) || 
                        (t.code?.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter
    const matchType = typeFilter === 'ALL' || t.team_type === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const handleCreateSubmit = async (data: any) => {
    // In a real app, you'd call an API or Server Action here
    console.log('Submitting new team:', data)
    setIsCreating(false)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Teams</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage cross-functional and departmental teams</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Team
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search teams by name or code..." 
            className="pl-9 bg-muted/50"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px] bg-muted/50">
              <SelectValue placeholder="Team Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="Functional">Functional</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Temporary">Temporary</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-muted/50">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTeams.map((team: any) => (
          <TeamCard 
            key={team.id} 
            team={team} 
            onClick={() => router.push(`/admin/hr/teams/${team.id}`)}
          />
        ))}
        {filteredTeams.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed">
            No teams match your search criteria.
          </div>
        )}
      </div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden h-[80vh] flex flex-col">
          <TeamForm 
            orgId={orgId} 
            branches={branches} 
            departments={departments} 
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreating(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
