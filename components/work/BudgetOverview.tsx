"use client"

import { useState, useEffect, useCallback } from "react"
import { useOrganizationStore } from "@/store/use-organization-store"
import { useAuthStore } from "@/store/use-auth-store"
import { getBudgetOverviewAction, requestBudgetAction, approveBudgetRequestAction, rejectBudgetRequestAction } from "@/app/actions/project.actions"
import { ProjectWithDetails, BudgetCategory } from "@/lib/repositories/project.repository"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Banknote, Loader2, Plus, Receipt, AlertTriangle, Check, X } from "lucide-react"
import { format } from "date-fns"

export function BudgetOverview({ project, onUpdate }: { project: ProjectWithDetails, onUpdate: () => void }) {
  const [entries, setEntries] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [requestOpen, setRequestOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const { activeOrganizationId } = useOrganizationStore()
  const { user } = useAuthStore()

  // New Request Form
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<BudgetCategory>("Other")
  const [description, setDescription] = useState("")

  const loadBudgets = useCallback(async () => {
    if (!activeOrganizationId) return
    setLoading(true)
    const res = await getBudgetOverviewAction(activeOrganizationId, project.id)
    if (res.success) {
      setEntries(res.data.entries)
      setRequests(res.data.requests)
    }
    setLoading(false)
  }, [activeOrganizationId, project.id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBudgets()
  }, [project.id, activeOrganizationId, loadBudgets])

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrganizationId || !user?.id) return
    setActionLoading('create')
    const res = await requestBudgetAction(activeOrganizationId, project.id, user.id, parseFloat(amount), category, description)
    if (res.success) {
      setRequestOpen(false)
      setAmount("")
      setDescription("")
      setCategory("Other")
      // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBudgets()
      onUpdate()
    } else {
      alert("Failed to submit request: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const handleApprove = async (req: any) => {
    if (!activeOrganizationId || !user?.id) return
    setActionLoading(`approve-${req.id}`)
    const res = await approveBudgetRequestAction(activeOrganizationId, project.id, req.id, user.id, {
      amount: req.amount,
      category: req.category,
      description: req.description
    })
    if (res.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBudgets()
      onUpdate()
    } else {
      alert("Failed to approve: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const handleReject = async (req: any) => {
    if (!activeOrganizationId || !user?.id) return
    const reason = prompt("Reason for rejection:")
    if (reason === null) return

    setActionLoading(`reject-${req.id}`)
    const res = await rejectBudgetRequestAction(activeOrganizationId, project.id, req.id, user.id, reason || "Rejected")
    if (res.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
    loadBudgets()
    } else {
      alert("Failed to reject: " + res.error?.message)
    }
    setActionLoading(null)
  }

  const totalBudget = Number(project.total_budget) || 0
  const spentAmount = entries.reduce((sum, e) => sum + Number(e.amount), 0)
  const pendingAmount = requests.filter(r => r.status === 'Pending').reduce((sum, r) => sum + Number(r.amount), 0)
  
  const spentPercentage = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0
  const pendingPercentage = totalBudget > 0 ? (pendingAmount / totalBudget) * 100 : 0

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
  }

  // Check if current user is Owner or Manager
  const myRole = project.project_members?.find(m => m.employee_id === user?.id)?.role
  const canApprove = myRole === 'Owner' || myRole === 'Manager'

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-500">${spentAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{spentPercentage.toFixed(1)}% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">${pendingAmount.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Budget Utilization</span>
          <span className="font-medium text-indigo-500">{spentPercentage.toFixed(1)}% Spent</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          <div className="h-full bg-indigo-500" style={{ width: `${Math.min(spentPercentage, 100)}%` }} />
          <div className="h-full bg-orange-400" style={{ width: `${Math.min(pendingPercentage, 100 - spentPercentage)}%` }} />
        </div>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-500" /> Budget Requests
          </h3>
          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Budget Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRequest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Amount ($)</Label>
                  <Input required type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(val: any) => setCategory(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Labor', 'Software', 'Hardware', 'Travel', 'Training', 'Operations', 'Other'].map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea required placeholder="What is this expense for?" value={description} onChange={e => setDescription(e.target.value)} />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={!amount || actionLoading === 'create'}>
                    {actionLoading === 'create' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Requester</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Status</TableHead>
                {canApprove && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map(req => (
                <TableRow key={req.id}>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(req.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                        {req.requester?.full_name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium">{req.requester?.full_name || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{req.category}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm" title={req.description}>
                    {req.description}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ${Number(req.amount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {req.status === 'Pending' && <Badge variant="outline" className="text-orange-500 border-orange-500/20 bg-orange-500/10">Pending</Badge>}
                    {req.status === 'Approved' && <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10">Approved</Badge>}
                    {req.status === 'Rejected' && <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10">Rejected</Badge>}
                  </TableCell>
                  {canApprove && (
                    <TableCell className="text-right">
                      {req.status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 h-8 w-8"
                            onClick={() => handleApprove(req)}
                            disabled={actionLoading === `approve-${req.id}`}
                          >
                            {actionLoading === `approve-${req.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600 hover:bg-red-500/10 h-8 w-8"
                            onClick={() => handleReject(req)}
                            disabled={actionLoading === `reject-${req.id}`}
                          >
                            {actionLoading === `reject-${req.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canApprove ? 7 : 6} className="h-24 text-center text-muted-foreground">
                    No budget requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
