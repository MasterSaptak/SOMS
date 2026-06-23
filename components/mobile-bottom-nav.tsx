"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Clock, CheckSquare, CalendarRange, Plus } from 'lucide-react'

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <>

      
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/40 pb-[env(safe-area-inset-bottom)] px-2">
        <div className="flex items-center justify-between h-16 relative px-2">
          
          {pathname.startsWith('/admin') ? (
            <>
              <Link href="/admin" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname === '/admin' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Overview</span>
              </Link>
              <Link href="/admin/hr" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname.startsWith('/admin/hr') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <CheckSquare className="w-5 h-5" />
                <span className="text-[10px] font-medium">HR</span>
              </Link>
              <div className="w-16 h-full flex justify-center -mt-8">
                <button className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <Link href="/admin/finance" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname.startsWith('/admin/finance') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-[10px] font-medium">Finance</span>
              </Link>
              <Link href="/admin/reports" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname.startsWith('/admin/reports') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <CalendarRange className="w-5 h-5" />
                <span className="text-[10px] font-medium">Reports</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/employee" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname === '/employee' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Overview</span>
              </Link>
              <Link href="/employee/session" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname === '/employee/session' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <Clock className="w-5 h-5" />
                <span className="text-[10px] font-medium">Session</span>
              </Link>
              <div className="w-16 h-full flex justify-center -mt-8">
                <button className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform">
                  <Plus className="w-6 h-6" />
                </button>
              </div>
              <Link href="/employee/tasks" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname === '/employee/tasks' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <CheckSquare className="w-5 h-5" />
                <span className="text-[10px] font-medium">Tasks</span>
              </Link>
              <Link href="/employee/leaves" className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${pathname === '/employee/leaves' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <CalendarRange className="w-5 h-5" />
                <span className="text-[10px] font-medium">Leaves</span>
              </Link>
            </>
          )}

        </div>
      </div>
    </>
  )
}
