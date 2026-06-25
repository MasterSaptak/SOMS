"use client"

import React, { useEffect, useState } from "react"
import { Command } from "cmdk"
import { Search, User, Building2, CheckSquare, FolderKanban, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:bg-accent transition-colors"
      >
        <Search size={16} />
        <span>Search...</span>
        <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-2xl bg-card border border-border rounded-xl shadow-2xl">
          <DialogTitle className="sr-only">Global Search</DialogTitle>
          <DialogDescription className="sr-only">Search employees, departments, tasks, and more.</DialogDescription>
          <Command className="flex flex-col h-[50vh] max-h-[400px] w-full bg-transparent">
            <div className="flex items-center border-b border-border px-4 py-3">
              <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
              <Command.Input 
                placeholder="Type a command or search..." 
                className="flex w-full bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            
            <Command.List className="flex-1 overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>
              
              <Command.Group heading="Workforce" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/admin/hr'))}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent aria-selected:bg-accent text-foreground"
                >
                  <User size={16} className="text-muted-foreground" />
                  Employees Directory
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/admin/settings/hr'))}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent aria-selected:bg-accent text-foreground"
                >
                  <Building2 size={16} className="text-muted-foreground" />
                  Departments & Structure
                </Command.Item>
              </Command.Group>
              
              <Command.Group heading="Operations" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/admin/tasks'))}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent aria-selected:bg-accent text-foreground"
                >
                  <CheckSquare size={16} className="text-muted-foreground" />
                  My Tasks
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/admin/projects'))}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent aria-selected:bg-accent text-foreground"
                >
                  <FolderKanban size={16} className="text-muted-foreground" />
                  Active Projects
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push('/admin/assets'))}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-accent aria-selected:bg-accent text-foreground"
                >
                  <Package size={16} className="text-muted-foreground" />
                  Inventory & Assets
                </Command.Item>
              </Command.Group>
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
