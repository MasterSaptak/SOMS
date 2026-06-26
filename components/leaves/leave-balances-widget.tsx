"use client"

import React from 'react'
import { BentoGrid, BentoSlot } from '@/components/enterprise/bento-grid'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useLeaveStore } from '@/store/use-leave-store'
import { useAuthStore } from '@/store/use-auth-store'
import { LEAVE_TYPES } from '@/lib/constants'
import { Palmtree, Stethoscope, Siren, Info, UploadCloud } from 'lucide-react'

export function LeaveBalancesWidget() {
  const { employee } = useAuthStore()
  const { getForEmployee, getBalance } = useLeaveStore()

  const myLeaves = employee ? getForEmployee(employee.id) : []
  const balance = employee ? getBalance(employee.id) : { casual: 2, medical: 2, emergency: 0 }
  
  // Calculate stats
  const usedCasual = LEAVE_TYPES.casual.maxDays - balance.casual
  const usedMedical = LEAVE_TYPES.medical.maxDays - balance.medical
  const emergencyTaken = myLeaves.filter(l => l.leaveType === 'emergency').length
  const totalPaidUsed = usedCasual + usedMedical
  const totalPaidAllowed = LEAVE_TYPES.casual.maxDays + LEAVE_TYPES.medical.maxDays

  return (
    <BentoGrid className="grid-cols-1 md:grid-cols-4 auto-rows-[minmax(180px,auto)]">
      {/* Casual Leave */}
      <BentoSlot className="col-span-1 row-span-1">
        <div className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <Palmtree className="w-24 h-24 text-blue-500" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Palmtree className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-semibold text-sm">Casual Leave</span>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 text-[10px] uppercase">Paid</Badge>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold">{balance.casual}</span>
              <span className="text-sm font-medium text-muted-foreground">Remaining</span>
              <span className="text-xs text-muted-foreground ml-auto">{LEAVE_TYPES.casual.maxDays} Total</span>
            </div>
            <Progress value={(usedCasual / LEAVE_TYPES.casual.maxDays) * 100} className="h-1.5 [&>div]:bg-blue-500" />
            <p className="text-[10px] text-muted-foreground mt-3 line-clamp-1">For personal work, vacations or family events.</p>
          </div>
        </div>
      </BentoSlot>

      {/* Medical Leave */}
      <BentoSlot className="col-span-1 row-span-1">
          <div className="bg-card rounded-3xl border border-border/50 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <Stethoscope className="w-24 h-24 text-red-500" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-red-500" />
              </div>
              <span className="font-semibold text-sm">Medical Leave</span>
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 text-[10px] uppercase">Paid</Badge>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-bold">{balance.medical}</span>
              <span className="text-sm font-medium text-muted-foreground">Remaining</span>
              <span className="text-xs text-muted-foreground ml-auto">{LEAVE_TYPES.medical.maxDays} Total</span>
            </div>
            <Progress value={(usedMedical / LEAVE_TYPES.medical.maxDays) * 100} className="h-1.5 [&>div]:bg-red-500" />
            <p className="text-[10px] text-muted-foreground mt-3 line-clamp-1 flex items-center gap-1"><UploadCloud className="w-3 h-3"/> Documents required.</p>
          </div>
        </div>
      </BentoSlot>

      {/* Emergency Leave */}
      <BentoSlot className="col-span-1 row-span-1">
          <div className="bg-card rounded-3xl border border-amber-500/20 p-6 flex flex-col justify-between h-full relative overflow-hidden group shadow-sm hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <Siren className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Siren className="w-4 h-4 text-amber-500" />
              </div>
              <span className="font-semibold text-sm">Emergency</span>
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20 text-[10px] uppercase">Unpaid</Badge>
          </div>
          <div className="relative z-10 flex flex-col justify-end h-full mt-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-500">Unlimited</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-snug">For urgent personal or family emergencies.<br/>Approval Required.</p>
          </div>
        </div>
      </BentoSlot>

      {/* Summary Widget */}
      <BentoSlot className="col-span-1 row-span-1">
        <div className="bg-primary/5 rounded-3xl border border-primary/10 p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all">
          <h3 className="font-semibold text-sm mb-4 text-primary flex items-center gap-2">
            <Info className="w-4 h-4" /> Leave Summary
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm mt-auto">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Casual</span>
              <span className="font-medium">{balance.casual} / 2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Medical</span>
              <span className="font-medium">{balance.medical} / 2</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Paid Used</span>
              <span className="font-medium text-emerald-600">{totalPaidUsed} / {totalPaidAllowed}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] uppercase tracking-wider font-semibold">Emergency</span>
              <span className="font-medium text-amber-600">{emergencyTaken} Taken</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-primary/10 flex items-center justify-between text-[10px] font-semibold text-primary">
            <span>Monthly Utilization Trend</span>
            <span>{Math.round((totalPaidUsed / totalPaidAllowed) * 100)}%</span>
          </div>
        </div>
      </BentoSlot>
    </BentoGrid>
  )
}
