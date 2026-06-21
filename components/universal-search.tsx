"use client"

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { useSearchStore, type SearchCategory } from '@/store/use-search-store'
import { Search, X, ArrowRight, Users, ListTodo, CalendarRange, Megaphone, DoorOpen, Monitor, Building2 } from 'lucide-react'

const CATEGORY_CONFIG: Record<SearchCategory, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: 'All', icon: <Search className="w-3.5 h-3.5" />, color: 'text-foreground' },
  employees: { label: 'Employees', icon: <Users className="w-3.5 h-3.5" />, color: 'text-blue-500' },
  tasks: { label: 'Tasks', icon: <ListTodo className="w-3.5 h-3.5" />, color: 'text-amber-500' },
  leaves: { label: 'Leaves', icon: <CalendarRange className="w-3.5 h-3.5" />, color: 'text-emerald-500' },
  announcements: { label: 'Announcements', icon: <Megaphone className="w-3.5 h-3.5" />, color: 'text-purple-500' },
  rooms: { label: 'Rooms', icon: <DoorOpen className="w-3.5 h-3.5" />, color: 'text-cyan-500' },
  assets: { label: 'Assets', icon: <Monitor className="w-3.5 h-3.5" />, color: 'text-orange-500' },
  departments: { label: 'Departments', icon: <Building2 className="w-3.5 h-3.5" />, color: 'text-pink-500' },
}

const CATEGORIES: SearchCategory[] = ['all', 'employees', 'tasks', 'leaves', 'announcements', 'rooms', 'assets', 'departments']

export function UniversalSearch() {
  const {
    query,
    category,
    results,
    isOpen,
    selectedIndex,
    setQuery,
    setCategory,
    openSearch,
    closeSearch,
    moveSelection,
    getSelectedResult,
    setSelectedIndex,
  } = useSearchStore()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Keyboard shortcut: Ctrl+K is handled by command palette
  // This search opens when clicking the search bar in the header

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Scroll selected item into view
  useEffect(() => {
    if (resultRefs.current[selectedIndex]) {
      resultRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      moveSelection('down')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      moveSelection('up')
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const result = getSelectedResult()
      if (result) {
        router.push(result.href)
        closeSearch()
      }
    } else if (e.key === 'Escape') {
      closeSearch()
    }
  }

  const navigateToResult = (href: string) => {
    router.push(href)
    closeSearch()
  }

  return (
    <>
      {/* Search Trigger (replaces the static search input in header) */}
      <button
        onClick={openSearch}
        className="relative hidden md:flex items-center h-9 w-64 rounded-full border border-input bg-background pl-9 pr-4 text-sm text-muted-foreground hover:border-primary/30 hover:bg-muted/50 transition-all"
      >
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <span>Search everything...</span>
        <kbd className="ml-auto text-[10px] font-mono bg-muted border border-border px-1.5 py-0.5 rounded">
          /
        </kbd>
      </button>

      {/* Slash key shortcut */}
      <SlashKeyListener onActivate={openSearch} isOpen={isOpen} />

      {/* Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeSearch}
            />

            {/* Search Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-2xl overflow-hidden"
              onKeyDown={handleKeyDown}
            >
              {/* Search Input */}
              <div className="flex items-center border-b border-border px-4 py-3.5 gap-3">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search employees, tasks, leaves, assets..."
                  className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground text-lg"
                  autoFocus
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 rounded-md hover:bg-muted text-muted-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-border overflow-x-auto scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const config = CATEGORY_CONFIG[cat]
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        category === cat
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {config.icon}
                      {config.label}
                    </button>
                  )
                })}
              </div>

              {/* Results */}
              <div className="max-h-[350px] overflow-y-auto p-2">
                {!query ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Start typing to search across your workspace
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No results found for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {results.map((result, index) => {
                      const config = CATEGORY_CONFIG[result.type]
                      return (
                        <button
                          key={`${result.type}-${result.id}`}
                          ref={(el) => { resultRefs.current[index] = el }}
                          onClick={() => navigateToResult(result.href)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                            selectedIndex === index
                              ? 'bg-muted text-foreground'
                              : 'text-muted-foreground hover:bg-muted/50'
                          }`}
                        >
                          <span className="text-lg shrink-0">{result.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">
                              {result.title}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {result.subtitle}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {result.meta && (
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm ${config.color} bg-current/10`}>
                                {result.meta}
                              </span>
                            )}
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm bg-muted ${config.color}`}>
                              {config.label}
                            </span>
                          </div>
                          {selectedIndex === index && (
                            <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-muted px-4 py-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  Use{' '}
                  <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px]">↑</kbd>
                  <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px]">↓</kbd>{' '}
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px]">Enter</kbd>{' '}
                  to open •{' '}
                  <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-[10px]">Esc</kbd>{' '}
                  to close
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

// Separate component to listen for "/" key without interfering with text inputs
function SlashKeyListener({ onActivate, isOpen }: { onActivate: () => void; isOpen: boolean }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen) return
      if (e.key === '/' && !isInputElement(e.target as HTMLElement)) {
        e.preventDefault()
        onActivate()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onActivate, isOpen])

  return null
}

function isInputElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || element.isContentEditable
}
