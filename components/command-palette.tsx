"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Command } from 'cmdk'
import { useThemeStore } from '@/store/use-theme-store'
import { useAuthStore } from '@/store/use-auth-store'
import { useCopilotStore } from '@/store/use-copilot-store'
import { useSearchStore } from '@/store/use-search-store'
import {
  LayoutDashboard, ListTodo, CalendarClock, DoorOpen, MonitorSmartphone,
  LogOut, Sun, Moon, Search, Megaphone, Gift, Trophy, Users, Calculator,
  Sparkles, Brain, CalendarDays, FileText, Target, MessageSquare,
  BookOpen, ClipboardList, Shield, ToggleLeft, Workflow, GitBranch,
  Plus, PlusCircle, Video, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

const itemClass = "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-muted aria-selected:text-primary transition-colors text-sm"
const groupClass = "px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mb-1"
const groupClassMt = "px-2 py-1.5 text-xs font-semibold text-muted-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:mt-3 [&_[cmdk-group-heading]]:mb-1"

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { theme, setTheme } = useThemeStore()
  const { user, employee, logout } = useAuthStore()
  const { openPanel: openCopilot, sendMessage: sendCopilotMessage } = useCopilotStore()
  const { query, results, isLoading, setQuery } = useSearchStore()

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
                  value={query}
                  onValueChange={setQuery}
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg"
                />
              </div>

              <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  {isLoading ? 'Searching...' : 'No results found.'}
                </Command.Empty>

                {/* Dynamic Search Results */}
                {results.length > 0 && (
                  <Command.Group heading="Search Results" className={groupClass}>
                    {results.map((result) => (
                      <Command.Item
                        key={result.id}
                        value={result.title + result.subtitle}
                        onSelect={() => runCommand(() => router.push(result.href))}
                        className={itemClass}
                      >
                        <Search className="w-4 h-4 text-primary" /> 
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{result.title}</span>
                          <span className="text-[10px] text-muted-foreground">{result.subtitle} • {result.type}</span>
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {/* Quick Actions */}
                <Command.Group heading="Quick Actions" className={groupClass}>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/tasks?action=create'))}
                    className={itemClass}
                  >
                    <PlusCircle className="w-4 h-4 text-emerald-500" /> Create New Task
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/leaves?action=apply'))}
                    className={itemClass}
                  >
                    <Plus className="w-4 h-4 text-blue-500" /> Apply for Leave
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/rooms?action=book'))}
                    className={itemClass}
                  >
                    <DoorOpen className="w-4 h-4 text-cyan-500" /> Book Meeting Room
                  </Command.Item>
                </Command.Group>

                {/* AI Copilot */}
                <Command.Group heading="AI Copilot" className={groupClassMt}>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      openCopilot()
                    })}
                    className={itemClass}
                  >
                    <Sparkles className="w-4 h-4 text-violet-500" /> Open AI Copilot
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      openCopilot()
                      setTimeout(() => sendCopilotMessage('Summarize my day — tasks completed, hours worked, and pending items'), 300)
                    })}
                    className={itemClass}
                  >
                    <Brain className="w-4 h-4 text-violet-500" /> Summarize My Day
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => {
                      openCopilot()
                      setTimeout(() => sendCopilotMessage('Am I at risk of burnout? Check my work patterns.'), 300)
                    })}
                    className={itemClass}
                  >
                    <Zap className="w-4 h-4 text-amber-500" /> Burnout Check
                  </Command.Item>
                </Command.Group>

                {/* Dashboard & Productivity */}
                <Command.Group heading="Dashboard & Productivity" className={groupClassMt}>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push(user?.role.includes('admin') || user?.role === 'hr_manager' ? '/admin' : '/employee'))}
                    className={itemClass}
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/tasks'))}
                    className={itemClass}
                  >
                    <ListTodo className="w-4 h-4" /> Tasks
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/analytics'))}
                    className={itemClass}
                  >
                    <Brain className="w-4 h-4" /> AI Analytics
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/calendar'))}
                    className={itemClass}
                  >
                    <CalendarDays className="w-4 h-4" /> Calendar
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/goals'))}
                    className={itemClass}
                  >
                    <Target className="w-4 h-4" /> Goals & OKRs
                  </Command.Item>
                </Command.Group>

                {/* HR & Support */}
                <Command.Group heading="HR & Support" className={groupClassMt}>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/leaves'))}
                    className={itemClass}
                  >
                    <CalendarClock className="w-4 h-4" /> Leave Management
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/rooms'))}
                    className={itemClass}
                  >
                    <DoorOpen className="w-4 h-4" /> Meeting Rooms
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/assets'))}
                    className={itemClass}
                  >
                    <MonitorSmartphone className="w-4 h-4" /> Assets & Devices
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/documents'))}
                    className={itemClass}
                  >
                    <FileText className="w-4 h-4" /> Documents
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/timeline'))}
                    className={itemClass}
                  >
                    <GitBranch className="w-4 h-4" /> My Timeline
                  </Command.Item>
                </Command.Group>

                {/* Communication */}
                <Command.Group heading="Communication" className={groupClassMt}>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/chat'))}
                    className={itemClass}
                  >
                    <MessageSquare className="w-4 h-4" /> Chat
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/meetings'))}
                    className={itemClass}
                  >
                    <Video className="w-4 h-4" /> Meetings
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/announcements'))}
                    className={itemClass}
                  >
                    <Megaphone className="w-4 h-4" /> Announcements
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/knowledge'))}
                    className={itemClass}
                  >
                    <BookOpen className="w-4 h-4" /> Knowledge Base
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/surveys'))}
                    className={itemClass}
                  >
                    <ClipboardList className="w-4 h-4" /> Surveys
                  </Command.Item>
                </Command.Group>

                {/* Company */}
                <Command.Group heading="Rewards" className={groupClassMt}>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/rewards'))}
                    className={itemClass}
                  >
                    <Gift className="w-4 h-4" /> Rewards & Store
                  </Command.Item>
                  <Command.Item
                    onSelect={() => runCommand(() => router.push('/employee/achievements'))}
                    className={itemClass}
                  >
                    <Trophy className="w-4 h-4" /> Achievements
                  </Command.Item>
                </Command.Group>

                {/* Admin specific */}
                {(user?.role === 'super_admin' || user?.role === 'hr_manager') && (
                  <Command.Group heading="Administration" className={groupClassMt}>
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/hr'))}
                      className={itemClass}
                    >
                      <Users className="w-4 h-4" /> Employee Directory
                    </Command.Item>
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/payroll'))}
                      className={itemClass}
                    >
                      <Calculator className="w-4 h-4" /> Payroll Management
                    </Command.Item>
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/workflows'))}
                      className={itemClass}
                    >
                      <Workflow className="w-4 h-4" /> Workflows
                    </Command.Item>
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/audit'))}
                      className={itemClass}
                    >
                      <Shield className="w-4 h-4" /> Audit Logs
                    </Command.Item>
                    <Command.Item
                      onSelect={() => runCommand(() => router.push('/admin/features'))}
                      className={itemClass}
                    >
                      <ToggleLeft className="w-4 h-4" /> Feature Flags
                    </Command.Item>
                  </Command.Group>
                )}

                {/* Settings & System */}
                <Command.Group heading="Settings" className={groupClassMt}>
                  <Command.Item
                    onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                    className={itemClass}
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
