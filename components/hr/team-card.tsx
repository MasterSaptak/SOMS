import React from 'react'
import { Briefcase, Users } from 'lucide-react'

export function TeamCard({ team, onClick }: { team: any, onClick?: () => void }) {
  const Icon = team.icon ? require('lucide-react')[team.icon] || Briefcase : Briefcase
  
  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: team.color || '#3b82f6' }}
        >
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {team.name}
            {team.code && (
              <span className="text-[10px] uppercase font-mono tracking-wider bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {team.code}
              </span>
            )}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">{team.description || 'No description provided.'}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-muted-foreground/70" />
          <span>{team.max_members ? `Capacity: ${team.max_members}` : 'Open Capacity'}</span>
        </div>
        <div className="flex items-center gap-2">
          {team.team_type && (
            <span className="bg-accent text-accent-foreground px-2 py-0.5 rounded-full capitalize">
              {team.team_type}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full capitalize font-medium ${
            team.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' :
            team.status === 'Archived' ? 'bg-destructive/10 text-destructive' :
            'bg-yellow-500/10 text-yellow-600'
          }`}>
            {team.status || 'Draft'}
          </span>
        </div>
      </div>
    </div>
  )
}
