"use client"

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export type SearchCategory = 'all' | 'employees' | 'tasks' | 'leaves' | 'announcements' | 'rooms' | 'assets' | 'departments'

export interface SearchResult {
  id: string
  type: SearchCategory
  title: string
  subtitle: string
  href: string
  icon?: string
  meta?: string
}

interface SearchState {
  query: string
  category: SearchCategory
  results: SearchResult[]
  isOpen: boolean
  selectedIndex: number
  isLoading: boolean
  
  setQuery: (q: string) => void
  setCategory: (c: SearchCategory) => void
  openSearch: () => void
  closeSearch: () => void
  moveSelection: (dir: 'up' | 'down') => void
  getSelectedResult: () => SearchResult | null
  setSelectedIndex: (index: number) => void
  performSearch: (q: string, c: SearchCategory) => Promise<void>
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  category: 'all',
  results: [],
  isOpen: false,
  selectedIndex: 0,
  isLoading: false,

  setQuery: (q: string) => {
    set({ query: q, selectedIndex: 0 })
    get().performSearch(q, get().category)
  },

  setCategory: (c: SearchCategory) => {
    set({ category: c, selectedIndex: 0 })
    get().performSearch(get().query, c)
  },

  openSearch: () => set({ isOpen: true, query: '', results: [], selectedIndex: 0 }),
  
  closeSearch: () => set({ isOpen: false }),

  moveSelection: (dir: 'up' | 'down') => {
    const { selectedIndex, results } = get()
    if (results.length === 0) return
    
    if (dir === 'up') {
      set({ selectedIndex: selectedIndex > 0 ? selectedIndex - 1 : results.length - 1 })
    } else {
      set({ selectedIndex: selectedIndex < results.length - 1 ? selectedIndex + 1 : 0 })
    }
  },

  getSelectedResult: () => {
    const { selectedIndex, results } = get()
    return results[selectedIndex] || null
  },

  setSelectedIndex: (index: number) => set({ selectedIndex: index }),

  performSearch: async (q: string, c: SearchCategory) => {
    if (!q || q.length < 2) {
      set({ results: [], isLoading: false })
      return
    }

    set({ isLoading: true })
    const supabase = createClient()
    const results: SearchResult[] = []

    try {
      // 1. Search Employees
      if (c === 'all' || c === 'employees') {
        const { data: employees } = await supabase
          .from('employees')
          .select('id, full_name, designation')
          .ilike('full_name', `%${q}%`)
          .limit(3)

        if (employees) {
          employees.forEach(e => {
            results.push({
              id: e.id,
              type: 'employees',
              title: e.full_name,
              subtitle: (e.designation as string) || 'Employee',
              href: `/admin/hr/employees/${e.id}`,
              icon: '👤'
            })
          })
        }
      }

      // 2. Search Tasks
      if (c === 'all' || c === 'tasks') {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id, title, status')
          .ilike('title', `%${q}%`)
          .limit(3)

        if (tasks) {
          tasks.forEach(t => {
            results.push({
              id: t.id,
              type: 'tasks',
              title: t.title,
              subtitle: `Status: ${t.status}`,
              href: `/employee/tasks`,
              icon: '📋',
              meta: t.status || undefined
            })
          })
        }
      }

      // 3. Search Documents (we'll map to 'assets' or just not map if category isn't matching, let's say they map to 'assets' conceptually here)
      if (c === 'all' || c === 'assets') {
        const { data: docs } = await supabase
          .from('documents')
          .select('id, title, file_type')
          .ilike('title', `%${q}%`)
          .limit(3)

        if (docs) {
          docs.forEach(d => {
            results.push({
              id: d.id,
              type: 'assets',
              title: d.title,
              subtitle: `File: ${d.file_type}`,
              href: `/employee/documents`,
              icon: '📄'
            })
          })
        }
      }

      set({ results, isLoading: false })
    } catch (err) {
      console.error('Search failed', err)
      set({ isLoading: false })
    }
  }
}))
