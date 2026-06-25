'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { MoreVertical, ShieldAlert, Trash2, Shield, UserCog, Building } from 'lucide-react'
import { getAllGlobalUsersAction, adminBanUserAction, adminDeleteUserAction, adminUpdateUserRoleAction } from '@/app/actions/global-admin.actions'

import { EmployeeDetailDrawer } from './EmployeeDetailDrawer'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'

export function GlobalAdminDashboard() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingEmployee, setEditingEmployee] = useState<{ orgId: string, empId: string } | null>(null)

  const loadUsers = async () => {
    setIsLoading(true)
    const res = await getAllGlobalUsersAction()
    if (res.success && 'data' in res) {
      setUsers(res.data)
    } else {
      alert('Failed to load global users')
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
                          <span className="text-xs text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="success" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[200px]">
                            {user.memberships.map((m: any) => (
                              <DropdownMenuItem 
                                key={m.orgId} 
                                onClick={() => m.employeeId ? setEditingEmployee({ orgId: m.orgId, empId: m.employeeId }) : alert('No Employee Record for ' + m.orgName)}
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Edit Employee ({m.orgName})
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleBanUser(user.id, user.isBanned)} className={user.isBanned ? 'text-emerald-600' : 'text-amber-600'}>
                              <ShieldAlert className="mr-2 h-4 w-4" />
                              {user.isBanned ? 'Unban User' : 'Ban User'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateRole(user.id, (user.role === 'super_admin' || user.role === 'admin') ? 'user' : 'admin')}>
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
                      <TableCell colSpan={6} className="h-24 text-center">
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
