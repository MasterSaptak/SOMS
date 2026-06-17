"use client";

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type WorkSessionState = "idle" | "working" | "break"
export type BreakType = "lunch" | "food" | "personal" | "emergency" | null

interface AppState {
  // Session
  sessionState: WorkSessionState
  activeBreak: BreakType
  workStartTime: number | null  // timestamp in ms for persist compatibility
  breakStartTime: number | null
  totalWorkSeconds: number
  totalBreakSeconds: number
  sessionDate: string | null  // YYYY-MM-DD to reset on new day
  
  // Actions
  startWork: () => void
  endWork: () => void
  startBreak: (type: BreakType) => void
  endBreak: () => void
  tickSession: () => void
  resetIfNewDay: () => void
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sessionState: "idle",
      activeBreak: null,
      workStartTime: null,
      breakStartTime: null,
      totalWorkSeconds: 0,
      totalBreakSeconds: 0,
      sessionDate: null,
      
      startWork: () => {
        const today = getTodayString()
        set({ 
          sessionState: "working", 
          workStartTime: Date.now(), 
          activeBreak: null,
          sessionDate: today,
        })
      },
      
      endWork: () => {
        set({ 
          sessionState: "idle", 
          workStartTime: null, 
          breakStartTime: null,
          activeBreak: null,
        })
      },
      
      startBreak: (type) => {
        set({ sessionState: "break", activeBreak: type, breakStartTime: Date.now() })
      },
      
      endBreak: () => {
        set({ sessionState: "working", activeBreak: null, breakStartTime: null })
      },

      tickSession: () => {
        const state = get()
        if (state.sessionState === "working") {
          set({ totalWorkSeconds: state.totalWorkSeconds + 1 })
        } else if (state.sessionState === "break") {
          set({ totalBreakSeconds: state.totalBreakSeconds + 1 })
        }
      },

      resetIfNewDay: () => {
        const today = getTodayString()
        const state = get()
        if (state.sessionDate && state.sessionDate !== today) {
          set({
            sessionState: "idle",
            activeBreak: null,
            workStartTime: null,
            breakStartTime: null,
            totalWorkSeconds: 0,
            totalBreakSeconds: 0,
            sessionDate: today,
          })
        }
      },
    }),
    {
      name: 'soms-session',
      partialize: (state) => ({
        sessionState: state.sessionState,
        activeBreak: state.activeBreak,
        workStartTime: state.workStartTime,
        breakStartTime: state.breakStartTime,
        totalWorkSeconds: state.totalWorkSeconds,
        totalBreakSeconds: state.totalBreakSeconds,
        sessionDate: state.sessionDate,
      }),
    }
  )
)
