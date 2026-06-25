"use client"

import { useState } from "react"
import { useOrganizationStore } from "@/store/use-organization-store"
import { useAuthStore } from "@/store/use-auth-store"
import { addProjectMilestoneAction } from "@/app/actions/project.actions"
import { ProjectWithDetails } from "@/lib/repositories/project.repository"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Flag, Calendar, Loader2, Plus, CheckCircle2, Circle } from "lucide-react"
import { format } from "date-fns"

export function MilestoneTimeline({ project, onUpdate }: { project: ProjectWithDetails, onUpdate: () => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [dueDate, setDueDate] = useState("")

  const { activeOrganizationId } = useOrganizationStore()
  const { user } = useAuthStore()

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeOrganizationId || !user?.id) return

    setLoading(true)
    try {
      const res = await addProjectMilestoneAction(activeOrganizationId, project.id, user.id, {
        name,
        due_date: dueDate || undefined
      })
      if (res.success) {
        setOpen(false)
        setName("")
        setDueDate("")
        onUpdate()
      } else {
        alert("Failed to add milestone: " + res.error?.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const milestones = [...(project.project_milestones || [])].sort((a, b) => {
    if (!a.due_date) return 1
    if (!b.due_date) return -1
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Flag className="w-5 h-5 text-indigo-500" /> Project Milestones
          </h3>
          <p className="text-sm text-muted-foreground">Track major deliverables and phases.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Milestone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMilestone} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Milestone Name</Label>
                <Input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="e.g. Design Sign-off" 
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date (Optional)</Label>
                <Input 
                  type="date" 
                  value={dueDate} 
                  onChange={e => setDueDate(e.target.value)} 
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading || !name.trim()}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Milestone
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative border-l-2 border-muted ml-3 space-y-8 py-4">
        {milestones.map((milestone, i) => {
          const isCompleted = milestone.status === 'Completed' || milestone.completion_percentage === 100
          return (
            <div key={milestone.id} className="relative pl-8">
              <div className={`absolute -left-[11px] top-1 p-0.5 rounded-full bg-background border-2 ${isCompleted ? 'border-emerald-500' : 'border-muted-foreground'}`}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="border rounded-lg p-4 bg-card shadow-sm group hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className={`text-base font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                      {milestone.name}
                    </h4>
                    {milestone.due_date && (
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {milestone.completion_percentage}%
                  </div>
                </div>
                <Progress value={milestone.completion_percentage} className="h-2" />
              </div>
            </div>
          )
        })}

        {milestones.length === 0 && (
          <div className="pl-8 text-muted-foreground text-sm">
            No milestones have been defined for this project yet.
          </div>
        )}
      </div>
    </div>
  )
}
