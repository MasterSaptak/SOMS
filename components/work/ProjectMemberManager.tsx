"use client"

import { useState, useEffect } from "react"
import { useOrganizationStore } from "@/store/use-organization-store"
import { useAuthStore } from "@/store/use-auth-store"
import { getEmployeesAction } from "@/app/actions/employee.actions"
import { addProjectMemberAction, removeProjectMemberAction, updateProjectMemberRoleAction } from "@/app/actions/project.actions"
import { ProjectWithDetails } from "@/lib/repositories/project.repository"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, UserPlus, X, Shield, ShieldAlert, ShieldCheck, User } from "lucide-react"

export function ProjectMemberManager({ project, onUpdate }: { project: ProjectWithDetails, onUpdate: () => void }) {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [selectedRole, setSelectedRole] = useState<string>("Member")

  const { activeOrganizationId } = useOrganizationStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (!activeOrganizationId) return
    const fetchEmployees = async () => {
      setLoading(true)
      const res = await getEmployeesAction(activeOrganizationId)
      if (res.success) {
        setEmployees(res.data)
      }
      setLoading(false)
    }
    fetchEmployees()
  }, [activeOrganizationId])

  const handleAddMember = async () => {
    if (!activeOrganizationId || !user?.id || !selectedEmployee) return
    setActionLoading('add')
    const res = await addProjectMemberAction(activeOrganizationId, project.id, selectedEmployee, selectedRole, user.id)
    if (res.success) {
      setSelectedEmployee("")
      setSelectedRole("Member")
      onUpdate()
    } else {
      alert("Failed to add member: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const handleRemoveMember = async (employeeId: string) => {
    if (!activeOrganizationId || !user?.id) return
    if (!confirm("Are you sure you want to remove this member?")) return
    setActionLoading(`remove-${employeeId}`)
    const res = await removeProjectMemberAction(activeOrganizationId, project.id, employeeId, user.id)
    if (res.success) {
      onUpdate()
    } else {
      alert("Failed to remove member: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const handleUpdateRole = async (employeeId: string, newRole: string) => {
    if (!activeOrganizationId || !user?.id) return
    setActionLoading(`role-${employeeId}`)
    const res = await updateProjectMemberRoleAction(activeOrganizationId, project.id, employeeId, newRole, user.id)
    if (res.success) {
      onUpdate()
    } else {
      alert("Failed to update role: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'Owner': return <ShieldAlert className="w-4 h-4 text-red-500" />
      case 'Manager': return <ShieldCheck className="w-4 h-4 text-blue-500" />
      case 'Observer': return <Shield className="w-4 h-4 text-slate-500" />
      default: return <User className="w-4 h-4 text-green-500" />
    }
  }

  const currentMemberIds = new Set(project.project_members?.map(m => m.employee_id) || [])
  const availableEmployees = employees.filter(e => !currentMemberIds.has(e.id))

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      <div className="flex items-end gap-4 p-4 border rounded-lg bg-card">
        <div className="space-y-2 flex-1">
          <label className="text-sm font-medium">Add Employee</label>
          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <SelectTrigger>
              <SelectValue placeholder="Select employee..." />
            </SelectTrigger>
            <SelectContent>
              {availableEmployees.map(emp => (
                <SelectItem key={emp.id} value={emp.id}>{emp.full_name}</SelectItem>
              ))}
              {availableEmployees.length === 0 && (
                <SelectItem value="none" disabled>No available employees</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 w-48">
          <label className="text-sm font-medium">Role</label>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Owner">Owner</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
              <SelectItem value="Observer">Observer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddMember} disabled={!selectedEmployee || actionLoading === 'add'}>
          {actionLoading === 'add' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
          Add Member
        </Button>
      </div>

      <div className="border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Project Role</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {project.project_members?.map((member) => (
              <TableRow key={member.employee_id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {member.employees?.full_name?.charAt(0) || '?'}
                  </div>
                  {member.employees?.full_name || 'Unknown'}
                </TableCell>
                <TableCell>
                  <Select 
                    value={member.role} 
                    onValueChange={(val) => handleUpdateRole(member.employee_id, val)}
                    disabled={actionLoading === `role-${member.employee_id}`}
                  >
                    <SelectTrigger className="w-32 h-8 border-transparent hover:border-input focus:border-input bg-transparent hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.role)}
                        <span>{member.role}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Observer">Observer</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleRemoveMember(member.employee_id)}
                    disabled={actionLoading === `remove-${member.employee_id}` || member.role === 'Owner'}
                  >
                    {actionLoading === `remove-${member.employee_id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!project.project_members || project.project_members.length === 0) && (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No members assigned to this project yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
