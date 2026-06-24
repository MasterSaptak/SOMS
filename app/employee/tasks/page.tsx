"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WidgetShell } from '@/components/enterprise/widget-shell';
import { BentoGrid, BentoSlot } from '@/components/enterprise/bento-grid'
import { MetricCard } from '@/components/enterprise/metric-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TASK_STATUSES, TASK_PRIORITIES, KANBAN_COLUMNS } from '@/lib/constants'
import type { TaskStatus, TaskPriority } from '@/lib/types'
import {
  Search, Plus, LayoutGrid, List, CheckCircle2, Clock, AlertTriangle, Circle, X, Tag, Calendar, MessageSquare, Filter, Check, Loader2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatDistanceToNow, isPast } from 'date-fns'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="w-3.5 h-3.5" />,
  in_progress: <Clock className="w-3.5 h-3.5" />,
  blocked: <AlertTriangle className="w-3.5 h-3.5" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5" />,
  overdue: <AlertTriangle className="w-3.5 h-3.5" />,
}

function CreateTaskDialog({ onClose, currentEmployeeId, employees, onTaskCreated }: { onClose: () => void, currentEmployeeId: string, employees: any[], onTaskCreated: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<string>('medium')
  const [assignedTo, setAssignedTo] = useState(currentEmployeeId)
  const [dueDate, setDueDate] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    await supabase.from('tasks').insert({
      title: title.trim(),
      description,
      status: 'pending',
      priority,
      created_by: currentEmployeeId,
      assigned_to: assignedTo,
      deadline: dueDate || null,
    })
    
    onTaskCreated()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="text-lg font-semibold">Create New Task</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title..." autoFocus required />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function TaskDetailDialog({ task, onClose, currentEmployeeId, onTaskUpdated }: { task: any, onClose: () => void, currentEmployeeId: string, onTaskUpdated: () => void }) {
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function loadUpdates() {
      const { data } = await supabase
        .from('task_updates')
        .select(`
          *,
          employees(full_name, profiles(avatar_url))
        `)
        .eq('task_id', task.id)
        .order('created_at', { ascending: false })
      if (data) setComments(data)
    }
    loadUpdates()
  }, [task.id, supabase])

  const moveTask = async (newStatus: string) => {
    if (task.status === newStatus) return
    
    await supabase.from('tasks').update({ status: newStatus }).eq('id', task.id)
    await supabase.from('task_updates').insert({
      task_id: task.id,
      updated_by: currentEmployeeId,
      content: `Status changed to ${newStatus.replace('_', ' ')}`,
      previous_status: task.status,
      new_status: newStatus
    })
    
    onTaskUpdated()
    onClose()
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    await supabase.from('task_updates').insert({
      task_id: task.id,
      updated_by: currentEmployeeId,
      content: newComment.trim()
    })
    setNewComment('')
    // Refresh comments
    const { data } = await supabase
      .from('task_updates')
      .select(`*, employees(full_name, profiles(avatar_url))`)
      .eq('task_id', task.id)
      .order('created_at', { ascending: false })
    if (data) setComments(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-card rounded-2xl border border-border shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 md:p-6 border-b border-border/60">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className={`${TASK_PRIORITIES[task.priority as TaskPriority]?.bgColor || 'bg-slate-500/10'} ${TASK_PRIORITIES[task.priority as TaskPriority]?.color || 'text-slate-500'} border-none text-[10px] uppercase font-bold`}>
                {task.priority}
              </Badge>
              <Badge className={`${TASK_STATUSES[task.status as TaskStatus]?.bgColor || 'bg-muted'} ${TASK_STATUSES[task.status as TaskStatus]?.color || 'text-muted-foreground'} border-none text-[10px] uppercase font-bold`}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <h2 className="text-lg md:text-xl font-bold">{task.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</h3>
            <p className="text-sm leading-relaxed">{task.description || 'No description provided.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Assignee</span>
              <span className="text-sm">{task.assigned_to_emp?.full_name || 'Unassigned'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground font-medium">Due Date</span>
              <span className="text-sm">{task.deadline ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Move To</h3>
            <div className="flex flex-wrap gap-2">
              {['pending', 'in_progress', 'blocked', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={task.status === status ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => moveTask(status)}
                  disabled={task.status === status}
                >
                  {statusIcons[status]}
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Updates & Comments
            </h3>
            <div className="flex flex-col gap-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <Avatar className="w-7 h-7 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {comment.employees?.full_name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold">{comment.employees?.full_name || 'System'}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
              />
              <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>Post</Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function TaskCard({ task, onClick, onQuickComplete }: { task: any; onClick: () => void; onQuickComplete: (e: React.MouseEvent, id: string) => void }) {
  const isTaskOverdue = task.deadline && isPast(new Date(task.deadline)) && task.status !== 'completed'
  const priorityInfo = TASK_PRIORITIES[task.priority as TaskPriority] || { bgColor: 'bg-slate-500/10', color: 'text-slate-500' }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      draggable
      onDragStart={(e: any) => {
        e.dataTransfer.setData('taskId', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onClick}
      className="group relative p-4 rounded-xl bg-surface-primary/60 backdrop-blur-sm border border-border/60 hover:border-primary/40 hover:shadow-[0_4px_20px_-4px_rgba(var(--primary),0.1)] transition-all cursor-pointer overflow-hidden"
    >
      {/* Background glow based on priority */}
      <div className={`absolute top-0 right-0 w-16 h-16 blur-2xl opacity-10 rounded-full pointer-events-none ${
        task.priority === 'critical' ? 'bg-red-500' :
        task.priority === 'high' ? 'bg-orange-500' : 'bg-transparent'
      }`} />

      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${priorityInfo.bgColor} ${priorityInfo.color}`}>
          {task.priority || 'medium'}
        </span>
        
        {task.status !== 'completed' && (
          <button 
            onClick={(e) => onQuickComplete(e, task.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-emerald-500/10 hover:text-emerald-500 text-muted-foreground rounded-md z-10"
            title="Mark as completed"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <h4 className="text-sm font-medium mb-4 line-clamp-2 group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 border border-background shadow-sm">
            <AvatarFallback className="text-[9px]">
              {task.assigned_to_emp?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {task.deadline && (
          <span className={`text-[10px] flex items-center gap-1 font-medium px-1.5 py-0.5 rounded ${
            isTaskOverdue 
              ? 'text-red-600 dark:text-red-400 bg-red-500/10' 
              : 'text-muted-foreground bg-muted/50'
          }`}>
            <Calendar className="w-3 h-3" />
            {isTaskOverdue ? 'Overdue' : formatDistanceToNow(new Date(task.deadline), { addSuffix: true })}
          </span>
        )}
      </div>
    </motion.div>
  )
}

function KanbanColumn({ status, tasks, onTaskClick, onTaskMove, onQuickComplete }: { status: string; tasks: any[]; onTaskClick: (task: any) => void; onTaskMove: (taskId: string, newStatus: string) => void; onQuickComplete: (e: React.MouseEvent, id: string) => void }) {
  const config = TASK_STATUSES[status as TaskStatus] || { label: status, color: 'text-slate-500' }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onTaskMove(taskId, status)
    }
  }

  return (
    <div
      className="flex-1 min-w-[280px] md:min-w-[300px] flex flex-col h-full"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-3 px-2 sticky top-0 bg-background/80 backdrop-blur-sm z-10 py-1">
        <div className="flex items-center gap-2">
          <span className={`${config.color}`}>{statusIcons[status]}</span>
          <h3 className="text-sm font-bold uppercase tracking-wide">{config.label || status}</h3>
          <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-bold">
            {tasks.length}
          </span>
        </div>
      </div>

      <WidgetShell className="flex flex-col gap-3 min-h-[250px] p-3 bg-surface-secondary/30 border border-dashed border-border/40 flex-1 overflow-y-auto">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-32 text-xs text-muted-foreground opacity-60"
            >
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-2">
                <Plus className="w-4 h-4" />
              </div>
              Drop tasks here
            </motion.div>
          ) : (
            tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={() => onTaskClick(task)} 
                onQuickComplete={onQuickComplete}
              />
            ))
          )}
        </AnimatePresence>
      </WidgetShell>
    </div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  
  const isMobile = useIsMobile()
  const [activeMobileTab, setActiveMobileTab] = useState<string>('pending')

  const supabase = createClient()

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: emp } = await supabase
      .from('employees')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (emp) {
      setCurrentEmployeeId(emp.id)
      
      const { data: allEmps } = await supabase.from('employees').select('id, full_name')
      if (allEmps) setEmployees(allEmps)

      const { data: myTasks } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_emp:employees!tasks_assigned_to_fkey(full_name),
          created_by_emp:employees!tasks_created_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false })
      
      if (myTasks) setTasks(myTasks)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const moveTask = async (taskId: string, newStatus: string) => {
    if (!currentEmployeeId) return
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) return

    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    await supabase.from('task_updates').insert({
      task_id: taskId,
      updated_by: currentEmployeeId,
      content: `Status changed to ${newStatus.replace('_', ' ')}`,
      previous_status: task.status,
      new_status: newStatus
    })
    
    // loadData() // Commented out to prevent flicker during optimisic update, will rely on realtime if added later
  }

  const handleQuickComplete = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation()
    await moveTask(taskId, 'completed')
  }

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchesSearch && matchesPriority
  })
  
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground flex justify-center items-center min-h-[50vh]">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <Loader2 className="w-8 h-8" />
      </motion.div>
    </div>
  }

  return (
    <motion.div className="flex flex-col gap-6" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">Organize and track your daily work effortlessly.</p>
        </div>
      </motion.div>

      <motion.div variants={itemVars}>
        <BentoGrid className="grid-cols-1 md:grid-cols-4 mb-2 gap-4">
          <BentoSlot className={isMobile ? "col-span-2" : "col-span-1"}>
            <MetricCard 
              title="Total Tasks" 
              value={filteredTasks.length} 
              icon={<List className="w-4 h-4 text-primary" />}
            />
          </BentoSlot>
          <BentoSlot className={isMobile ? "col-span-2" : "col-span-1"}>
            <MetricCard 
              title="Completed" 
              value={`${completionRate}%`} 
              progress={{ value: completionRate, color: "bg-emerald-500" }}
              icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            />
          </BentoSlot>
          <BentoSlot className={isMobile ? "col-span-4" : "col-span-2"}>
            <WidgetShell className="flex flex-col sm:flex-row items-center justify-between p-4 md:p-6 h-full gap-4 bg-surface-primary/50 backdrop-blur-md">
              <div className="relative flex-1 w-full flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-9 h-10 w-full bg-background"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-3 bg-background">
                      <Filter className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Priority</span>
                      {priorityFilter !== 'all' && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full"></span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem onClick={() => setPriorityFilter('all')}>
                      {priorityFilter === 'all' && <Check className="w-4 h-4 mr-2" />}
                      <span className={priorityFilter === 'all' ? 'font-bold' : 'ml-6'}>All Priorities</span>
                    </DropdownMenuItem>
                    {Object.keys(TASK_PRIORITIES).map(p => (
                      <DropdownMenuItem key={p} onClick={() => setPriorityFilter(p)}>
                        {priorityFilter === p && <Check className="w-4 h-4 mr-2" />}
                        <span className={priorityFilter === p ? 'font-bold' : 'ml-6 capitalize'}>{p}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background">
                  <button
                    onClick={() => setView('kanban')}
                    className={`p-2 transition-colors ${view === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 transition-colors ${view === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5 h-10 rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Task</span>
                </Button>
              </div>
            </WidgetShell>
          </BentoSlot>
        </BentoGrid>
      </motion.div>

      {view === 'kanban' && (
        <>
          {isMobile ? (
            <div className="flex flex-col gap-4">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
                {KANBAN_COLUMNS.map(status => {
                  const isActive = activeMobileTab === status
                  const count = filteredTasks.filter(t => t.status === status).length
                  return (
                    <button
                      key={status}
                      onClick={() => setActiveMobileTab(status)}
                      className={`flex-shrink-0 snap-start px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                        isActive 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {status.replace('_', ' ')}
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="min-h-[50vh]">
                <KanbanColumn 
                  status={activeMobileTab} 
                  tasks={filteredTasks.filter(t => t.status === activeMobileTab)} 
                  onTaskClick={setSelectedTask} 
                  onTaskMove={moveTask}
                  onQuickComplete={handleQuickComplete}
                />
              </div>
            </div>
          ) : (
            <BentoGrid className="grid-cols-1 md:grid-cols-4 pb-4 gap-5 items-stretch">
              {KANBAN_COLUMNS.map((status) => (
                <BentoSlot key={status} className="col-span-1 h-full">
                  <KanbanColumn 
                    status={status} 
                    tasks={filteredTasks.filter(t => t.status === status)} 
                    onTaskClick={setSelectedTask} 
                    onTaskMove={moveTask}
                    onQuickComplete={handleQuickComplete}
                  />
                </BentoSlot>
              ))}
            </BentoGrid>
          )}
        </>
      )}

      {view === 'list' && (
        <WidgetShell className="flex flex-col gap-2 p-2 md:p-4 bg-surface-primary/50 backdrop-blur-sm">
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_100px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Assignee</span>
            <span>Due Date</span>
          </div>
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px_100px] gap-3 md:gap-4 items-center p-4 rounded-xl border border-border/50 hover:bg-muted/40 hover:border-primary/30 transition-all cursor-pointer bg-surface-primary shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className={TASK_STATUSES[task.status as TaskStatus]?.color || 'text-slate-500'}>{statusIcons[task.status]}</span>
                  <span className="text-sm font-medium line-clamp-2 md:truncate">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 md:contents">
                  <Badge className={`text-[10px] uppercase font-bold w-fit ${TASK_STATUSES[task.status as TaskStatus]?.bgColor || 'bg-muted'} ${TASK_STATUSES[task.status as TaskStatus]?.color || 'text-muted-foreground'} border-none`}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={`text-[10px] uppercase font-bold w-fit ${TASK_PRIORITIES[task.priority as TaskPriority]?.bgColor || 'bg-slate-500/10'} ${TASK_PRIORITIES[task.priority as TaskPriority]?.color || 'text-slate-500'} border-none`}>
                    {task.priority || 'medium'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between md:contents mt-2 md:mt-0 pt-2 border-t border-border/50 md:border-t-0 md:pt-0">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-5 h-5">
                      <AvatarFallback className="text-[8px]">{task.assigned_to_emp?.full_name?.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs truncate">{task.assigned_to_emp?.full_name || 'Unassigned'}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    {task.deadline ? formatDistanceToNow(new Date(task.deadline), { addSuffix: true }) : '—'}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </WidgetShell>
      )}

      <AnimatePresence>
        {showCreateDialog && currentEmployeeId && (
          <CreateTaskDialog 
            currentEmployeeId={currentEmployeeId}
            employees={employees}
            onClose={() => setShowCreateDialog(false)} 
            onTaskCreated={loadData}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTask && currentEmployeeId && (
          <TaskDetailDialog
            task={selectedTask}
            currentEmployeeId={currentEmployeeId}
            onClose={() => setSelectedTask(null)}
            onTaskUpdated={loadData}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
