"use client"

import React from 'react'
import { MoreVertical, Shield, ShieldOff, UserX } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function TeamMemberTable({ members, onRemove, onUpdateRole }: any) {
  if (!members || members.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-card">
        No members added to this team yet.
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground border-b">
          <tr>
            <th className="px-4 py-3 font-medium">Employee</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Joined</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member: any) => (
            <tr key={member.employee_id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={member.employees?.profile_photo || ''} />
                    <AvatarFallback>{member.employees?.full_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.employees?.full_name}
                      {member.is_primary && (
                        <span className="bg-primary/10 text-primary text-[10px] px-1.5 rounded uppercase tracking-wider font-semibold">Primary</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{member.employees?.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="capitalize">{member.team_member_roles?.name || 'Member'}</span>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(member.joined_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 hover:bg-muted rounded-md transition-colors">
                    <MoreVertical size={16} className="text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onUpdateRole(member.employee_id, 'Lead')}>
                      <Shield size={14} className="mr-2" /> Make Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateRole(member.employee_id, 'Member')}>
                      <ShieldOff size={14} className="mr-2" /> Make Standard Member
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:bg-destructive/10"
                      onClick={() => onRemove(member.employee_id)}
                    >
                      <UserX size={14} className="mr-2" /> Remove from Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
