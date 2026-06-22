"use client"

import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { ThemeProvider } from "@/components/theme-provider"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { NotificationCenter } from "@/components/notification-center"
import { Search, Sun, Moon } from "lucide-react"
import { useThemeStore } from "@/store/use-theme-store"

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" aria-label="Toggle theme">
      {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthGuard>
        <SidebarProvider>
          <div className="flex w-full min-h-screen surface-base">
            <AppSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
              <header className="h-14 border-b border-border/30 bg-surface-primary/80 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
                <Breadcrumbs />
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <NotificationCenter />
                </div>
              </header>
              <div className="flex-1 overflow-auto p-5 md:p-8 surface-base">
                <div className="max-w-[1600px] mx-auto w-full">{children}</div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </AuthGuard>
    </ThemeProvider>
  )
}
