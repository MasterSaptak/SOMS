"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Activity, Target, CheckSquare, FileText, Settings, Users, Plus } from 'lucide-react'
import { TeamStats } from '@/components/hr/team-stats'
import { TeamMemberTable } from '@/components/hr/team-member-table'
import { EmployeePicker } from '@/components/hr/employee-picker'
import { Button } from '@/components/ui/button'

export function TeamDashboardClient({ team, members, stats, orgId }: any) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddingMember, setIsAddingMember] = useState(false)

  const handleAddMember = async (employeeId: string | null) => {
    if (!employeeId) return
    console.log('Adding member', employeeId, 'to team', team.id)
    setIsAddingMember(false)
    router.refresh()
  }

  const handleUpdateRole = async (employeeId: string, roleName: string) => {
    console.log('Updating role for', employeeId, 'to', roleName)
    router.refresh()
  }

  const handleRemoveMember = async (employeeId: string) => {
    console.log('Removing member', employeeId)
    router.refresh()
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'projects', label: 'Projects', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'activity', label: 'Activity', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const Icon = team.icon ? require('lucide-react')[team.icon] || Briefcase : Briefcase

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white shrink-0 mt-1"
            style={{ backgroundColor: team.color || '#3b82f6' }}
          >
            <Icon size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{team.name}</h1>
              {team.code && (
                <span className="bg-muted text-muted-foreground text-xs font-mono px-2 py-1 rounded border">
                  {team.code}
                </span>
              )}
            </div>
            <p className="text-muted-foreground max-w-2xl mt-1">{team.description || 'No description provided.'}</p>
            <div className="flex items-center gap-3 mt-3 text-sm">
              <span className="px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground capitalize font-medium">
                {team.team_type || 'Functional'}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full capitalize font-medium ${
                team.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
                team.status === 'Archived' ? 'bg-destructive/10 text-destructive' :
                'bg-yellow-500/10 text-yellow-600'
              }`}>
                {team.status || 'Draft'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b">
        <div className="flex overflow-x-auto">
          {tabs.map(tab => {
            const TabIcon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <TeamStats stats={stats} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-4">Recent Activity</h3>
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                  Activity stream will appear here in future updates.
                </div>
              </div>
              <div className="bg-card border rounded-xl p-5">
                <h3 className="font-semibold mb-4">Current Projects</h3>
                <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                  Projects module arriving in Sprint 4.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Team Members</h3>
              {!isAddingMember ? (
                <Button onClick={() => setIsAddingMember(true)} size="sm">
                  <Plus size={16} className="mr-2" /> Add Member
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => setIsAddingMember(false)} size="sm">Cancel</Button>
              )}
            </div>

            {isAddingMember && (
              <div className="bg-muted/30 p-4 rounded-xl border flex items-end gap-4 max-w-md">
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Select Employee</label>
                  <EmployeePicker 
                    orgId={orgId} 
                    value={null}
                    onChange={(id) => handleAddMember(id)}
                  />
                </div>
              </div>
            )}

            <TeamMemberTable 
              members={members} 
              onRemove={handleRemoveMember}
              onUpdateRole={handleUpdateRole}
            />
          </div>
        )}

        {['projects', 'tasks', 'activity', 'settings'].includes(activeTab) && (
          <div className="bg-card border border-dashed rounded-xl p-12 text-center animate-in fade-in">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              {React.createElement(tabs.find(t => t.id === activeTab)?.icon || FileText, { size: 24, className: 'text-muted-foreground' })}
            </div>
            <h3 className="text-lg font-semibold mb-2 capitalize">{activeTab} Module</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              This section is reserved for future integrations. As SOMS evolves, this team will seamlessly connect with the {activeTab} engine.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
