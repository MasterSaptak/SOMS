"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskStatus, TaskPriority, TaskComment } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface TaskFilters {
  status: TaskStatus | 'all'
  priority: TaskPriority | 'all'
  assignee: string | 'all'
  search: string
}

interface TaskState {
  tasks: Task[]
  filters: TaskFilters
  view: 'kanban' | 'list'
  comments: TaskComment[]

  loading: boolean
  initialized: boolean
  error?: string

  // Actions
  loadTasks: () => Promise<void>
  refreshTasks: () => Promise<void>
  clear: () => void

  // View
  setView: (view: 'kanban' | 'list') => void

  // Filters
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  resetFilters: () => void

  // CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  moveTask: (id: string, newStatus: TaskStatus) => Promise<void>

  // Comments
  addComment: (comment: Omit<TaskComment, 'id' | 'createdAt'>) => Promise<void>

  // Computed
  getFilteredTasks: () => Task[]
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTaskById: (id: string) => Task | undefined
  getCommentsForTask: (taskId: string) => TaskComment[]
}

const defaultFilters: TaskFilters = {
  status: 'all',
  priority: 'all',
  assignee: 'all',
  search: '',
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      filters: defaultFilters,
      view: 'kanban',
      comments: [],

      loading: false,
      initialized: false,
      error: undefined,

      loadTasks: async () => {
        if (get().initialized) return
        set({ loading: true, error: undefined })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('tasks' as any).select('*')
          if (error) throw error
          
          set({ 
            tasks: (data as any[]) || [], 
            initialized: true, 
            loading: false 
          })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      refreshTasks: async () => {
        set({ loading: true, error: undefined })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('tasks' as any).select('*')
          if (error) throw error
          
          set({ 
            tasks: (data as any[]) || [], 
            loading: false 
          })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      clear: () => {
        set({
          tasks: [],
          comments: [],
          initialized: false,
          error: undefined,
          loading: false
        })
      },

      setView: (view) => set({ view }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      addTask: async (task) => {
        const supabase = createClient()
        // Optimistic update omitted to keep it simple, or we can just refetch
        const { data, error } = await supabase.from('tasks' as any).insert([task as any]).select().single()
        if (error) throw error
        set((state) => ({ tasks: [data as any, ...state.tasks] }))
      },

      updateTask: async (id, updates) => {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('tasks' as any)
          .update({ ...(updates as any), updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        
        if (error) throw error
        
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data as any : t)),
        }))
      },

      deleteTask: async (id) => {
        const supabase = createClient()
        const { error } = await supabase.from('tasks' as any).delete().eq('id', id)
        if (error) throw error
        
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))
      },

      moveTask: async (id, newStatus) => {
        const supabase = createClient()
        const updates: any = {
            status: newStatus,
            updated_at: new Date().toISOString()
        }
        if (newStatus === 'completed') {
            updates.completed_at = new Date().toISOString()
        }
        
        const { data, error } = await supabase
          .from('tasks' as any)
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? data as any : t)),
        }))
      },

      addComment: async (comment) => {
        const supabase = createClient()
        const { data, error } = await supabase.from('task_comments' as any).insert([comment as any]).select().single()
        if (error) throw error
        set((state) => ({ comments: [...state.comments, data as any] }))
      },

      getFilteredTasks: () => {
        const { tasks, filters } = get()
        return tasks.filter((task) => {
          if (filters.status !== 'all' && task.status !== filters.status) return false
          if (filters.priority !== 'all' && task.priority !== filters.priority) return false
          if (filters.assignee !== 'all' && task.assignedTo !== filters.assignee) return false
          if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
          return true
        })
      },

      getTasksByStatus: (status) => {
        return get().getFilteredTasks().filter((t) => t.status === status)
      },

      getTaskById: (id) => {
        return get().tasks.find((t) => t.id === id)
      },

      getCommentsForTask: (taskId) => {
        return get().comments.filter((c) => c.taskId === taskId)
      },
    }),
    {
      name: 'soms-tasks',
      partialize: (state) => ({
        view: state.view,
        // We do not persist tasks and comments anymore to ensure they are fetched from server
      }),
    }
  )
)
