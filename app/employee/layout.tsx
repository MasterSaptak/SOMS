"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutManager, useLayoutManager } from "@/components/layout/layout-manager"
import { NavigationSystem } from "@/components/layout/navigation-system"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { NotificationCenter } from "@/components/notification-center"
import { UniversalSearch } from "@/components/universal-search"
import { QueueViewer } from "@/components/queue-viewer"
import { PullToRefresh } from "@/components/gesture/pull-to-refresh"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Sun,
  Moon,
  LayoutDashboard,
  Clock,
  CheckSquare,
  CalendarRange,
  Menu,
  MoreVertical,
  RefreshCw,
  Download,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react"
import { useThemeStore } from "@/store/use-theme-store"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { AppUpdater } from "@/components/app-updater"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { useTransition, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/store/use-auth-store"
import { createClient } from "@/lib/supabase/client"

const TABS = [
  { label: 'Overview', tab: 'overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Session', tab: 'session', icon: <Clock className="w-4 h-4" /> },
  { label: 'Tasks', tab: 'tasks', icon: <CheckSquare className="w-4 h-4" /> },
  { label: 'Leave', tab: 'leaves', icon: <CalendarRange className="w-4 h-4" /> },
  { label: 'Payroll', tab: 'payroll', icon: <Wallet className="w-4 h-4" /> },
]

function EmployeeLayoutInner({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams?.get('tab') || 'overview'
  const [optimisticPath, setOptimisticPath] = useState(activeTab)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, toggleTheme } = useThemeStore()
  const { logout } = useAuthStore()

  // Sync optimistic path when real path changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setOptimisticPath(searchParams?.get('tab') || 'overview')
  }, [searchParams])

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, tab: string) => {
    e.preventDefault()
    if (tab === activeTab) return
    setOptimisticPath(tab)
    router.push(`/employee?tab=${tab}`)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    logout()
    router.push('/login')
  }

  return (
    <ThemeProvider>
      <AuthGuard>
        <SidebarProvider>
          <LayoutManager>
            <div className="flex w-full min-h-screen bg-surface-base">
              <NavigationSystem />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
              {/* ─── Mobile-First Header ─── */}
              <header className="h-14 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 shrink-0 z-20 pt-[env(safe-area-inset-top)]">
                {/* Left: Hamburger (mobile) + Breadcrumbs (desktop) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 -ml-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open navigation"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-semibold md:hidden text-foreground">Employee Portal</span>
                  <div className="hidden md:block">
                    <Breadcrumbs />
                  </div>
                </div>
                
                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                  {/* Desktop-only actions */}
                  <div className="hidden md:flex items-center gap-2">
                    <QueueViewer />
                    <UniversalSearch />
                    <PwaInstallButton />
                    <AppUpdater />
                    <button
                      onClick={toggleTheme}
                      className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Toggle theme"
                    >
                      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Always visible */}
                  <NotificationCenter />
                  
                  {/* Mobile-only: Profile Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="md:hidden p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="More options"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => router.refresh()}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="w-4 h-4 mr-2" />
                        Install App
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/employee/profile')}>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </header>
              
              {/* ─── Scrollable Tabs ─── */}
              {pathname === '/employee' && (
                <div className="flex border-b border-border/40 bg-surface-base shrink-0 z-10 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory">
                  <div className="flex px-3 md:px-6 gap-0 md:gap-4 min-w-max">
                    {TABS.map(tab => {
                      const isActive = optimisticPath === tab.tab;
                      return (
                        <Link
                          key={tab.tab}
                          href={`/employee?tab=${tab.tab}`}
                          onClick={(e) => handleTabClick(e, tab.tab)}
                          className={`flex items-center gap-1.5 py-3 px-3 md:px-2 text-xs md:text-sm font-semibold border-b-2 transition-all whitespace-nowrap snap-start relative ${
                            isActive 
                              ? 'border-primary text-primary' 
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        >
                          {tab.icon}
                          {tab.label}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* ─── Content Area ─── */}
              <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                <PullToRefresh 
                  onRefresh={async () => {
                    router.refresh()
                  }}
                  className="p-4 md:p-6 lg:p-8 pb-24 md:pb-8"
                >
                  <div className="max-w-7xl mx-auto w-full pb-6">
                    {children}
                  </div>
                </PullToRefresh>
              </div>
            </main>
          </div>
          </LayoutManager>

          {/* ─── Mobile Sidebar Sheet ─── */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[280px]">
              <AppSidebar />
            </SheetContent>
          </Sheet>
        </SidebarProvider>
      </AuthGuard>
    </ThemeProvider>
  )
}

export default function EmployeeLayout(props: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>}>
      <EmployeeLayoutInner {...props} />
    </React.Suspense>
  )
}
