"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '@/lib/types'
import { MOCK_LEAVES, MOCK_LEAVE_BALANCES } from '@/lib/mock-data'

interface LeaveState {
  leaves: LeaveRequest[]
  balances: Record<string, LeaveBalance>

  applyLeave: (leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'hrId'>) => void
  cancelLeave: (id: string) => void
  approveLeave: (id: string, approverId: string, level: 'manager' | 'hr') => void
  rejectLeave: (id: string) => void
  getForEmployee: (employeeId: string) => LeaveRequest[]
  getBalance: (employeeId: string) => LeaveBalance
  getPending: () => LeaveRequest[]
}

const DEFAULT_BALANCE: LeaveBalance = { casual: 12, medical: 6, emergency: 3, wfh: 999 }

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      leaves: MOCK_LEAVES,
      balances: MOCK_LEAVE_BALANCES,

      applyLeave: (leave) => {
        const newLeave: LeaveRequest = {
          ...leave,
          id: `l${Date.now()}`,
          status: 'pending',
          hrId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ leaves: [newLeave, ...state.leaves] }))
      },

      cancelLeave: (id) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, status: 'cancelled' as LeaveStatus, updatedAt: new Date().toISOString() } : l
          ),
        }))
      },

      approveLeave: (id, approverId, level) => {
        set((state) => ({
          leaves: state.leaves.map((l) => {
            if (l.id !== id) return l
            if (level === 'manager') {
              return { ...l, status: 'manager_approved' as LeaveStatus, managerId: approverId, updatedAt: new Date().toISOString() }
            }
            return { ...l, status: 'hr_approved' as LeaveStatus, hrId: approverId, updatedAt: new Date().toISOString() }
          }),
        }))
      },

      rejectLeave: (id) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, status: 'rejected' as LeaveStatus, updatedAt: new Date().toISOString() } : l
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
        return get().leaves.filter((l) => l.status === 'pending' || l.status === 'manager_approved')
      },
    }),
    {
      name: 'soms-leaves',
      partialize: (state) => ({
        leaves: state.leaves,
        balances: state.balances,
      }),
    }
  )
)
