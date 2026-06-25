"use client"

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  LayoutDashboard, 
  Clock, 
  CalendarRange, 
  CheckSquare, 
  Trophy, 
  Wallet,
  Activity,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Monitor,
  DoorOpen,
  Megaphone,
  BarChart3,
  Users,
  Banknote,
  UserPlus,
  Brain,
  CalendarDays,
  GitBranch,
  FileText,
  Target,
  MessageSquare,
  Video,
  BookOpen,
  ClipboardList,
  Workflow,
  Shield,
  ToggleLeft,
  Server,
  Sparkles,
  GitMerge,
  Package,
  Boxes,
  Settings2,
  FolderKanban,
  Home,
} from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuButton, SidebarContext } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/use-auth-store';
import { getAccessibleNavSections } from '@/lib/permissions';
import { ROLES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Home:            <Home size={18} />,
  Clock:           <Clock size={18} />,
  Activity:        <Activity size={18} />,
  Brain:           <Brain size={18} />,
  CheckSquare:     <CheckSquare size={18} />,
  CalendarRange:   <CalendarRange size={18} />,
  Monitor:         <Monitor size={18} />,
  DoorOpen:        <DoorOpen size={18} />,
  Megaphone:       <Megaphone size={18} />,
  Wallet:          <Wallet size={18} />,
  Trophy:          <Trophy size={18} />,
  BarChart3:       <BarChart3 size={18} />,
  Users:           <Users size={18} />,
  Banknote:        <Banknote size={18} />,
  UserPlus:        <UserPlus size={18} />,
  CalendarDays:    <CalendarDays size={18} />,
  GitBranch:       <GitBranch size={18} />,
  FileText:        <FileText size={18} />,
  Target:          <Target size={18} />,
  MessageSquare:   <MessageSquare size={18} />,
  Video:           <Video size={18} />,
  BookOpen:        <BookOpen size={18} />,
  ClipboardList:   <ClipboardList size={18} />,
  Workflow:        <Workflow size={18} />,
  Shield:          <Shield size={18} />,
  ToggleLeft:      <ToggleLeft size={18} />,
  Server:          <Server size={18} />,
  Sparkles:        <Sparkles size={18} />,
  GitMerge:        <GitMerge size={18} />,
  Package:         <Package size={18} />,
  Boxes:           <Boxes size={18} />,
  Building2:       <Building2 size={18} />,
  Settings2:       <Settings2 size={18} />,
  FolderKanban:    <FolderKanban size={18} />,
}

const NAV_SECTIONS = {
  employee: {
    label: 'Workspace',
    groups: [
      {
        label: null,
        items: [
          { label: 'Employee Dashboard', href: '/employee', icon: 'Home' },
        ],
      },
    ],
  },
  admin: {
    label: 'Administration',
    groups: [
      {
        label: null,
        items: [
          { label: 'Admin Dashboard', href: '/admin', icon: 'Shield' },
        ],
      },
      {
        label: null,
        items: [
          { label: 'Workforce',   href: '/admin/hr',         icon: 'Users' },
        ],
      },
      {
        label: 'Work',
        items: [
          { label: 'Tasks',   href: '/admin/tasks',   icon: 'CheckSquare' },
          { label: 'Projects', href: '/admin/projects', icon: 'FolderKanban' },
          { label: 'Approvals', href: '/admin/approvals', icon: 'CheckSquare' },
        ],
      },
      {
        label: 'Finance',
        items: [
          { label: 'Payroll', href: '/admin/payroll', icon: 'Banknote' },
          { label: 'Expenses', href: '/admin/expenses', icon: 'Wallet' },
        ],
      },
      {
        label: 'Inventory',
        items: [
          { label: 'Assets',  href: '/admin/assets',  icon: 'Package' },
          { label: 'Consumables', href: '/admin/consumables', icon: 'Boxes' },
        ],
      },
      {
        label: null,
        items: [
          { label: 'Settings', href: '/admin/settings', icon: 'Settings2' },
        ],
      },
    ],
  },
  reception: {
    label: 'Front Desk',
    groups: [
      {
        label: null,
        items: [
          { label: 'Visitors', href: '/reception', icon: 'UserPlus' },
        ],
      },
    ],
  },
} as const

type NavItem = {
  label: string
  href: string
  icon: string
  highlight?: boolean
}

export function AppSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { collapsed, setCollapsed } = React.useContext(SidebarContext);
  const { user, employee, logout }  = useAuthStore();

  const role              = (user?.role as any) || 'employee';
  const accessibleSections = getAccessibleNavSections(role);
  const roleConfig        = ROLES[role as keyof typeof ROLES];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    logout();
    router.push('/login');
  };

  const displayName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : user?.email || 'User';
  const initials = employee
    ? `${employee.firstName[0]}${employee.lastName[0]}`
    : (user?.email?.[0] || 'U').toUpperCase();
  const designation = (employee as any)?.designation || roleConfig.label;

  return (
    <Sidebar className="border-r border-border/40">
      {/* ── Header ── */}
      <SidebarHeader>
        <div className="flex w-full items-center justify-between">
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
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        {accessibleSections.map((sectionKey, sectionIndex) => {
          const section = NAV_SECTIONS[sectionKey as keyof typeof NAV_SECTIONS];
          if (!section) return null;

          return (
            <React.Fragment key={sectionKey}>
              {sectionIndex > 0 && (
                <div className="px-3 my-2">
                  <Separator />
                </div>
              )}
              {section.groups.map((group, groupIndex) => (
                <React.Fragment key={group.label ?? `group-${groupIndex}`}>
                  {!collapsed && group.label && (
                    <div className={`px-3 ${groupIndex === 0 ? 'pt-2' : 'pt-4'} pb-1`}>
                      <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        {group.label}
                      </span>
                    </div>
                  )}
                  {collapsed && group.label && groupIndex > 0 && (
                    <div className="px-3 my-1">
                      <Separator className="opacity-30" />
                    </div>
                  )}
                  {(group.items as readonly NavItem[]).map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/employee' && item.href !== '/admin' && pathname.startsWith(`${item.href}/`)) ||
                      (item.href === '/admin' && pathname === '/admin');
                    const isHighlight = 'highlight' in item && item.highlight;

                    return (
                      <Link href={item.href} key={item.href} className="w-full">
                        <div
                          className={`
                            flex items-center gap-3 px-3 py-2 mx-2 rounded-lg transition-colors cursor-pointer
                            ${isActive
                              ? 'bg-accent/80 text-foreground font-medium shadow-sm ring-1 ring-border/50'
                              : isHighlight
                                ? 'text-primary hover:bg-primary/10 font-medium'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }
                          `}
                        >
                          <span className="shrink-0">
                            {iconMap[item.icon] || <LayoutDashboard size={18} />}
                          </span>
                          {!collapsed && (
                            <span className="text-sm truncate flex-1">{item.label}</span>
                          )}
                          {!collapsed && isHighlight && !isActive && (
                            <Badge className="ml-auto text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">
                              AI
                            </Badge>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </React.Fragment>
              ))}
            </React.Fragment>
          );
        })}
      </SidebarContent>

      {/* ── Footer ── */}
      <SidebarFooter>
        <div className="flex flex-col gap-2">
          {!collapsed && (
            <div className="flex flex-col p-3 mb-2 rounded-xl bg-card border border-border/50">
              <div className="text-xs font-semibold text-muted-foreground uppercase mb-1">Productivity Score</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-primary">85</span>
                <span className="text-xs text-muted-foreground mb-1">/ 100</span>
              </div>
            </div>
          )}

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
                <span className="text-xs text-muted-foreground truncate">{designation}</span>
              </div>
            )}
          </Link>

          <div
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 mx-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full flex justify-center text-muted-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
