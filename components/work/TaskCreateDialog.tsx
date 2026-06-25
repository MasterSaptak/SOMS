"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createTaskAction } from "@/app/actions/task.actions"
import { Loader2, Plus } from "lucide-react"
import { useOrganizationStore } from "@/store/use-organization-store"

export function TaskCreateDialog({ 
  onSuccess 
}: { 
  onSuccess?: () => void 
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { activeOrganizationId } = useOrganizationStore()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!activeOrganizationId) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const taskData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as any,
      priority: formData.get("priority") as any,
      status: formData.get("status") as any,
      estimated_hours: formData.get("estimated_hours") ? parseFloat(formData.get("estimated_hours") as string) : undefined,
      due_date: formData.get("due_date") ? formData.get("due_date") as string : undefined
    }

    try {
      const result = await createTaskAction(activeOrganizationId, taskData, [])
      if (result.success) {
        setOpen(false)
        onSuccess?.()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new enterprise task, mission, or goal.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="Task title..." />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Detailed description..." 
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="Task">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Task">Task</SelectItem>
                  <SelectItem value="Daily Task">Daily Task</SelectItem>
                  <SelectItem value="Weekly Task">Weekly Task</SelectItem>
                  <SelectItem value="Monthly Mission">Monthly Mission</SelectItem>
                  <SelectItem value="Quarterly Goal">Quarterly Goal</SelectItem>
                  <SelectItem value="Project Task">Project Task</SelectItem>
                  <SelectItem value="Team Task">Team Task</SelectItem>
                  <SelectItem value="Organization Task">Organization Task</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="Medium">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select name="status" defaultValue="Draft">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Est. Hours</Label>
              <Input 
                id="estimated_hours" 
                name="estimated_hours" 
                type="number" 
                step="0.5" 
                min="0"
                placeholder="e.g. 2.5" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input 
                id="due_date" 
                name="due_date" 
                type="date" 
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !activeOrganizationId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
