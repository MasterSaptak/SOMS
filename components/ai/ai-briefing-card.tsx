"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, RotateCcw, CalendarCheck2, CheckSquare, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface BriefingData {
  briefing: string | null
  generatedAt: string | null
  isFallback?: boolean
}

export function AIBriefingCard() {
  const [data, setData] = useState<BriefingData>({ briefing: null, generatedAt: null })
  const [isLoading, setIsLoading] = useState(true)

  const fetchBriefing = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/ai/briefing')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        setData({ briefing: "Unable to load briefing.", generatedAt: new Date().toISOString(), isFallback: true })
      }
    } catch (e) {
      setData({ briefing: "Unable to connect to AI service.", generatedAt: new Date().toISOString(), isFallback: true })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBriefing()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <Card 
        className="overflow-hidden border border-primary/20 relative" 
        style={{ background: 'linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--primary) / 0.05) 50%, hsl(var(--card)) 100%)' }}
      >
        <CardContent className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center">
          
          {/* Left Column */}
          <div className="flex flex-col items-center lg:items-start shrink-0 lg:w-48 gap-3 border-b lg:border-b-0 lg:border-r border-border/50 pb-6 lg:pb-0 lg:pr-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
              <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/30 flex items-center justify-center relative z-10 text-primary">
                <Brain className="w-6 h-6" />
                <Sparkles className="w-3 h-3 absolute top-2 right-2 text-primary" />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="font-bold text-sm text-primary">AI Office Manager</h3>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Daily Briefing</p>
            </div>
          </div>

          {/* Center Column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2 relative">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {greeting}, Admin <span className="text-muted-foreground font-normal">· {dateStr}</span>
            </h2>
            <div className="text-base text-foreground/90 leading-relaxed min-h-[4.5rem]">
              {isLoading ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-full"></div>
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-muted/60 rounded animate-pulse w-4/6"></div>
                </div>
              ) : (
                <p>
                  {data.briefing}
                  {data.isFallback && <span className="text-xs ml-2 text-amber-500 font-medium">(Fallback data)</span>}
                </p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 shrink-0 lg:w-48 border-t lg:border-t-0 lg:border-l border-border/50 pt-6 lg:pt-0 lg:pl-6 w-full lg:w-auto">
            <div className="flex items-center justify-between lg:justify-start gap-3">
              <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={fetchBriefing} disabled={isLoading}>
                <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <div className="text-[10px] text-muted-foreground text-right lg:text-left leading-tight">
                Generated at<br/>
                {data.generatedAt ? new Date(data.generatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--'}
              </div>
            </div>
            <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 w-full">
              <Link href="/admin/leaves" className="flex items-center gap-2 px-3 py-2 bg-background border border-border/50 hover:border-primary/30 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap">
                <CalendarCheck2 className="w-3.5 h-3.5 text-amber-500" /> Review Leaves
              </Link>
              <Link href="/admin/tasks" className="flex items-center gap-2 px-3 py-2 bg-background border border-border/50 hover:border-primary/30 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap">
                <CheckSquare className="w-3.5 h-3.5 text-blue-500" /> View Tasks
              </Link>
              <Link href="/admin/attendance" className="flex items-center gap-2 px-3 py-2 bg-background border border-border/50 hover:border-primary/30 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-emerald-500" /> Check Attendance
              </Link>
            </div>
          </div>

        </CardContent>
      </Card>
    </motion.div>
  )
}
