"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useThemeStore } from '@/store/use-theme-store'
import { useAuthStore } from '@/store/use-auth-store'
import {
  LayoutDashboard, ListTodo, CalendarClock, DoorOpen, MonitorSmartphone,
  LogOut, Sun, Moon, Search, Megaphone, Gift, Trophy, Users, Calculator
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useThemeStore()
  const { user, employee, logout } = useAuthStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pt-[10vh]">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            <Command
              className="w-full h-full flex flex-col"
              shouldFilter={true}
            >
              <div className="flex items-center border-b border-border px-4 py-3 gap-3">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg"
                />
              </div>

              <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </Command.Empty>

                {/* Dashboard & Productivity */}
                <Command.Group heading="Dashboard & Productivity" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mb-1">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push(user?.role.includes('admin') || user?.role === 'hr_manager' ? '/admin' : '/employee'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/tasks'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <ListTodo className="w-4 h-4" /> Tasks
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/analytics'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <Trophy className="w-4 h-4" /> AI Analytics
                  </Command.Item>
                </Command.Group>

                {/* HR & Support */}
                <Command.Group heading="HR & Support" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mt-3 [&_[cmdk-group-heading]]:mb-1">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/leaves'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <CalendarClock className="w-4 h-4" /> Leave Management
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/rooms'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <DoorOpen className="w-4 h-4" /> Meeting Rooms
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/assets'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <MonitorSmartphone className="w-4 h-4" /> Assets & Devices
                  </Command.Item>
                </Command.Group>

                {/* Company */}
                <Command.Group heading="Company" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mt-3 [&_[cmdk-group-heading]]:mb-1">
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/announcements'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <Megaphone className="w-4 h-4" /> Announcements
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/rewards'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <Gift className="w-4 h-4" /> Rewards & Store
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/achievements'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    <Trophy className="w-4 h-4" /> Achievements
                  </Command.Item>
                </Command.Group>

                {/* Admin specific */}
                {(user?.role === 'super_admin' || user?.role === 'hr_manager') && (
                  <Command.Group heading="Administration" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mt-3 [&_[cmdk-group-heading]]:mb-1">
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/hr'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                    >
                      <Users className="w-4 h-4" /> Employee Directory
                    </Command.Item>
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/payroll'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                    >
                      <Calculator className="w-4 h-4" /> Payroll Management
                    </Command.Item>
                  </Command.Group>
                )}

                {/* Settings & System */}
                <Command.Group heading="Settings" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mt-3 [&_[cmdk-group-heading]]:mb-1">
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      logout()
                      router.push('/login')
                    })}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-red-500/10 aria-selected:text-red-500 text-red-500 transition-colors text-sm mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
            
            <div className="bg-muted px-4 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">Use <kbd className="bg-background border border-border px-1.5 py-0.5 rounded ml-1 text-[10px]">↑</kbd><kbd className="bg-background border border-border px-1.5 py-0.5 rounded mr-1 text-[10px]">↓</kbd> to navigate</span>
              <span className="flex items-center gap-1">Press <kbd className="bg-background border border-border px-1.5 py-0.5 rounded mx-1 text-[10px]">Enter</kbd> to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
