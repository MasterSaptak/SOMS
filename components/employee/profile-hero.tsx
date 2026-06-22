import React from 'react'
import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Building2, Users, Phone, Edit, ChevronRight } from 'lucide-react'
import { 
  getDesignationById, 
  getDepartmentById, 
  getTeamById, 
  getWorkLocationById, 
  getManagerById, 
  getFullName 
} from '@/lib/demo/generators/legacy-mock-data'
import type { Employee } from '@/lib/types'

interface ProfileHeroProps {
  employee: Employee
  isAdminView?: boolean
  onEditClick?: () => void
}

export function ProfileHero({ employee, isAdminView, onEditClick }: ProfileHeroProps) {
  const designation = getDesignationById(employee.designationId)
  const department = getDepartmentById(employee.departmentId)
  const team = getTeamById(employee.teamId)
  const location = getWorkLocationById(employee.workLocationId)
  const manager = getManagerById(employee.managerId)

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`
  
  let statusColor = 'border-slate-500 bg-slate-500/10 text-slate-600'
  let ringColor = 'ring-slate-500'
  if (employee.status === 'active') {
    statusColor = 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
    ringColor = 'ring-emerald-500'
  } else if (employee.status === 'on_leave') {
    statusColor = 'border-amber-500 bg-amber-500/10 text-amber-600'
    ringColor = 'ring-amber-500'
  } else if (employee.status === 'terminated') {
    statusColor = 'border-red-500 bg-red-500/10 text-red-600'
    ringColor = 'ring-red-500'
  }

  const joinDateStr = new Date(employee.joinDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-border/50 shadow-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-card to-muted/30 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row gap-6 md:items-center">
            
            <div className="shrink-0">
              <Avatar className={`w-24 h-24 border-4 border-background ring-2 ring-offset-2 ring-offset-background ${ringColor}`}>
                <AvatarImage src={employee.avatarUrl || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{getFullName(employee)}</h2>
                  <div className="text-muted-foreground flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-medium text-foreground">{designation?.title || 'No Designation'}</span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5"/> {department?.name || 'No Dept'}</span>
                    {team && (
                      <>
                        <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5"/> {team.name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                  <div className="flex gap-2">
                    <Badge variant="outline" className={`capitalize ${statusColor}`}>
                      {employee.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="font-mono bg-muted/50">
                      {employee.employeeCode}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 h-8 mt-1" onClick={onEditClick}>
                    <Edit className="w-3.5 h-3.5" />
                    Edit Profile
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{location?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {joinDateStr}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phone}</span>
                </div>
              </div>

              {manager && (
                <div className="mt-2 pt-4 border-t border-border/40 flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Reports to:</span>
                  <div className="flex items-center gap-1.5 font-medium cursor-pointer hover:text-primary transition-colors">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={manager.avatarUrl} />
                      <AvatarFallback className="text-[8px] bg-primary/10">{manager.firstName[0]}{manager.lastName[0]}</AvatarFallback>
                    </Avatar>
                    <span>{getFullName(manager)}</span>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
