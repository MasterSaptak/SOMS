"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import type { AIInsight } from '@/lib/types'
import { cn } from '@/lib/utils'

interface AIInsightCardProps {
  insight: AIInsight | null
  isLoading?: boolean
  className?: string
}

const severityStyles = {
  info: 'from-indigo-500 to-purple-600',
  warning: 'from-amber-500 to-orange-600',
  critical: 'from-red-500 to-rose-600',
}

export function AIInsightCard({ insight, isLoading = false, className }: AIInsightCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-6">
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mb-4" />
          <Skeleton className="h-9 w-full rounded-md" />
        </CardContent>
      </Card>
    )
  }

  if (!insight) return null

  return (
    <Card className={cn(
      "bg-gradient-to-br text-white border-none shadow-lg overflow-hidden relative",
      severityStyles[insight.severity],
      className
    )}>
      <div className="absolute top-0 right-0 p-6 opacity-10">
        <Sparkles className="w-20 h-20" />
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white/70" />
          {insight.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10">
        <p className="text-white/80 text-sm mb-5 leading-relaxed">
          {insight.content}
        </p>
        <Button
          asChild
          variant="glass"
          size="sm"
          className="w-full justify-between group border-white/20 text-white hover:bg-white/10"
        >
          <Link href="/employee/analytics">
            Analyze Work Patterns
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
