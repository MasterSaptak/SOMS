"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeaveRequest, LeaveBalance, LeaveType, LeaveStatus } from '@/lib/types'
import { MOCK_LEAVES, MOCK_LEAVE_BALANCES } from '@/lib/demo/generators/legacy-mock-data'

interface LeaveState {
  leaves: LeaveRequest[]
  balances: Record<string, LeaveBalance>

  submitLeave: (leave: Omit<LeaveRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'hrId' | 'verificationStatus' | 'payrollProcessed' | 'salaryDeducted'>) => void
  cancelLeave: (id: string) => void
  verifyHR: (id: string, hrId: string) => void
  approveManager: (id: string, managerId: string) => void
  processPayroll: (id: string) => void
  rejectLeave: (id: string) => void
  getForEmployee: (employeeId: string) => LeaveRequest[]
  getBalance: (employeeId: string) => LeaveBalance
  getPending: () => LeaveRequest[]
}

const DEFAULT_BALANCE: LeaveBalance = { casual: 2, medical: 2, emergency: 0 }

export const useLeaveStore = create<LeaveState>()(
  persist(
    (set, get) => ({
      leaves: MOCK_LEAVES,
      balances: MOCK_LEAVE_BALANCES,

      submitLeave: (leave) => {
        const newLeave: LeaveRequest = {
          ...leave,
          id: `l${Date.now()}`,
          status: 'submitted',
          hrId: null,
          verificationStatus: 'pending',
          payrollProcessed: false,
          salaryDeducted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ leaves: [newLeave, ...state.leaves] }))
        // Mocking an Audit Log entry creation
        console.log(`[Audit] Leave request submitted by ${leave.employeeId}`)
      },

      cancelLeave: (id) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, status: 'cancelled' as LeaveStatus, updatedAt: new Date().toISOString() } : l
          ),
        }))
      },

      verifyHR: (id, hrId) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, verificationStatus: 'verified', status: 'hr_verification' as LeaveStatus, hrId, updatedAt: new Date().toISOString() } : l
          ),
        }))
        console.log(`[Audit] Leave request ${id} verified by HR ${hrId}`)
      },

      approveManager: (id, managerId) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, status: 'manager_approval' as LeaveStatus, managerId, updatedAt: new Date().toISOString() } : l
          ),
        }))
        console.log(`[Audit] Leave request ${id} approved by Manager ${managerId}`)
      },

      processPayroll: (id) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, status: 'payroll_processing' as LeaveStatus, payrollProcessed: true, updatedAt: new Date().toISOString() } : l
          ),
        }))
        console.log(`[Audit] Leave request ${id} flagged for payroll processing`)
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
        return get().leaves.filter((l) => l.status === 'submitted' || l.status === 'hr_verification' || l.status === 'manager_approval' || l.status === 'pending' || l.status === 'manager_approved')
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
