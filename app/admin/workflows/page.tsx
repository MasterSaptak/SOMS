"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Workflow, Plus, Play, Pause, Settings, MoreVertical, 
  GitMerge, Mail, Bell, Webhook, FileJson, Clock, CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface AutomationWorkflow {
  id: string
  name: string
  description: string
  trigger: string
  steps: number
  status: 'active' | 'inactive' | 'draft'
  runsCount: number
  successRate: number
  lastRun: string
}

const MOCK_WORKFLOWS: AutomationWorkflow[] = [
  { id: 'w1', name: 'Leave Auto-Approval', description: 'Automatically approve casual leaves under 3 days if employee has sufficient balance.', trigger: 'Leave Request Created', steps: 3, status: 'active', runsCount: 142, successRate: 98, lastRun: '10 mins ago' },
  { id: 'w2', name: 'New Hire Onboarding', description: 'Create accounts, assign equipment, and send welcome email when employee status changes to active.', trigger: 'Employee Created', steps: 6, status: 'active', runsCount: 24, successRate: 100, lastRun: '2 days ago' },
  { id: 'w3', name: 'Asset Warranty Expiry Alert', description: 'Notify IT admin 30 days before asset warranty expires.', trigger: 'Schedule (Daily)', steps: 2, status: 'active', runsCount: 45, successRate: 100, lastRun: '6 hours ago' },
  { id: 'w4', name: 'Task Overdue Escalation', description: 'Send alert to manager if a critical task is past due by 24 hours.', trigger: 'Schedule (Hourly)', steps: 3, status: 'inactive', runsCount: 12, successRate: 92, lastRun: '1 month ago' },
  { id: 'w5', name: 'Expense Auto-Rejection', description: 'Reject expense claims missing receipts and notify user.', trigger: 'Expense Submitted', steps: 2, status: 'draft', runsCount: 0, successRate: 0, lastRun: 'Never' },
]

export default function WorkflowsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredWorkflows = MOCK_WORKFLOWS.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      className="flex flex-col gap-6 p-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="w-8 h-8 text-primary" />
            Workflow Automations
          </h1>
          <p className="text-muted-foreground mt-1">Build and manage automated business processes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{MOCK_WORKFLOWS.filter(w => w.status === 'active').length}</p>
              <p className="text-xs text-muted-foreground">Active Workflows</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Play className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">223</p>
              <p className="text-xs text-muted-foreground">Total Runs (30d)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">98.5%</p>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-muted-foreground">Failed Runs (30d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflows List */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle>All Workflows</CardTitle>
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredWorkflows.map((workflow) => (
              <div key={workflow.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    workflow.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                    workflow.status === 'inactive' ? 'bg-slate-500/10 text-slate-600' :
                    'bg-amber-500/10 text-amber-600'
                  }`}>
                    {workflow.status === 'active' ? <Play className="w-5 h-5" /> : 
                     workflow.status === 'inactive' ? <Pause className="w-5 h-5" /> : 
                     <FileJson className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold">{workflow.name}</h3>
                      <Badge variant="outline" className={`text-[10px] capitalize ${
                        workflow.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' :
                        workflow.status === 'inactive' ? 'bg-slate-500/10 text-slate-600 border-slate-200' :
                        'bg-amber-500/10 text-amber-600 border-amber-200'
                      }`}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <GitMerge className="w-3.5 h-3.5" />
                        Trigger: {workflow.trigger}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Workflow className="w-3.5 h-3.5" />
                        {workflow.steps} steps
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 shrink-0 bg-background/50 p-3 rounded-xl border border-border/50">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase mb-0.5">Runs</p>
                    <p className="text-sm font-semibold">{workflow.runsCount}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-medium uppercase mb-0.5">Success</p>
                    <p className={`text-sm font-semibold ${workflow.successRate < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {workflow.runsCount === 0 ? '-' : `${workflow.successRate}%`}
                    </p>
                  </div>
                  <div className="text-center border-l border-border/50 pl-6">
                    <p className="text-xs text-muted-foreground font-medium uppercase mb-0.5">Last Run</p>
                    <p className="text-sm">{workflow.lastRun}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredWorkflows.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Workflow className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No workflows found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
