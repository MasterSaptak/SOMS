import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LeavePolicy } from '@/lib/types'

export const MOCK_LEAVE_POLICIES: LeavePolicy[] = [
  {
    id: 'pol-casual-01',
    organizationId: 'org-1',
    name: 'Standard Casual Leave',
    leaveType: 'casual',
    isPaid: true,
    maxDays: 2,
    requiresDocuments: false,
    halfDayAllowed: true,
    carryForwardDays: 0,
    approvalWorkflowType: 'standard', // submitted -> manager -> completed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-medical-01',
    organizationId: 'org-1',
    name: 'Standard Medical Leave',
    leaveType: 'medical',
    isPaid: true,
    maxDays: 2,
    requiresDocuments: true,
    halfDayAllowed: false,
    carryForwardDays: 0,
    approvalWorkflowType: 'strict', // submitted -> hr_verify -> manager -> completed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pol-emergency-01',
    organizationId: 'org-1',
    name: 'Emergency Leave',
    leaveType: 'emergency',
    isPaid: false,
    maxDays: 999, // practically unlimited but unpaid
    requiresDocuments: true,
    halfDayAllowed: false,
    carryForwardDays: 0,
    approvalWorkflowType: 'strict', // submitted -> hr_verify -> manager -> payroll -> completed
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

interface PolicyState {
  policies: LeavePolicy[]
  getPoliciesForOrg: (orgId: string) => LeavePolicy[]
  addPolicy: (policy: LeavePolicy) => void
  updatePolicy: (id: string, updates: Partial<LeavePolicy>) => void
}

export const usePolicyStore = create<PolicyState>()(
  persist(
    (set, get) => ({
      policies: [...MOCK_LEAVE_POLICIES],
      getPoliciesForOrg: (orgId: string) => get().policies.filter(p => p.organizationId === orgId),
      addPolicy: (policy) => set((state) => ({ policies: [...state.policies, policy] })),
      updatePolicy: (id, updates) => set((state) => ({
        policies: state.policies.map(p => p.id === id ? { ...p, ...updates } : p)
      }))
    }),
    {
      name: 'soms-policy-storage',
    }
  )
)
