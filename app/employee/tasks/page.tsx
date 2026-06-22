"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { WidgetShell } from '@/components/enterprise/widget-shell';
import { BentoGrid, BentoSlot } from '@/components/enterprise/bento-grid'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TASK_STATUSES, TASK_PRIORITIES, KANBAN_COLUMNS } from '@/lib/constants'
import type { TaskStatus, TaskPriority } from '@/lib/types'
import {
  Search, Plus, LayoutGrid, List, CheckCircle2, Clock, AlertTriangle, Circle, X, Tag, Calendar, MessageSquare
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-4 bg-card rounded-2xl border border-border shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-border/60">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${TASK_PRIORITIES[task.priority as TaskPriority]?.bgColor || 'bg-slate-500/10'} ${TASK_PRIORITIES[task.priority as TaskPriority]?.color || 'text-slate-500'} border-none text-[10px] uppercase font-bold`}>
                {task.priority}
              </Badge>
              <Badge className={`${TASK_STATUSES[task.status as TaskStatus]?.bgColor || 'bg-muted'} ${TASK_STATUSES[task.status as TaskStatus]?.color || 'text-muted-foreground'} border-none text-[10px] uppercase font-bold`}>
                {task.status.replace('_', ' ')}
              </Badge>
            </div>
            <h2 className="text-xl font-bold">{task.title}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
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
              <span className="text-sm">{task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
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

function TaskCard({ task, onClick }: { task: any; onClick: () => void }) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  const priorityInfo = TASK_PRIORITIES[task.priority as TaskPriority] || { bgColor: 'bg-slate-500/10', color: 'text-slate-500' }

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onClick}
      className="group p-4 rounded-xl bg-surface-primary border border-border/60 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm ${priorityInfo.bgColor} ${priorityInfo.color}`}>
          {task.priority || 'medium'}
        </span>
      </div>

      <h4 className="text-sm font-medium mb-3 line-clamp-2 group-hover:text-primary transition-colors">
        {task.title}
      </h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-[9px]">
              {task.assigned_to_emp?.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          {task.due_date && (
            <span className={`text-[10px] flex items-center gap-1 ${isOverdue ? 'text-red-500 font-semibold' : 'text-muted-foreground'}`}>
              <Calendar className="w-3 h-3" />
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ status, tasks, onTaskClick, onTaskMove }: { status: string; tasks: any[]; onTaskClick: (task: any) => void; onTaskMove: (taskId: string, newStatus: string) => void }) {
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
      className="flex-1 min-w-[280px] flex flex-col"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`${config.color}`}>{statusIcons[status]}</span>
          <h3 className="text-sm font-semibold">{config.label || status}</h3>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5 font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      <WidgetShell className="flex flex-col gap-3 min-h-[200px] p-2 bg-surface-secondary/50 border border-dashed border-border/40">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">
            Drop tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))
        )}
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
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

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
        // .eq('assigned_to', emp.id) // Optionally show all tasks or just assigned tasks
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

    // Optimistic UI update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    await supabase.from('task_updates').insert({
      task_id: taskId,
      updated_by: currentEmployeeId,
      content: `Status changed to ${newStatus.replace('_', ' ')}`,
      previous_status: task.status,
      new_status: newStatus
    })
    
    loadData()
  }

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
  const completedCount = tasks.filter(t => t.status === 'completed').length
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading tasks...</div>
  }

  return (
    <motion.div className="flex flex-col gap-6" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground mt-1">{filteredTasks.length} tasks · {completionRate}% completed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
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
          <Button onClick={() => setShowCreateDialog(true)} className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </motion.div>

      <motion.div variants={itemVars} className="flex flex-col md:flex-row items-start md:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="pl-9"
          />
        </div>
      </motion.div>

      {view === 'kanban' && (
        <BentoGrid columns={4} className="overflow-x-auto pb-4 gap-5">
          {['pending', 'in_progress', 'blocked', 'completed'].map((status) => (
            <BentoSlot key={status} colSpan={1}>
              <KanbanColumn 
                status={status} 
                tasks={filteredTasks.filter(t => t.status === status)} 
                onTaskClick={setSelectedTask} 
                onTaskMove={moveTask}
              />
            </BentoSlot>
          ))}
        </BentoGrid>
      )}

      {view === 'list' && (
        <WidgetShell className="flex flex-col gap-2 p-4">
          <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_100px] gap-4 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Assignee</span>
            <span>Due Date</span>
          </div>
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px_100px] gap-2 md:gap-4 items-center p-4 rounded-xl border border-border/50 hover:bg-muted/30 hover:border-primary/20 transition-colors cursor-pointer bg-surface-primary"
            >
              <div className="flex items-center gap-3">
                <span className={TASK_STATUSES[task.status as TaskStatus]?.color || 'text-slate-500'}>{statusIcons[task.status]}</span>
                <span className="text-sm font-medium truncate">{task.title}</span>
              </div>
              <Badge className={`text-[10px] uppercase font-bold w-fit ${TASK_STATUSES[task.status as TaskStatus]?.bgColor || 'bg-muted'} ${TASK_STATUSES[task.status as TaskStatus]?.color || 'text-muted-foreground'} border-none`}>
                {task.status.replace('_', ' ')}
              </Badge>
              <Badge className={`text-[10px] uppercase font-bold w-fit ${TASK_PRIORITIES[task.priority as TaskPriority]?.bgColor || 'bg-slate-500/10'} ${TASK_PRIORITIES[task.priority as TaskPriority]?.color || 'text-slate-500'} border-none`}>
                {task.priority || 'medium'}
              </Badge>
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[8px]">{task.assigned_to_emp?.full_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <span className="text-xs truncate">{task.assigned_to_emp?.full_name || 'Unassigned'}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
              </span>
            </div>
          ))}
        </WidgetShell>
      )}

      {showCreateDialog && currentEmployeeId && (
        <CreateTaskDialog 
          currentEmployeeId={currentEmployeeId}
          employees={employees}
          onClose={() => setShowCreateDialog(false)} 
          onTaskCreated={loadData}
        />
      )}
      {selectedTask && currentEmployeeId && (
        <TaskDetailDialog
          task={selectedTask}
          currentEmployeeId={currentEmployeeId}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={loadData}
        />
      )}
    </motion.div>
  )
}
