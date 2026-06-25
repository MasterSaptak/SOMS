// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Users, Building2, GitBranch, Layers3, BadgeCheck, 
  FolderKanban, Shield, Mail, ArrowRightLeft, 
  ScrollText, LayoutDashboard, Briefcase
} from 'lucide-react'

const hrNavItems = [
  { label: 'Dashboard',     href: '/admin/hr',              icon: LayoutDashboard },
  { label: 'People',        href: '/admin/hr/people',       icon: Users },
  { label: 'Organizations', href: '/admin/hr/organizations',icon: Building2 },
  { label: 'Branches',      href: '/admin/hr/branches',     icon: GitBranch },
  { label: 'Departments',   href: '/admin/hr/departments',  icon: Layers3 },
  { label: 'Designations',  href: '/admin/hr/designations', icon: BadgeCheck },
  { label: 'Teams',         href: '/admin/hr/teams',        icon: Briefcase },
  { label: 'Projects',      href: '/admin/hr/projects',     icon: FolderKanban },
  { label: 'Roles',         href: '/admin/hr/roles',        icon: Shield },
  { label: 'Invitations',   href: '/admin/hr/invitations',  icon: Mail },
  { label: 'Transfers',     href: '/admin/hr/transfers',    icon: ArrowRightLeft },
  { label: 'Audit Logs',    href: '/admin/hr/audit',        icon: ScrollText },
]

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/admin/hr') return pathname === '/admin/hr'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex gap-0 -m-5 md:-m-8 min-h-[calc(100vh-3.5rem)]">
      {/* HR Sub-Navigation */}
      <aside className="w-56 shrink-0 border-r border-border/40 bg-surface-primary/50 backdrop-blur-sm overflow-y-auto">
        <div className="p-4 pb-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
            Workforce Management
          </h2>
        </div>
        <nav className="px-2 pb-4 space-y-0.5">
          {hrNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${active 
                    ? 'bg-primary/10 text-primary shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                  }
                `}
              >
                <Icon size={16} className={active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}
