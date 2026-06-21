"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, ChevronRight } from 'lucide-react'
import {
  getOrgChartData,
  getFullName,
  getDepartmentEmployees,
} from '@/lib/demo/generators/legacy-mock-data'
import type { Employee } from '@/lib/types'

const DEPT_COLORS = [
  'border-t-blue-500',
  'border-t-purple-500',
  'border-t-emerald-500',
  'border-t-amber-500',
  'border-t-rose-500',
]

const DEPT_ICON_COLORS = [
  'bg-blue-500/10 text-blue-500',
  'bg-purple-500/10 text-purple-500',
  'bg-emerald-500/10 text-emerald-500',
  'bg-amber-500/10 text-amber-500',
  'bg-rose-500/10 text-rose-500',
]

function MemberChip({ employee, onClick }: { employee: Employee; onClick: () => void }) {
  const initials = `${employee.firstName[0]}${employee.lastName[0]}`
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/60 hover:bg-primary/10 hover:text-primary transition-colors text-xs font-medium border border-border/30 hover:border-primary/20"
    >
      <Avatar className="w-5 h-5">
        <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
      </Avatar>
      <span className="truncate max-w-[80px]">{employee.firstName}</span>
    </button>
  )
}

export function OrgChartCanvas() {
  const router = useRouter()
  const chartData = getOrgChartData()

  const navigateToEmployee = (id: string) => {
    router.push(`/admin/hr/directory/${id}`)
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max p-2">
        {chartData.map((deptData, deptIndex) => {
          const colorClass    = DEPT_COLORS[deptIndex % DEPT_COLORS.length]
          const iconColorClass = DEPT_ICON_COLORS[deptIndex % DEPT_ICON_COLORS.length]
          const totalMembers  = getDepartmentEmployees(deptData.department.id).length

          return (
            <motion.div
              key={deptData.department.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: deptIndex * 0.08 }}
              className="flex flex-col items-center gap-0 min-w-[240px]"
            >
              {/* Department Card */}
              <div
                className={`w-full rounded-xl border-t-4 ${colorClass} bg-card border border-border/50 hover:border-primary/20 shadow-sm hover:shadow-md transition-all p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconColorClass}`}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{deptData.department.name}</p>
                    {deptData.head && (
                      <button
                        onClick={() => navigateToEmployee(deptData.head!.id)}
                        className="flex items-center gap-1.5 mt-1 hover:text-primary transition-colors"
                      >
                        <Avatar className="w-4 h-4">
                          <AvatarFallback className="text-[7px]">
                            {deptData.head.firstName[0]}{deptData.head.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground hover:text-primary truncate">
                          {getFullName(deptData.head)}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{totalMembers} members</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span>{deptData.teams.length} teams</span>
                  </div>
                </div>
              </div>

              {/* Connector line from dept to teams */}
              {(deptData.teams.length > 0 || deptData.directMembers.length > 0) && (
                <div className="w-0.5 h-5 bg-border/60" />
              )}

              {/* Teams */}
              {deptData.teams.length > 0 && (
                <div className="flex gap-4 items-start">
                  {deptData.teams.map((teamData, teamIndex) => {
                    const shownMembers = teamData.members.slice(0, 3)
                    const extraCount  = teamData.members.length - shownMembers.length

                    return (
                      <div key={teamData.team.id} className="flex flex-col items-center gap-0 min-w-[200px]">
                        {/* Horizontal connector */}
                        {deptData.teams.length > 1 && (
                          <div className="flex items-center w-full justify-center">
                            <div className="h-0.5 flex-1 bg-border/40" />
                            <div className="w-0.5 h-4 bg-border/60" />
                            <div className="h-0.5 flex-1 bg-border/40" />
                          </div>
                        )}
                        {deptData.teams.length === 1 && (
                          <div className="w-0.5 h-4 bg-border/60" />
                        )}

                        {/* Team Card */}
                        <div className="w-full rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 hover:border-primary/20 transition-all p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold truncate">{teamData.team.name}</span>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 shrink-0 ml-1">
                              {teamData.members.length}
                            </Badge>
                          </div>
                          {teamData.lead && (
                            <button
                              onClick={() => navigateToEmployee(teamData.lead!.id)}
                              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors mb-2"
                            >
                              <ChevronRight className="w-2.5 h-2.5" />
                              Lead: {teamData.lead.firstName} {teamData.lead.lastName}
                            </button>
                          )}
                          {/* Member chips */}
                          <div className="flex flex-wrap gap-1">
                            {shownMembers.map(member => (
                              <MemberChip
                                key={member.id}
                                employee={member}
                                onClick={() => navigateToEmployee(member.id)}
                              />
                            ))}
                            {extraCount > 0 && (
                              <span className="flex items-center px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground border border-border/30">
                                +{extraCount}
                              </span>
                            )}
                            {teamData.members.length === 0 && (
                              <span className="text-[10px] text-muted-foreground/60 italic">No members</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Direct members (not in any team) */}
              {deptData.directMembers.length > 0 && deptData.teams.length === 0 && (
                <div className="w-full rounded-lg border border-dashed border-border/40 p-3">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Direct Members</p>
                  <div className="flex flex-wrap gap-1">
                    {deptData.directMembers.map(member => (
                      <MemberChip
                        key={member.id}
                        employee={member}
                        onClick={() => navigateToEmployee(member.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
