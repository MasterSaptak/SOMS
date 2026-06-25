"use client"

import React from "react"
import { Activity, UserPlus, Briefcase, Key, RefreshCw, Trash2, ArrowRightLeft } from "lucide-react"

export default function ActivityTimeline() {
  const activities = [
    {
      id: 1,
      type: 'transfer',
      title: 'Transferred to Backend Team',
      person: 'Alex Johnson',
      timestamp: 'Today at 10:45 AM',
      icon: ArrowRightLeft,
      color: 'bg-blue-100 text-blue-600',
      description: 'Transferred from Frontend Team by Michael K.'
    },
    {
      id: 2,
      type: 'create',
      title: 'New employee onboarded',
      person: 'Sarah Jenkins',
      timestamp: 'Yesterday at 4:30 PM',
      icon: UserPlus,
      color: 'bg-emerald-100 text-emerald-600',
      description: 'Completed HR onboarding process.'
    },
    {
      id: 3,
      type: 'role',
      title: 'Role updated to Department Head',
      person: 'Elena R.',
      timestamp: 'Yesterday at 2:15 PM',
      icon: Briefcase,
      color: 'bg-purple-100 text-purple-600',
      description: 'Promoted by Sarah Jenkins.'
    },
    {
      id: 4,
      type: 'security',
      title: 'Password reset requested',
      person: 'David J.',
      timestamp: 'Oct 24 at 9:00 AM',
      icon: Key,
      color: 'bg-amber-100 text-amber-600',
      description: 'Triggered from admin panel.'
    },
    {
      id: 5,
      type: 'delete',
      title: 'Profile archived',
      person: 'John Smith',
      timestamp: 'Oct 20 at 11:30 AM',
      icon: Trash2,
      color: 'bg-red-100 text-red-600',
      description: 'Offboarding completed.'
    }
  ]

  return (
    <div className="bg-card rounded-2xl border border-border p-8 max-w-3xl mx-auto shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
          <Activity size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Activity Timeline</h2>
          <p className="text-sm text-muted-foreground">Recent changes and audit logs across your workforce.</p>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-border/60 space-y-8 pb-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="relative animate-in slide-in-from-bottom-2 fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`absolute -left-[37px] top-1 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center ${activity.color}`}>
                <Icon size={12} strokeWidth={3} />
              </div>
              <div className="bg-surface-base border border-border/50 rounded-xl p-4 shadow-sm hover:border-border transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-foreground">{activity.title}</h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">{activity.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {activity.person.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-sm font-medium text-foreground">{activity.person}</span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            </div>
          )
        })}
        
        {/* Load More Indicator */}
        <div className="relative pt-4">
          <div className="absolute -left-[33px] top-4 w-6 h-6 rounded-full border-4 border-card bg-muted flex items-center justify-center">
            <RefreshCw size={10} className="text-muted-foreground" />
          </div>
          <button className="text-sm font-medium text-primary hover:underline">
            Load more activity...
          </button>
        </div>
      </div>
    </div>
  )
}
