"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'
import { MOCK_LEAVES, getEmployeeById, getFullName } from '@/lib/demo/generators/legacy-mock-data'
import Link from 'next/link'

export function PendingApprovalsWidget() {
  const [leaves, setLeaves] = useState(MOCK_LEAVES.filter(l => l.status === 'pending'))
  const [actioned, setActioned] = useState<Record<string, 'approved' | 'rejected'>>({})

  const handleAction = (id: string, action: 'approved' | 'rejected') => {
    setActioned(prev => ({ ...prev, [id]: action }))
    console.log(`[PendingApprovals] Leave ${id} marked as ${action}`)
    // In a real app, this would call an API, then we remove it from the list after a brief delay
    setTimeout(() => {
      setLeaves(prev => prev.filter(l => l.id !== id))
    }, 1000)
  }

  return (
    <Card className="h-full border-border/50 shadow-sm flex flex-col">
      <CardHeader className="bg-muted/20 border-b border-border/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pending Approvals</CardTitle>
          <Badge variant="secondary" className="font-normal text-xs">{leaves.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="flex flex-col divide-y divide-border/30">
          {leaves.map(leave => {
            const employee = getEmployeeById(leave.employeeId)
            const isActioned = !!actioned[leave.id]
            const actionType = actioned[leave.id]
            
            let typeColor = 'bg-slate-500/10 text-slate-600 border-slate-200'
            if (leave.leaveType === 'casual') typeColor = 'bg-blue-500/10 text-blue-600 border-blue-200'
            else if (leave.leaveType === 'medical') typeColor = 'bg-red-500/10 text-red-600 border-red-200'
            else if (leave.leaveType === 'emergency') typeColor = 'bg-amber-500/10 text-amber-600 border-amber-200'

            const startStr = new Date(leave.startDate).toLocaleDateString([], {month: 'short', day: 'numeric'})
            const endStr = new Date(leave.endDate).toLocaleDateString([], {month: 'short', day: 'numeric'})
            const dateDisplay = startStr === endStr ? startStr : `${startStr} - ${endStr}`

            return (
              <div key={leave.id} className={`p-4 transition-all duration-300 ${isActioned ? 'opacity-50 grayscale' : 'hover:bg-muted/30'}`}>
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                    <AvatarImage src={employee?.avatarUrl} />
                    <AvatarFallback className="text-[10px] bg-primary/10">
                      {employee ? `${employee.firstName[0]}${employee.lastName[0]}` : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="font-semibold text-sm truncate">
                        {employee ? getFullName(employee) : 'Unknown Employee'}
                      </div>
                      <Badge variant="outline" className={`text-[9px] capitalize shrink-0 ${typeColor}`}>
                        {leave.leaveType}
                      </Badge>
                    </div>
                    <div className="text-xs font-medium text-foreground mb-1">{dateDisplay}</div>
                    <div className={`text-xs text-muted-foreground line-clamp-1 ${isActioned ? 'line-through' : ''}`}>
                      {leave.reason}
                    </div>
                    
                    {!isActioned && (
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors" onClick={() => handleAction(leave.id, 'approved')}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1 border-red-500/30 hover:bg-red-500/10 hover:text-red-600 transition-colors" onClick={() => handleAction(leave.id, 'rejected')}>
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                    {isActioned && (
                      <div className={`mt-2 text-xs font-semibold ${actionType === 'approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {actionType === 'approved' ? 'Approved' : 'Rejected'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {leaves.length === 0 && (
            <div className="p-8 text-center flex flex-col items-center justify-center text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-20 text-emerald-500" />
              <p className="text-sm font-medium">All caught up!</p>
              <p className="text-xs mt-1">No pending approvals.</p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-0 border-t border-border/30 bg-muted/10">
        <Link href="/admin/leaves" className="w-full p-3 text-center text-xs font-medium text-primary hover:bg-muted/30 transition-colors flex items-center justify-center gap-1">
          View All Leave Requests <ArrowRight className="w-3 h-3" />
        </Link>
      </CardFooter>
    </Card>
  )
}
