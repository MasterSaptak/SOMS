import React from 'react'
import { Users, CheckCircle, BarChart3, Target } from 'lucide-react'

export function TeamStats({ stats }: { stats: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-card border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Members</span>
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Users size={16} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{stats?.currentMembers || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">/ {stats?.maxMembers || '∞'} Capacity</div>
          </div>
          <div className="text-xs font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
            {stats?.capacityPercentage || 0}%
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Projects</span>
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Target size={16} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{stats?.activeProjects || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Projects</div>
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Tasks</span>
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle size={16} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{stats?.openTasks || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Open Tasks</div>
          </div>
          <div className="text-xs font-medium text-emerald-500">
            {stats?.completionPercentage || 0}% Done
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Active Today</span>
          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center">
            <BarChart3 size={16} />
          </div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{stats?.activeToday || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Clocked In</div>
          </div>
        </div>
      </div>
    </div>
  )
}
