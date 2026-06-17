"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  badge?: string
  badgeClassName?: string
  icon: React.ReactNode
  iconBg?: string
  footer?: React.ReactNode
  hoverColor?: string
  className?: string
  isLoading?: boolean
}

const itemVars = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
}

export function StatsCard({
  title,
  value,
  subtitle,
  badge,
  badgeClassName,
  icon,
  iconBg = 'bg-primary/10 text-primary',
  footer,
  hoverColor = 'hover:border-primary/30',
  className,
  isLoading = false,
}: StatsCardProps) {
  if (isLoading) {
    return (
      <motion.div variants={itemVars}>
        <Card className={cn("transition-colors", className)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="w-10 h-10 rounded-full" />
              <Skeleton className="w-16 h-5 rounded-full" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
            <Skeleton className="h-1.5 w-full mt-4 rounded-full" />
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div variants={itemVars}>
      <Card className={cn("transition-colors", hoverColor, className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
              {icon}
            </div>
            {badge && (
              <Badge variant="outline" className={cn("text-xs font-normal", badgeClassName)}>
                {badge}
              </Badge>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <span className="text-3xl font-bold">{value}</span>
          </div>
          {(subtitle || footer) && (
            <div className="mt-4">
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
              {footer}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
