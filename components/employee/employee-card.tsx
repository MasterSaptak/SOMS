import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Building2, Mail, Phone } from 'lucide-react'
import { getDesignationById, getDepartmentById, getWorkLocationById } from '@/lib/demo/generators/legacy-mock-data'
import type { Employee } from '@/lib/types'

interface EmployeeCardProps {
  employee: Employee
  onClick: () => void
}

export function EmployeeCard({ employee, onClick }: EmployeeCardProps) {
  const designation = getDesignationById(employee.designationId)
  const department = getDepartmentById(employee.departmentId)
  const location = getWorkLocationById(employee.workLocationId)

  const initials = `${employee.firstName[0]}${employee.lastName[0]}`
  
  let statusColor = 'bg-slate-500'
  if (employee.status === 'active') statusColor = 'bg-emerald-500'
  else if (employee.status === 'on_leave') statusColor = 'bg-amber-500'
  else if (employee.status === 'terminated') statusColor = 'bg-red-500'

  const joinDateStr = new Date(employee.joinDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

  return (
    <motion.div whileHover={{ y: -2 }} className="h-full">
      <Card 
        onClick={onClick}
        className="cursor-pointer border hover:border-primary/30 hover:shadow-md transition-all h-full"
      >
        <CardContent className="p-5 flex flex-col h-full">
          {/* Top part: Avatar, Name, Title, Actions */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
                  <AvatarImage src={employee.avatarUrl || undefined} alt={employee.firstName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${statusColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight">
                  {employee.firstName} {employee.lastName}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {designation?.title || 'No Designation'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                <Mail className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-colors">
                <Phone className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] bg-muted/30">
                {employee.employeeCode}
              </Badge>
              {department && (
                <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {department.name}
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom stats row */}
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">{location?.name || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Joined {joinDateStr}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
