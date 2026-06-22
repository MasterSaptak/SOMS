"use client"

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { cardEntrance } from '@/components/enterprise/motion'
import { StatusIndicator } from '@/components/enterprise/primitives/status-indicator'
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import type { WidgetState } from '@/components/enterprise/tokens'

interface WidgetShellProps {
  /** Widget title shown in header */
  title?: string
  /** Subtitle / description */
  subtitle?: string
  /** Icon shown before the title */
  icon?: React.ReactNode
  /** Actions slot rendered in header right */
  actions?: React.ReactNode
  /** Current widget state */
  state?: WidgetState
  /** Surface variant */
  surface?: 'primary' | 'secondary' | 'elevated' | 'glass'
  /** Widget content */
  children: React.ReactNode
  /** Empty state message */
  emptyMessage?: string
  /** Empty state icon */
  emptyIcon?: React.ReactNode
  /** Error message */
  errorMessage?: string
  /** Error retry callback */
  onRetry?: () => void
  /** Stable identifier for future personalization */
  widgetId?: string
  /** Additional class names */
  className?: string
  /** Header class overrides */
  headerClassName?: string
  /** Content area class overrides */
  contentClassName?: string
  /** Whether to show entrance animation */
  animate?: boolean
  /** Whether the content area should scroll */
  scrollable?: boolean
  /** Removes internal padding from content area */
  noPadding?: boolean
}

function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-3 p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer rounded-md h-4"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  )
}

export function WidgetShell({
  title,
  subtitle,
  icon,
  actions,
  state = 'idle',
  surface = 'primary',
  children,
  emptyMessage = 'No data available',
  emptyIcon,
  errorMessage = 'Something went wrong',
  onRetry,
  widgetId,
  className,
  headerClassName,
  contentClassName,
  animate: shouldAnimate = true,
  scrollable = false,
  noPadding = false,
}: WidgetShellProps) {
  const surfaceClasses = {
    primary: 'bg-surface-primary border border-border/50 shadow-sm',
    secondary: 'bg-surface-secondary border border-border/30',
    elevated: 'bg-surface-elevated border border-border/40 shadow-lg',
    glass: 'bg-surface-primary/70 backdrop-blur-xl border border-border/30 shadow-md',
  }

  const hasHeader = title || subtitle || icon || actions

  const Wrapper = shouldAnimate ? motion.div : 'div'
  const animationProps = shouldAnimate
    ? { variants: cardEntrance, initial: 'hidden', animate: 'show' }
    : {}

  return (
    <Wrapper
      {...(animationProps as any)}
      data-widget-id={widgetId}
      className={cn(
        'rounded-2xl overflow-hidden flex flex-col relative widget-hover',
        surfaceClasses[surface],
        className
      )}
    >
      {/* Updating state — top progress bar */}
      {state === 'updating' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted overflow-hidden z-10">
          <div className="h-full w-1/3 bg-primary rounded-full loading-bar" />
        </div>
      )}

      {/* Live indicator */}
      {state === 'live' && (
        <div className="absolute top-3 right-3 z-10">
          <StatusIndicator variant="live" showLabel size="sm" />
        </div>
      )}

      {/* Offline overlay */}
      {state === 'offline' && (
        <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-2">
          <WifiOff className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">Offline</span>
        </div>
      )}

      {/* Header */}
      {hasHeader && (
        <div
          className={cn(
            'flex items-center justify-between px-5 pt-4 pb-2',
            headerClassName
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 text-primary">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
              )}
              {subtitle && (
                <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          {actions && <div className="flex items-center gap-1.5 shrink-0 ml-3">{actions}</div>}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'flex-1 min-h-0',
          scrollable && 'overflow-y-auto',
          !noPadding && 'px-5 pb-5',
          hasHeader && !noPadding && 'pt-2',
          !hasHeader && !noPadding && 'pt-5',
          contentClassName
        )}
      >
        {state === 'loading' && <SkeletonBlock />}

        {state === 'empty' && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            {emptyIcon || (
              <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <span className="text-muted-foreground/40 text-lg">∅</span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        )}

        {state === 'error' && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            )}
          </div>
        )}

        {(state === 'idle' || state === 'updating' || state === 'live' || state === 'offline') &&
          children}
      </div>
    </Wrapper>
  )
}
