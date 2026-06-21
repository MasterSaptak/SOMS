"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Task, TaskStatus, TaskPriority, TaskComment } from '@/lib/types'
import { MOCK_TASKS } from '@/lib/demo/generators/legacy-mock-data'

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

  // View
  setView: (view: 'kanban' | 'list') => void

  // Filters
  setFilter: <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => void
  resetFilters: () => void

  // CRUD
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, newStatus: TaskStatus) => void

  // Comments
  addComment: (comment: Omit<TaskComment, 'id' | 'createdAt'>) => void

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
      tasks: MOCK_TASKS,
      filters: defaultFilters,
      view: 'kanban',
      comments: [
        { id: 'tc1', taskId: 't1', authorId: 'e4', content: 'Please prioritize the color palette updates first.', createdAt: '2026-06-16T10:00:00Z' },
        { id: 'tc2', taskId: 't1', authorId: 'e3', content: 'Working on it. Will share the updated tokens by EOD.', createdAt: '2026-06-16T14:00:00Z' },
        { id: 'tc3', taskId: 't4', authorId: 'e5', content: 'Make sure to cover the edge cases for pagination.', createdAt: '2026-06-15T09:00:00Z' },
        { id: 'tc4', taskId: 't6', authorId: 'e8', content: 'Blocked on schema approval from the DBA team.', createdAt: '2026-06-16T11:00:00Z' },
      ],

      setView: (view) => set({ view }),

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: `t${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ tasks: [newTask, ...state.tasks] }))
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }))
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }))
      },

      moveTask: (id, newStatus) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status: newStatus,
                  updatedAt: new Date().toISOString(),
                  completedAt: newStatus === 'completed' ? new Date().toISOString() : t.completedAt,
                }
              : t
          ),
        }))
      },

      addComment: (comment) => {
        const newComment: TaskComment = {
          ...comment,
          id: `tc${Date.now()}`,
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ comments: [...state.comments, newComment] }))
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
        tasks: state.tasks,
        view: state.view,
        comments: state.comments,
      }),
    }
  )
)
