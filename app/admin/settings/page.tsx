"use client"

import React from "react"
import Link from "next/link"
import { 
  Settings2, 
  Shield, 
  ToggleLeft, 
  Workflow, 
  Blocks, 
  RefreshCw, 
  Building,
  Wrench,
  ChevronRight
} from "lucide-react"

const SETTING_CARDS = [
  {
    title: 'System Settings',
    description: 'Developer tools, environment variables, and system diagnostics.',
    icon: Wrench,
    href: '/admin/settings/developer-tools',
    color: 'text-slate-500',
    bg: 'from-slate-500/10 to-slate-500/5',
    border: 'hover:border-slate-500/40',
  },
  {
    title: 'Workflows',
    description: 'Manage automated business processes, approval chains, and task routing.',
    icon: Workflow,
    href: '/admin/workflows',
    color: 'text-blue-500',
    bg: 'from-blue-500/10 to-blue-500/5',
    border: 'hover:border-blue-500/40',
  },
  {
    title: 'Audit Logs',
    description: 'Track and monitor all system activities, user actions, and data changes.',
    icon: Shield,
    href: '/admin/audit',
    color: 'text-emerald-500',
    bg: 'from-emerald-500/10 to-emerald-500/5',
    border: 'hover:border-emerald-500/40',
  },
  {
    title: 'Feature Flags',
    description: 'Toggle experimental features and safely control rollouts across environments.',
    icon: ToggleLeft,
    href: '/admin/features',
    color: 'text-violet-500',
    bg: 'from-violet-500/10 to-violet-500/5',
    border: 'hover:border-violet-500/40',
  },
  {
    title: 'Integrations',
    description: 'Connect SOMS with external tools, APIs, and third-party services.',
    icon: Blocks,
    href: '#',
    color: 'text-amber-500',
    bg: 'from-amber-500/10 to-amber-500/5',
    border: 'hover:border-amber-500/40',
    comingSoon: true,
  },
  {
    title: 'HR Configuration',
    description: 'Configure branches, departments, roles, leave types, and policies.',
    icon: Building,
    href: '/admin/settings/hr',
    color: 'text-rose-500',
    bg: 'from-rose-500/10 to-rose-500/5',
    border: 'hover:border-rose-500/40',
  },
  {
    title: 'Organization',
    description: 'Manage company details, branding, departments, and global preferences.',
    icon: Building,
    href: '#',
    color: 'text-rose-500',
    bg: 'from-rose-500/10 to-rose-500/5',
    border: 'hover:border-rose-500/40',
    comingSoon: true,
  },
  {
    title: 'System Updates',
    description: 'Check for updates, clear caches, and manage deployment synchronization.',
    icon: RefreshCw,
    href: '#',
    color: 'text-sky-500',
    bg: 'from-sky-500/10 to-sky-500/5',
    border: 'hover:border-sky-500/40',
    comingSoon: true,
  },
]

export default function SettingsHubPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your system configurations and global preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SETTING_CARDS.map((card) => {
          const CardWrapper = card.comingSoon ? 'div' : Link
          const wrapperProps = card.comingSoon ? {} : { href: card.href }

          return (
            <CardWrapper
              key={card.title}
              {...(wrapperProps as any)}
              className={`group relative overflow-hidden border border-border/50 ${card.border} rounded-2xl p-6 transition-all duration-200 ${
                card.comingSoon 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${card.bg} flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm group-hover:text-foreground transition-colors">
                      {card.title}
                    </h3>
                    {card.comingSoon && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
                {!card.comingSoon && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground/60 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                )}
              </div>
            </CardWrapper>
          )
        })}
      </div>
    </div>
  )
}
