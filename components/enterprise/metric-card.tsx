import React from 'react'
import { cn } from '@/lib/utils'
import { WidgetShell, WidgetShellProps } from './widget-shell'
import { Progress } from '@/components/ui/progress'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export interface MetricCardProps extends Omit<WidgetShellProps, 'title'> {
  title: string
  value: string | React.ReactNode
  trend?: {
    value: number | string
    isPositive?: boolean
    label?: string
  }
  progress?: {
    value: number
    color?: string
  }
  icon?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  trend,
  progress,
  icon,
  className,
  ...props
}: MetricCardProps) {
  return (
    <WidgetShell className={cn("justify-between", className)} {...props}>
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="flex justify-between items-start">
          <h3 className="text-xs font-bold tracking-wider uppercase text-foreground/70">{title}</h3>
          {icon && (
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-black tracking-tight">{value}</span>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                trend.isPositive === true ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" :
                trend.isPositive === false ? "bg-red-500/10 text-red-600 dark:text-red-400" :
                "bg-foreground/10 text-foreground/70"
              )}>
                {trend.isPositive === true ? <TrendingUp className="w-3 h-3" /> :
                 trend.isPositive === false ? <TrendingDown className="w-3 h-3" /> :
                 <Minus className="w-3 h-3" />}
                {trend.value}
              </div>
            )}
          </div>
          
          {trend?.label && (
            <p className="text-xs text-muted-foreground">{trend.label}</p>
          )}

          {progress && (
            <div className="mt-2">
              <Progress 
                value={progress.value} 
                className="h-1.5" 
                indicatorClassName={progress.color || "bg-primary"} 
              />
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  )
}
