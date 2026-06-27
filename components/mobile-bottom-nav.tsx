"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  CalendarRange,
  Plus,
  User,
  BarChart3,
  Users,
  Banknote,
  MoreHorizontal,
  Clock,
  ListTodo,
  Coffee,
  Settings,
  Shield,
  FolderKanban,
  Package,
  Boxes,
  ToggleLeft,
  Workflow,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

// ─── Employee Quick Actions ─────────────────────────────────────────────────
const EMPLOYEE_QUICK_ACTIONS = [
  { label: 'Clock In / Out', icon: <Clock className="w-5 h-5" />, href: '/employee?tab=session', color: 'text-emerald-500' },
  { label: 'New Task', icon: <ListTodo className="w-5 h-5" />, href: '/employee?tab=tasks', color: 'text-blue-500' },
  { label: 'Apply Leave', icon: <Coffee className="w-5 h-5" />, href: '/employee?tab=leaves', color: 'text-amber-500' },
]

// ─── Admin Quick Actions ─────────────────────────────────────────────────────
const ADMIN_QUICK_ACTIONS = [
  { label: 'Add Employee', icon: <Users className="w-5 h-5" />, href: '/admin/hr', color: 'text-blue-500' },
  { label: 'Assign Task', icon: <CheckSquare className="w-5 h-5" />, href: '/admin/tasks', color: 'text-emerald-500' },
  { label: 'Run Payroll', icon: <Banknote className="w-5 h-5" />, href: '/admin/payroll', color: 'text-purple-500' },
]

// ─── Admin "More" Items ──────────────────────────────────────────────────────
const ADMIN_MORE_ITEMS = [
  { label: 'Projects', icon: <FolderKanban className="w-5 h-5" />, href: '/admin/projects' },
  { label: 'Assets', icon: <Package className="w-5 h-5" />, href: '/admin/assets' },
  { label: 'Consumables', icon: <Boxes className="w-5 h-5" />, href: '/admin/consumables' },
  { label: 'Workflows', icon: <Workflow className="w-5 h-5" />, href: '/admin/workflows' },
  { label: 'Audit Logs', icon: <Shield className="w-5 h-5" />, href: '/admin/audit' },
  { label: 'Feature Flags', icon: <ToggleLeft className="w-5 h-5" />, href: '/admin/features' },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, href: '/admin/settings' },
]

function NavItem({
  href,
  icon,
  label,
  isActive,
}: {
  href: string
  icon: React.ReactNode
  label: string
  isActive: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative ${
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {isActive && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
      )}
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  )
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = searchParams?.get('tab') || 'overview'
  const [quickActionOpen, setQuickActionOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const isAdmin = pathname.startsWith('/admin')

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center h-16 relative">
          {isAdmin ? (
            <>
              <NavItem
                href="/admin"
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Overview"
                isActive={pathname === '/admin'}
              />
              <NavItem
                href="/admin/hr"
                icon={<Users className="w-5 h-5" />}
                label="HR"
                isActive={pathname.startsWith('/admin/hr')}
              />

              {/* Center FAB */}
              <div className="flex-1 flex justify-center -mt-7">
                <button
                  onClick={() => setQuickActionOpen(true)}
                  className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform ring-4 ring-background"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <NavItem
                href="/admin/payroll"
                icon={<Banknote className="w-5 h-5" />}
                label="Finance"
                isActive={pathname.startsWith('/admin/payroll')}
              />

              {/* More button */}
              <button
                onClick={() => setMoreOpen(true)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors ${
                  moreOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <MoreHorizontal className="w-5 h-5" />
                <span className="text-[10px] font-medium">More</span>
              </button>
            </>
          ) : (
            <>
              <NavItem
                href="/employee?tab=overview"
                icon={<LayoutDashboard className="w-5 h-5" />}
                label="Overview"
                isActive={pathname === '/employee' && activeTab === 'overview'}
              />
              <NavItem
                href="/employee?tab=tasks"
                icon={<CheckSquare className="w-5 h-5" />}
                label="Tasks"
                isActive={pathname === '/employee' && activeTab === 'tasks'}
              />

              {/* Center FAB */}
              <div className="flex-1 flex justify-center -mt-7">
                <button
                  onClick={() => setQuickActionOpen(true)}
                  className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform ring-4 ring-background"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              <NavItem
                href="/employee?tab=leaves"
                icon={<CalendarRange className="w-5 h-5" />}
                label="Calendar"
                isActive={pathname === '/employee' && activeTab === 'leaves'}
              />
              <NavItem
                href="/employee/profile"
                icon={<User className="w-5 h-5" />}
                label="Profile"
                isActive={pathname.startsWith('/employee/profile')}
              />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions Sheet */}
      <Sheet open={quickActionOpen} onOpenChange={setQuickActionOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">Quick Actions</SheetTitle>
            <SheetDescription className="text-left">Choose an action to get started</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3">
            {(isAdmin ? ADMIN_QUICK_ACTIONS : EMPLOYEE_QUICK_ACTIONS).map((action) => (
              <Link
                key={action.label}
                href={action.href}
                onClick={() => setQuickActionOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-secondary hover:bg-accent transition-colors border border-border/30"
              >
                <div className={`w-12 h-12 rounded-full bg-background flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <span className="text-xs font-semibold text-center leading-tight">{action.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Admin "More" Sheet */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">More Modules</SheetTitle>
            <SheetDescription className="text-left">Access all admin modules</SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-3">
            {ADMIN_MORE_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMoreOpen(false)}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface-secondary hover:bg-accent transition-colors border border-border/30"
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-muted-foreground">
                  {item.icon}
                </div>
                <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
