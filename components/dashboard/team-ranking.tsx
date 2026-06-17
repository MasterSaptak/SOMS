"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Crown, Medal, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TeamMember {
  id: string
  name: string
  initials: string
  score: number
  department: string
  trend?: 'up' | 'down' | 'stable'
}

interface TeamRankingProps {
  members: TeamMember[]
  isLoading?: boolean
  className?: string
}

const rankIcons = [
  <Crown key="1" className="w-4 h-4 text-amber-500" />,
  <Medal key="2" className="w-4 h-4 text-slate-400" />,
  <Award key="3" className="w-4 h-4 text-amber-700" />,
]

const rankColors = [
  'bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/20',
  'bg-gradient-to-r from-slate-400/10 to-transparent border-slate-400/20',
  'bg-gradient-to-r from-amber-700/10 to-transparent border-amber-700/20',
]

export function TeamRanking({ members, isLoading = false, className }: TeamRankingProps) {
  const sorted = [...members].sort((a, b) => b.score - a.score)

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-3.5 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="w-10 h-6 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Team Ranking
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {sorted.map((member, index) => (
          <div
            key={member.id}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg border border-transparent transition-colors",
              index < 3 ? rankColors[index] : 'hover:bg-muted/30'
            )}
          >
            {/* Rank */}
            <div className="w-6 h-6 flex items-center justify-center shrink-0">
              {index < 3 ? rankIcons[index] : (
                <span className="text-xs text-muted-foreground font-medium">
                  {index + 1}
                </span>
              )}
            </div>

            {/* Avatar */}
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs font-medium">
                {member.initials}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{member.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{member.department}</p>
            </div>

            {/* Score */}
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-bold tabular-nums shrink-0",
                member.score >= 90 ? 'text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800' :
                member.score >= 80 ? 'text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800' :
                'text-muted-foreground'
              )}
            >
              {member.score}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
