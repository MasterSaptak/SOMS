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

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <AuthGuard>
        <SidebarProvider>
          <div className="flex w-full min-h-screen bg-muted/20">
            <AppSidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
              {/* Header */}
              <header className="h-14 border-b border-border/40 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
                <Breadcrumbs />
                
                <div className="flex items-center gap-2">
                   <div className="relative hidden md:block">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                     <input 
                       type="text" 
                       placeholder="Search..." 
                       className="h-9 w-64 rounded-full border border-input bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                     />
                   </div>
                   <ThemeToggle />
                   <NotificationCenter />
                </div>
              </header>
              
              <div className="flex-1 overflow-auto p-6 md:p-8">
                <div className="max-w-7xl mx-auto w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </AuthGuard>
    </ThemeProvider>
  )
}
