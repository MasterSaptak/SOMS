"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data
import { Megaphone, Pin, Calendar, Eye, Plus } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const priorityColors = {
  normal: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800',
  important: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800',
  urgent: 'bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800',
}

export default function AnnouncementsPage() {
  const [filter, setFilter] = useState<'all' | 'pinned'>('all')
  const announcements = filter === 'pinned' ? ([] as any[]).filter(a => a.isPinned) : []

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">{([] as any[]).length} announcements · {([] as any[]).filter(a => a.isPinned).length} pinned</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            <button onClick={() => setFilter('all')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>All</button>
            <button onClick={() => setFilter('pinned')} className={`px-3 py-1.5 text-xs font-medium transition-colors ${filter === 'pinned' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}>📌 Pinned</button>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-4">
        {announcements.map(ann => {
          const author = ([] as any[]).find(e => e.id === ann.authorId)
          return (
            <motion.div key={ann.id} variants={itemVars}>
              <Card className={`hover:border-primary/20 transition-colors ${ann.isPinned ? 'border-l-4 border-l-primary' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ann.priority === 'urgent' ? 'bg-red-500/10 text-red-500' : ann.priority === 'important' ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'}`}>
                        <Megaphone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold">{ann.title}</h3>
                          {ann.isPinned && <Pin className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <Badge variant="outline" className={`text-[10px] ${priorityColors[ann.priority as keyof typeof priorityColors]}`}>{ann.priority}</Badge>
                          <span className="text-[10px]">{ann.targetAudience === 'all' ? 'Everyone' : ann.targetAudience.join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground mb-4">{ann.content}</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-[9px]">{author ? `${author.firstName[0]}${author.lastName[0]}` : '??'}</AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">Posted by <strong className="text-foreground">{author ? (author ? `${author.firstName} ${author.lastName}` : "Unknown") : 'Admin'}</strong></span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
