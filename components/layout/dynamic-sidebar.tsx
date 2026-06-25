"use client"

import React from 'react'
import Link from 'next/link'
import {
  Building2, LayoutDashboard, Clock, CalendarRange, CheckSquare, Trophy, Wallet,
  Activity, LogOut, ChevronLeft, ChevronRight, Monitor, DoorOpen, Megaphone,
  BarChart3, Users, Banknote, UserPlus, Brain, CalendarDays, GitBranch,
  FileText, Target, MessageSquare, Video, BookOpen, ClipboardList, Workflow,
  Shield, ToggleLeft, Settings, FolderKanban,
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuButton, SidebarContext } from '@/components/ui/sidebar'
import { useAuthStore } from '@/store/use-auth-store'
import { usePermissionStore } from '@/store/use-permission-store'
import { useFeatureStore } from '@/store/use-feature-store'
import { OrgSwitcher } from '@/components/org/org-switcher'
import { NotificationBell } from '@/components/layout/notification-bell'
import { createClient } from '@/lib/supabase/client'
import type { Permission } from '@/types/permissions'
import type { FeatureFlagKey } from '@/types/preferences'

// ─── Nav item definition ─────────────────────────────────────────────────────

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  /** Required permission to show this item */
  permission?: Permission
  /** Required feature flag to show this item */
  feature?: FeatureFlagKey
}

interface NavSection {
  label: string
  /** Required permission to show this section at all */
  permission?: Permission
  items: NavItem[]
}

// ─── Navigation definition ───────────────────────────────────────────────────

const NAVIGATION: NavSection[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/employee', icon: <LayoutDashboard size={18} /> },
      { label: 'Work Session', href: '/employee/session', icon: <Clock size={18} />, permission: 'attendance.read' },
      { label: 'Debt Recovery', href: '/employee/recovery', icon: <Activity size={18} />, permission: 'attendance.read' },
      { label: 'AI Analytics', href: '/employee/analytics', icon: <Brain size={18} />, feature: 'ai_assistant' },
      { label: 'Tasks', href: '/employee/tasks', icon: <CheckSquare size={18} />, permission: 'task.read' },
      { label: 'Calendar', href: '/employee/calendar', icon: <CalendarDays size={18} /> },
      { label: 'Leaves', href: '/employee/leaves', icon: <CalendarRange size={18} />, permission: 'leave.read' },
      { label: 'Assets', href: '/employee/assets', icon: <Monitor size={18} />, permission: 'asset.read' },
      { label: 'Meeting Rooms', href: '/employee/rooms', icon: <DoorOpen size={18} />, permission: 'room.read' },
      { label: 'Chat', href: '/employee/chat', icon: <MessageSquare size={18} />, feature: 'chat' },
      { label: 'Meetings', href: '/employee/meetings', icon: <Video size={18} />, feature: 'meetings', permission: 'meeting.read' },
      { label: 'Announcements', href: '/employee/announcements', icon: <Megaphone size={18} />, permission: 'announcement.read' },
      { label: 'Documents', href: '/employee/documents', icon: <FileText size={18} />, permission: 'document.read' },
      { label: 'Org Chart', href: '/organization/chart', icon: <Users size={18} /> },
      { label: 'Timeline', href: '/employee/timeline', icon: <GitBranch size={18} /> },
      { label: 'Goals & OKRs', href: '/employee/goals', icon: <Target size={18} />, feature: 'goals' },
      { label: 'Knowledge Base', href: '/employee/knowledge', icon: <BookOpen size={18} />, feature: 'knowledge_base' },
      { label: 'Surveys', href: '/employee/surveys', icon: <ClipboardList size={18} />, feature: 'surveys' },
      { label: 'Rewards', href: '/employee/rewards', icon: <Wallet size={18} /> },
      { label: 'Achievements', href: '/employee/achievements', icon: <Trophy size={18} /> },
    ],
  },
  {
    label: 'Projects',
    permission: 'project.read',
    items: [
      { label: 'Projects', href: '/employee/projects', icon: <FolderKanban size={18} />, permission: 'project.read' },
    ],
  },
  {
    label: 'Administration',
    permission: 'analytics.read',
    items: [
      { label: 'Analytics', href: '/admin', icon: <BarChart3 size={18} />, permission: 'analytics.read' },
      { label: 'HR Management', href: '/admin/hr', icon: <Users size={18} />, permission: 'employee.read' },
      { label: 'Payroll', href: '/admin/payroll', icon: <Banknote size={18} />, feature: 'payroll', permission: 'payroll.read' },
      { label: 'Workflows', href: '/admin/workflows', icon: <Workflow size={18} />, permission: 'settings.manage' },
      { label: 'Audit Logs', href: '/admin/audit', icon: <Shield size={18} />, permission: 'audit.read' },
      { label: 'Feature Flags', href: '/admin/features', icon: <ToggleLeft size={18} />, permission: 'feature.manage' },
      { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} />, permission: 'settings.manage' },
    ],
  },
  {
    label: 'Front Desk',
    items: [
      { label: 'Visitors', href: '/reception', icon: <UserPlus size={18} /> },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function DynamicSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { collapsed, setCollapsed } = React.useContext(SidebarContext)
  const { user, employee, logout } = useAuthStore()
  const { can, hasLoaded: permsLoaded } = usePermissionStore()
  const { isEnabled, hasLoaded: flagsLoaded } = useFeatureStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    logout()
    router.push('/login')
  }

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : user?.email || 'User'
  const initials = employee
    ? `${employee.firstName[0]}${employee.lastName[0]}`
    : (user?.email?.[0] || 'U').toUpperCase()
  const designation = employee?.designation || user?.role || 'Employee'

  // Filter nav items based on permissions + feature flags
  const visibleSections = NAVIGATION
    .filter((section) => {
      // If section has a permission, check it (but show while loading)
      if (section.permission && permsLoaded && !can(section.permission)) return false
      return true
    })
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        // Feature flag check
        if (item.feature && flagsLoaded && !isEnabled(item.feature)) return false
        // Permission check
        if (item.permission && permsLoaded && !can(item.permission)) return false
        return true
      }),
    }))
    .filter((section) => section.items.length > 0)

  return (
    <TooltipProvider>
      <Sidebar className="border-r border-border/40">
        <SidebarHeader>
          <div className="flex w-full flex-col gap-2">
            {/* Brand */}
            <div className="flex w-full items-center justify-between px-1">
              {!collapsed && (
                <Link href="/employee" className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight">
                  <Building2 className="text-primary w-6 h-6" />
                  SOMS
                </Link>
              )}
              {collapsed && (
                <div className="flex w-full justify-center">
                  <Building2 className="text-primary w-6 h-6" />
                </div>
              )}
            </div>

            {/* Org Switcher */}
            <OrgSwitcher collapsed={collapsed} />
          </div>
        </SidebarHeader>

        <SidebarContent>
          {visibleSections.map((section, sectionIndex) => (
            <React.Fragment key={section.label}>
              {sectionIndex > 0 && (
                <div className="px-3 my-1.5">
                  <Separator className="bg-border/40" />
                </div>
              )}
              {!collapsed && (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                    {section.label}
                  </span>
                </div>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/employee' && pathname.startsWith(`${item.href}/`))

                const button = (
                  <Link href={item.href} key={item.href} className="w-full">
                    <SidebarMenuButton
                      isActive={isActive}
                      icon={item.icon}
                      label={item.label}
                    />
                  </Link>
                )

                if (collapsed) {
                  return (
                    <Tooltip key={item.href} delayDuration={0}>
                      <TooltipTrigger asChild>{button}</TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-medium">
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return button
              })}
            </React.Fragment>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex flex-col gap-2">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-2'} pb-2 border-b border-border/40`}>
              {!collapsed && <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Profile</span>}
              <NotificationBell />
            </div>

            <Link
              href="/employee/profile"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer group"
            >
              <Avatar className="w-8 h-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                <AvatarImage src={employee?.avatarUrl || undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-medium truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">{designation as any}</span>
                </div>
              )}
            </Link>

            <SidebarMenuButton
              icon={<LogOut size={18} />}
              label="Sign Out"
              onClick={handleLogout}
            />

            <Button
              variant="ghost"
              size="sm"
              className="mt-1 w-full flex justify-center text-muted-foreground"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  )
}
