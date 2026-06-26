"use client"

import React from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutManager } from "@/components/layout/layout-manager"
import { NavigationSystem } from "@/components/layout/navigation-system"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { NotificationCenter } from "@/components/notification-center"
import { UniversalSearch } from "@/components/universal-search"
import { QueueViewer } from "@/components/queue-viewer"
import { PullToRefresh } from "@/components/gesture/pull-to-refresh"
import { Sun, Moon, LayoutDashboard, Clock, CheckSquare, CalendarRange } from "lucide-react"
import { useThemeStore } from "@/store/use-theme-store"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

const TABS = [
  { label: 'Overview', href: '/employee?tab=overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { label: 'Work Session', href: '/employee?tab=session', icon: <Clock className="w-4 h-4" /> },
  { label: 'Tasks', href: '/employee?tab=tasks', icon: <CheckSquare className="w-4 h-4" /> },
  { label: 'Leave and Attendence Calender', href: '/employee?tab=leaves', icon: <Sun className="w-4 h-4" /> },
]

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  )
}

import { AppUpdater } from "@/components/app-updater"
import { useTransition, useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

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

  // Sync optimistic path when real path changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setOptimisticPath(searchParams?.get('tab') || 'overview')
  }, [searchParams])

  const handleTabClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const targetTab = new URL(href, window.location.origin).searchParams.get('tab') || 'overview'
    if (targetTab === activeTab) return
    
    // Instantly update the visual active state
    setOptimisticPath(targetTab)
    
    // Use regular router.push since it's just a shallow query update
    router.push(href)
  }

  return (
    <ThemeProvider>
      <AuthGuard>
        <SidebarProvider>
          <LayoutManager>
            <div className="flex w-full min-h-screen bg-surface-base">
              <NavigationSystem />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
              {/* Header */}
              <header className="h-14 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 shrink-0 z-20 pt-[env(safe-area-inset-top)]">
                <Breadcrumbs />
                
                <div className="flex items-center gap-2">
                   <QueueViewer />
                   <UniversalSearch />
                   <AppUpdater />
                   <ThemeToggle />
                   <NotificationCenter />
                </div>
              </header>
              
              {/* Employee Tabs Navigation (Optimized for Mobile & Fast Switching) */}
              <div className="flex border-b border-border/40 bg-surface-base px-4 md:px-6 shrink-0 z-10 gap-2 md:gap-6 overflow-x-auto hide-scrollbar scroll-smooth">
                {TABS.map(tab => {
                  const tabParam = new URL(tab.href, 'http://localhost').searchParams.get('tab') || 'overview'
                  const isActive = optimisticPath === tabParam;
                  return (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      onClick={(e) => handleTabClick(e, tab.href)}
                      className={`flex items-center gap-2 py-3 px-2 md:px-0 text-sm font-semibold border-b-2 transition-all whitespace-nowrap relative ${
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
              
              <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
                <PullToRefresh 
                  onRefresh={async () => {
                    // Use Next.js router refresh to refetch server data without full page reload
                    router.refresh()
                  }}
                  className="p-6 md:p-8 pb-24 md:pb-8"
                >
                  <div className="max-w-7xl mx-auto w-full pb-6">
                    {children}
                  </div>
                </PullToRefresh>
              </div>
            </main>
          </div>
          </LayoutManager>
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
