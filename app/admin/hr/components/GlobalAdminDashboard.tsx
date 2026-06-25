'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MoreVertical, ShieldAlert, Trash2, Shield, UserCog, Eye, Circle, Building2, UserPlus } from 'lucide-react'
import { getAllGlobalUsersAction, adminBanUserAction, adminDeleteUserAction, adminUpdateUserRoleAction, getAllOrganizationsAction, assignUserToOrgAction } from '@/app/actions/global-admin.actions'

import { EmployeeDetailDrawer } from './EmployeeDetailDrawer'
import { format, formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

function OnlineIndicator({ lastSignInAt }: { lastSignInAt: string | null }) {
  if (!lastSignInAt) {
    return (
      <div className="flex items-center gap-1.5">
        <Circle className="w-2.5 h-2.5 fill-gray-400 text-gray-400" />
        <span className="text-xs text-muted-foreground">Never logged in</span>
      </div>
    )
  }
  
  const lastActive = new Date(lastSignInAt)
  const now = new Date()
  const diffMs = now.getTime() - lastActive.getTime()
  const diffMinutes = diffMs / (1000 * 60)
  
  const isOnline = diffMinutes < 15
  const isRecent = diffMinutes < 60
  
  return (
    <div className="flex items-center gap-1.5">
      <Circle className={`w-2.5 h-2.5 ${isOnline ? 'fill-emerald-500 text-emerald-500 animate-pulse' : isRecent ? 'fill-amber-400 text-amber-400' : 'fill-gray-400 text-gray-400'}`} />
      <span className="text-xs text-muted-foreground">
        {isOnline ? 'Online' : `${formatDistanceToNow(lastActive, { addSuffix: true })}`}
      </span>
    </div>
  )
}

// Simple inline dialog for assigning to org
function AssignToOrgDialog({ userId, email, organizations, onClose, onSuccess }: {
  userId: string
  email: string
  organizations: any[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [selectedOrg, setSelectedOrg] = useState(organizations[0]?.id || '')
  const [role, setRole] = useState('employee')
  const [isSaving, setIsSaving] = useState(false)

  const handleAssign = async () => {
    if (!selectedOrg) {
      alert('Please select an organization')
      return
    }
    setIsSaving(true)
    const res = await assignUserToOrgAction(userId, email, selectedOrg, role)
    setIsSaving(false)
    if (res.success) {
      alert('User assigned to organization successfully!')
      onSuccess()
      onClose()
    } else {
      alert((res as any).error?.message || 'Failed to assign user')
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-background border border-border rounded-xl shadow-2xl p-6 w-[420px] max-w-[90vw]">
        <h3 className="text-lg font-semibold mb-1">Assign to Organization</h3>
        <p className="text-sm text-muted-foreground mb-5">Assign <strong>{email}</strong> to an organization and create their employee record.</p>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Organization</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={selectedOrg}
              onChange={e => setSelectedOrg(e.target.value)}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1.5 block">Role in Organization</label>
            <select
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleAssign} disabled={isSaving} className="gap-2">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {isSaving ? 'Assigning...' : 'Assign'}
          </Button>
        </div>
      </div>
    </>
  )
}

export function GlobalAdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEmployee, setEditingEmployee] = useState<{ orgId: string, empId: string } | null>(null)
  const [assigningUser, setAssigningUser] = useState<{ id: string, email: string } | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    const [usersRes, orgsRes] = await Promise.all([
      getAllGlobalUsersAction(),
      getAllOrganizationsAction()
    ])
    if (usersRes.success && 'data' in usersRes) {
      setUsers(usersRes.data)
    } else {
      alert('Failed to load global users')
    }
    if (orgsRes.success && 'data' in orgsRes) {
      setOrganizations(orgsRes.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleBanUser = async (userId: string, currentlyBanned: boolean) => {
    const res = await adminBanUserAction(userId, !currentlyBanned)
    if (res.success) {
      alert(`User ${!currentlyBanned ? 'banned' : 'unbanned'} successfully`)
      loadUsers()
    } else {
      alert(res.error?.message || 'Error')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return
    
    const res = await adminDeleteUserAction(userId)
    if (res.success) {
      alert('User deleted successfully')
      loadUsers()
    } else {
      alert(res.error?.message || 'Error')
    }
  }

  const handleUpdateRole = async (userId: string, newRole: string) => {
    const res = await adminUpdateUserRoleAction(userId, newRole)
    if (res.success) {
      alert(`User role updated to ${newRole}`)
      loadUsers()
    } else {
      alert(res.error?.message || 'Error')
    }
  }

  return (
    <div className="space-y-6">
      {editingEmployee && (
        <EmployeeDetailDrawer 
          organizationId={editingEmployee.orgId} 
          employeeId={editingEmployee.empId} 
          onClose={() => setEditingEmployee(null)} 
        />
      )}

      {assigningUser && (
        <AssignToOrgDialog
          userId={assigningUser.id}
          email={assigningUser.email}
          organizations={organizations}
          onClose={() => setAssigningUser(null)}
          onSuccess={loadUsers}
        />
      )}

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Global Control Panel</h1>
        <p className="text-muted-foreground mt-2">Manage all system users, organizations, and infrastructure settings globally.</p>
      </div>

      <Card className="shadow-lg border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>System Users</CardTitle>
            <CardDescription>View and manage all registered identities across the entire platform.</CardDescription>
          </div>
          <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="h-64 flex items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
             </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>System Role</TableHead>
                    <TableHead>Organizations</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} className={user.isBanned ? 'opacity-60 bg-muted/50' : ''}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={(user.role === 'super_admin' || user.role === 'admin') ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.memberships.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.memberships.map((m: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {m.orgName} ({m.role})
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="success" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <OnlineIndicator lastSignInAt={user.lastSignInAt} />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Unknown'}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70">
                            {user.createdAt ? format(new Date(user.createdAt), 'hh:mm:ss a') : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[220px]">
                            {/* View Profile — per membership */}
                            {user.memberships.filter((m: any) => m.employeeId).map((m: any) => (
                              <DropdownMenuItem 
                                key={`view-${m.orgId}`} 
                                onClick={() => router.push(`/employee/${m.employeeId}`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile ({m.orgName})
                              </DropdownMenuItem>
                            ))}
                            {/* Edit Employee — per membership */}
                            {user.memberships.filter((m: any) => m.employeeId).map((m: any) => (
                              <DropdownMenuItem 
                                key={`edit-${m.orgId}`} 
                                onClick={() => setEditingEmployee({ orgId: m.orgId, empId: m.employeeId })}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Edit Employee ({m.orgName})
                              </DropdownMenuItem>
                            ))}
                            {/* Assign to org — for unassigned users */}
                            {user.memberships.length === 0 && (
                              <DropdownMenuItem onClick={() => setAssigningUser({ id: user.id, email: user.email })}>
                                <Building2 className="mr-2 h-4 w-4 text-primary" />
                                <span className="text-primary font-medium">Assign to Organization</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBanUser(user.id, user.isBanned)} className={user.isBanned ? 'text-emerald-600' : 'text-amber-600'}>
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              {user.isBanned ? 'Unban User' : 'Ban User'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, (user.role === 'super_admin' || user.role === 'admin') ? 'employee' : 'admin')}>
                              <Shield className="mr-2 h-4 w-4" />
                              {(user.role === 'super_admin' || user.role === 'admin') ? 'Revoke Admin' : 'Make Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Permanently Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
