import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeavePolicy } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface PolicyState {
  policies: LeavePolicy[]
  loading: boolean
  initialized: boolean
  error?: string

  loadPolicies: () => Promise<void>
  refreshPolicies: () => Promise<void>
  clear: () => void

  getPoliciesForOrg: (orgId: string) => LeavePolicy[]
  addPolicy: (policy: Omit<LeavePolicy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updatePolicy: (id: string, updates: Partial<LeavePolicy>) => Promise<void>
}

export const usePolicyStore = create<PolicyState>()(
  persist(
    (set, get) => ({
      policies: [],
      loading: false,
      initialized: false,
      error: undefined,

      loadPolicies: async () => {
        if (get().initialized) return
        set({ loading: true, error: undefined })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('leave_policies' as any).select('*')
          if (error) throw error
          
          set({ 
            policies: data as any, 
            initialized: true, 
            loading: false 
          })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      refreshPolicies: async () => {
        set({ loading: true, error: undefined })
        try {
          const supabase = createClient()
          const { data, error } = await supabase.from('leave_policies' as any).select('*')
          if (error) throw error
          
          set({ 
            policies: data as any, 
            loading: false 
          })
        } catch (err: any) {
          set({ error: err.message, loading: false })
        }
      },

      clear: () => {
        set({
          policies: [],
          initialized: false,
          error: undefined,
          loading: false
        })
      },

      getPoliciesForOrg: (orgId: string) => get().policies.filter(p => p.organizationId === orgId),
      
      addPolicy: async (policy) => {
        const supabase = createClient()
        const { data, error } = await supabase.from('leave_policies' as any).insert([policy as any]).select().single()
        if (error) throw error
        set((state) => ({ policies: [...state.policies, data as any] }))
      },

      updatePolicy: async (id, updates) => {
        const supabase = createClient()
        const { data, error } = await supabase
            .from('leave_policies' as any)
            .update({ ...(updates as any), updated_at: new Date().toISOString() })
            .eq('id', id)
            .select().single()
        
        if (error) throw error
        set((state) => ({
          policies: state.policies.map(p => p.id === id ? (data as any) : p)
        }))
      }
    }),
    {
      name: 'soms-policy-storage',
      partialize: (state) => ({
          // Policies should be fetched from server
      }),
    }
  )
)
