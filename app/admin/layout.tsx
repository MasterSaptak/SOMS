"use client"

import React, { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutManager } from "@/components/layout/layout-manager"
import { NavigationSystem } from "@/components/layout/navigation-system"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { NotificationCenter } from "@/components/notification-center"
import { ActionRegistry } from "@/components/layout/action-registry"
import {
  Menu,
  MoreVertical,
  RefreshCw,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react"
import { useThemeStore } from "@/store/use-theme-store"
import { AppUpdater } from "@/components/app-updater"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Sheet,
  SheetContent,
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
              <header className="h-14 border-b border-border/30 bg-surface-primary/80 backdrop-blur-xl flex items-center justify-between px-3 md:px-6 shrink-0 z-20 pt-[env(safe-area-inset-top)]">
                {/* Left: Hamburger (mobile) + Breadcrumbs (desktop) */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 -ml-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Open navigation"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-semibold md:hidden text-foreground">Admin Portal</span>
                  <div className="hidden md:block">
                    <Breadcrumbs />
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1 md:gap-2">
                  <ActionRegistry />

                  {/* Always visible */}
                  <NotificationCenter />

                  {/* Mobile-only: Profile Menu */}
                  <div className="md:hidden flex items-center gap-2">
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Profile"
                    >
                      <User className="w-5 h-5" />
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
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
                        <AppUpdater asMenuItem />
                        <PwaInstallButton asMenuItem />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </header>

              {/* ─── Content Area ─── */}
              <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8 bg-surface-base">
                <div className="max-w-[1600px] mx-auto w-full">{children}</div>
              </div>
            </main>
          </div>

          {/* ─── Mobile Sidebar Sheet ─── */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[280px]">
              <AppSidebar />
            </SheetContent>
          </Sheet>
          </LayoutManager>
        </SidebarProvider>
      </AuthGuard>
    </ThemeProvider>
  )
}
