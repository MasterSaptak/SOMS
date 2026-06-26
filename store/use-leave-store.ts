"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface LeaveState {
  leaves: LeaveRequest[]
  balances: Record<string, LeaveBalance>

  loading: boolean
  initialized: boolean
  error?: string

  loadLeaves: () => Promise<void>
  refreshLeaves: () => Promise<void>
  clear: () => void

  submitLeave: (leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'hrId' | 'verificationStatus' | 'payrollProcessed' | 'salaryDeducted'>) => Promise<void>
  cancelLeave: (id: string) => Promise<void>
  verifyHR: (id: string, hrId: string) => Promise<void>
  approveManager: (id: string, managerId: string) => Promise<void>
  processPayroll: (id: string) => Promise<void>
  rejectLeave: (id: string) => Promise<void>
  
  getForEmployee: (employeeId: string) => LeaveRequest[]
  getBalance: (employeeId: string) => LeaveBalance
  getPending: () => LeaveRequest[]
}

const DEFAULT_BALANCE: LeaveBalance = { casual: 0, medical: 0, emergency: 0 }

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      leaves: [],
      balances: {},

      loading: false,
      initialized: false,
      error: undefined,

      loadLeaves: async () => {
        if (get().initialized) return
        set({ loading: true, error: undefined })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('leaves' as any).select('*')
          if (error) throw error
          
          set({ 
            leaves: data as any, 
            initialized: true, 
            loading: false 
          })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      refreshLeaves: async () => {
        set({ loading: true, error: undefined })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('leaves' as any).select('*')
          if (error) throw error
          
          set({ 
            leaves: data as any, 
            loading: false 
          })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      clear: () => {
        set({
          leaves: [],
          balances: {},
          initialized: false,
          error: undefined,
          loading: false
        })
      },

      submitLeave: async (leave) => {
        const supabase = createClient()
        const newLeave = {
          ...leave,
          status: 'submitted',
          verificationStatus: 'pending',
          payrollProcessed: false,
          salaryDeducted: false,
        }
        
        const { data, error } = await supabase.from('leaves' as any).insert([newLeave]).select().single()
        if (error) throw error
        set((state) => ({ leaves: [data as any, ...state.leaves] }))
      },

      cancelLeave: async (id) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('leaves' as any)
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('id', id)
            .select().single()
        
        if (error) throw error
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? (data as any) : l
          ),
        }))
      },

      verifyHR: async (id, hrId) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('leaves' as any)
            .update({ 
                verificationStatus: 'verified', 
                status: 'hr_verification', 
                hrId, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .select().single()
        
        if (error) throw error
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? (data as any) : l
          ),
        }))
      },

      approveManager: async (id, managerId) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('leaves' as any)
            .update({ 
                status: 'manager_approval', 
                managerId, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .select().single()
        
        if (error) throw error
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? (data as any) : l
          ),
        }))
      },

      processPayroll: async (id) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('leaves' as any)
            .update({ 
                status: 'payroll_processing', 
                payrollProcessed: true, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .select().single()
            
        if (error) throw error
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? (data as any) : l
          ),
        }))
      },

      rejectLeave: async (id) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('leaves' as any)
            .update({ 
                status: 'rejected', 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .select().single()
        
        if (error) throw error
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? (data as any) : l
          ),
        }))
      },

      getForEmployee: (employeeId) => {
        return get().leaves.filter((l) => l.employeeId === employeeId)
      },

      getBalance: (employeeId) => {
        return get().balances[employeeId] || DEFAULT_BALANCE
      },

      getPending: () => {
        return get().leaves.filter((l) => l.status === 'submitted' || l.status === 'hr_verification' || l.status === 'manager_approval' || l.status === 'pending' || l.status === 'manager_approved')
      },
    }),
    {
      name: 'soms-leaves',
      partialize: (state) => ({
          // We do not persist leaves so that they are fetched on reload
      }),
    }
  )
)
