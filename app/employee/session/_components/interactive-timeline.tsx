"use client"

import React, { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TimelineBreak {
  type: string
  start_time: string
  end_time: string | null
}

interface InteractiveTimelineProps {
  clockInIso: string | null
  breaks: TimelineBreak[]
  currentTimeIso: string
  officeHoursSeconds: number
  maxDurationSeconds: number
  sessionState: string
}

export function InteractiveTimeline({
  clockInIso,
  breaks,
  currentTimeIso,
  officeHoursSeconds,
  maxDurationSeconds,
  sessionState
}: InteractiveTimelineProps) {
  
  const segments = useMemo(() => {
    if (!clockInIso) return []

    const start = new Date(clockInIso).getTime()
    const now = new Date(currentTimeIso).getTime()
    const maxMs = maxDurationSeconds * 1000
    
    // Sort breaks by start time
    const sortedBreaks = [...breaks].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    const segs: { type: string, startMs: number, endMs: number, durationMs: number }[] = []
    
    let cursor = start

    sortedBreaks.forEach(b => {
      const bStart = new Date(b.start_time).getTime()
      const bEnd = b.end_time ? new Date(b.end_time).getTime() : now

      // Work segment before break
      if (bStart > cursor) {
        segs.push({ type: 'working', startMs: cursor, endMs: bStart, durationMs: bStart - cursor })
      }

      // Break segment
      segs.push({ type: b.type, startMs: bStart, endMs: bEnd, durationMs: bEnd - bStart })
      
      cursor = bEnd
    })

    // Final work segment after last break
    if (cursor < now) {
      segs.push({ type: 'working', startMs: cursor, endMs: now, durationMs: now - cursor })
    }

    return segs
  }, [clockInIso, breaks, currentTimeIso, maxDurationSeconds])

  if (!clockInIso) {
    return (
      <div className="w-full h-3.5 rounded-lg bg-muted rounded-full overflow-hidden" />
    )
  }

  const maxMs = maxDurationSeconds * 1000
  const officeMs = officeHoursSeconds * 1000
  const officePct = (officeMs / maxMs) * 100

  const getSegmentColor = (type: string) => {
    switch(type) {
      case 'working': return 'bg-emerald-500'
      case 'lunch': return 'bg-orange-500'
      case 'food': return 'bg-yellow-500'
      case 'personal': return 'bg-purple-500'
      case 'emergency': return 'bg-red-500'
      case 'paused': return 'bg-gray-500'
      default: return 'bg-muted-foreground'
    }
  }

  const getSegmentLabel = (type: string) => {
    switch(type) {
      case 'working': return 'Working'
      case 'lunch': return 'Lunch Break'
      case 'food': return 'Coffee/Snack'
      case 'personal': return 'Personal Break'
      case 'emergency': return 'Emergency'
      case 'paused': return 'Paused'
      default: return type
    }
  }

  const formatSegmentTime = (ms: number) => {
    const mins = Math.floor(ms / 60000)
    if (mins < 60) return `${mins}m`
    const hrs = Math.floor(mins / 60)
    const remMins = mins % 60
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`
  }

  return (
    <div className="w-full relative mt-4">
      {/* Markers Container */}
      <div className="relative w-full h-5 mb-1 text-[10px] font-bold tracking-widest text-muted-foreground">
        <div className="absolute left-0 bottom-0 text-[11px] font-semibold">0h</div>
        <div className="absolute bottom-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${officePct}%` }}>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">4h</span>
          <div className="w-px h-1 bg-primary/50" />
        </div>
        {maxDurationSeconds > officeHoursSeconds && (
          <div className="absolute bottom-0 text-[9px] font-bold tracking-wider text-indigo-500/60 uppercase" style={{ left: `${(officePct + 100) / 2}%`, transform: 'translateX(-50%)' }}>Comp.</div>
        )}
        <div className="absolute right-0 bottom-0 text-[11px] font-bold text-red-500">4.5h</div>
      </div>

      {/* Track */}
      <div className="relative w-full h-3.5 rounded-lg bg-muted rounded-full overflow-hidden flex">
        <TooltipProvider>
          {segments.map((seg, i) => {
            const widthPct = (seg.durationMs / maxMs) * 100
            if (widthPct <= 0) return null
            
            return (
              <Tooltip key={i} delayDuration={100}>
                <TooltipTrigger asChild>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full border-r border-background/20 last:border-r-0 origin-left ${getSegmentColor(seg.type)}`}
                    style={{ width: `${widthPct}%` }}
                  />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-bold font-mono">
                  {getSegmentLabel(seg.type)} • {formatSegmentTime(seg.durationMs)}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>

        {/* 4h Office Limit Marker Line overlay */}
        <div 
          className="absolute top-0 bottom-0 w-px bg-background shadow-[0_0_5px_rgba(0,0,0,0.5)] z-10" 
          style={{ left: `${officePct}%` }} 
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[10px] font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />Worked</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500" />Lunch</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500" />Snack</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-purple-500" />Personal</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" />Emergency</span>
      </div>
    </div>
  )
}
