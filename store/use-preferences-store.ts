"use client"

import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import { useThemeStore } from '@/store/use-theme-store'

interface UserPreferences {
  theme?: string | null
  widget_order?: any[] | null
  quick_actions?: any[] | null
}

interface PreferencesState {
  preferences: UserPreferences | null
  isLoading: boolean
  
  loadPreferences: (employeeId: string) => Promise<void>
  updatePreferences: (employeeId: string, updates: Partial<UserPreferences>) => Promise<void>
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: null,
  isLoading: false,

  loadPreferences: async (employeeId) => {
    set({ isLoading: true })
    const supabase = createClient()
    
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('employee_id', employeeId)
        .single()
        
      if (data) {
        set({ preferences: data as any })
        
        // Sync theme with theme store if applicable
        if (data.theme) {
          useThemeStore.getState().setTheme(data.theme as 'light' | 'dark' | 'system')
        }
      } else if (error && error.code === 'PGRST116') {
        // No preferences exist yet
        set({ preferences: {} })
      }
    } catch (err) {
      console.error('Failed to load preferences', err)
    } finally {
      set({ isLoading: false })
    }
  },

  updatePreferences: async (employeeId, updates) => {
    const supabase = createClient()
    const { preferences } = get()
    
    // Optimistic update
    set({ preferences: { ...preferences, ...updates } })
    
    try {
      const { data: existing } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('employee_id', employeeId)
        .single()

      if (existing) {
        await supabase
          .from('user_preferences')
          .update(updates)
          .eq('employee_id', employeeId)
      } else {
        await supabase
          .from('user_preferences')
          .insert({
            employee_id: employeeId,
            ...updates
          })
      }
    } catch (err) {
      console.error('Failed to update preferences', err)
      // Revert optimistic update
      set({ preferences })
    }
  }
}))
