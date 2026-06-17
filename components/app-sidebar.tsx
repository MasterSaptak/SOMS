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
} from 'lucide-react';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenuButton, SidebarContext } from '@/components/ui/sidebar';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/store/use-auth-store';
import { getAccessibleNavSections } from '@/lib/permissions';
import { ROLES } from '@/lib/constants';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard size={18} />,
  Clock: <Clock size={18} />,
  Activity: <Activity size={18} />,
  Brain: <Brain size={18} />,
  CheckSquare: <CheckSquare size={18} />,
  CalendarRange: <CalendarRange size={18} />,
  Monitor: <Monitor size={18} />,
  DoorOpen: <DoorOpen size={18} />,
  Megaphone: <Megaphone size={18} />,
  Wallet: <Wallet size={18} />,
  Trophy: <Trophy size={18} />,
  BarChart3: <BarChart3 size={18} />,
  Users: <Users size={18} />,
  Banknote: <Banknote size={18} />,
  UserPlus: <UserPlus size={18} />,
}

const NAV_SECTIONS = {
  employee: {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', href: '/employee', icon: 'LayoutDashboard' },
      { label: 'Work Session', href: '/employee/session', icon: 'Clock' },
      { label: 'Debt Recovery', href: '/employee/recovery', icon: 'Activity' },
      { label: 'AI Analytics', href: '/employee/analytics', icon: 'Brain' },
      { label: 'Tasks', href: '/employee/tasks', icon: 'CheckSquare' },
      { label: 'Leaves', href: '/employee/leaves', icon: 'CalendarRange' },
      { label: 'Assets', href: '/employee/assets', icon: 'Monitor' },
      { label: 'Meeting Rooms', href: '/employee/rooms', icon: 'DoorOpen' },
      { label: 'Announcements', href: '/employee/announcements', icon: 'Megaphone' },
      { label: 'Rewards', href: '/employee/rewards', icon: 'Wallet' },
      { label: 'Achievements', href: '/employee/achievements', icon: 'Trophy' },
    ],
  },
  admin: {
    label: 'Administration',
    items: [
      { label: 'Analytics', href: '/admin', icon: 'BarChart3' },
      { label: 'HR Management', href: '/admin/hr', icon: 'Users' },
      { label: 'Payroll', href: '/admin/payroll', icon: 'Banknote' },
    ],
  },
  reception: {
    label: 'Front Desk',
    items: [
      { label: 'Visitors', href: '/reception', icon: 'UserPlus' },
    ],
  },
} as const

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { collapsed, setCollapsed } = React.useContext(SidebarContext);
  const { user, employee, logout } = useAuthStore();

  const role = user?.role || 'employee';
  const accessibleSections = getAccessibleNavSections(role);
  const roleConfig = ROLES[role];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : user?.email || 'User';
  const initials = employee
    ? `${employee.firstName[0]}${employee.lastName[0]}`
    : (user?.email?.[0] || 'U').toUpperCase();
  const designation = employee?.designation || roleConfig.label;

  return (
    <Sidebar className="border-r border-border/40">
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
              {!collapsed && (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    {section.label}
                  </span>
                </div>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/employee' && pathname.startsWith(`${item.href}/`));
                return (
                  <Link href={item.href} key={item.href} className="w-full">
                    <SidebarMenuButton
                      isActive={isActive}
                      icon={iconMap[item.icon] || <LayoutDashboard size={18} />}
                      label={item.label}
                    />
                  </Link>
                );
              })}
            </React.Fragment>
          );
        })}
      </SidebarContent>

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
               <AvatarImage src={employee?.avatarUrl} />
               <AvatarFallback>{initials}</AvatarFallback>
             </Avatar>
             {!collapsed && (
                <div className="flex flex-col flex-1 overflow-hidden">
                  <span className="text-sm font-medium truncate">{displayName}</span>
                  <span className="text-xs text-muted-foreground truncate">{designation}</span>
                </div>
             )}
          </Link>
          
          <SidebarMenuButton
            icon={<LogOut size={18}/>}
            label="Sign Out"
            onClick={handleLogout}
          />
          
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
