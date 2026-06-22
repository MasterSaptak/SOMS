"use client"

import React from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { staggerContainer } from '@/components/enterprise/motion'
import type { WidgetSize } from '@/components/enterprise/tokens'

// ─── BentoGrid ─── //

interface BentoGridProps {
  children: React.ReactNode
  className?: string
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg'
  /** Whether to animate children in with stagger */
  animate?: boolean
}

const gapClasses = {
  sm: '[--bento-gap:12px]',
  md: '[--bento-gap:20px]',
  lg: '[--bento-gap:24px]',
}

export function BentoGrid({ children, className, gap = 'md', animate = true }: BentoGridProps) {
  if (animate) {
    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className={cn('bento-grid', gapClasses[gap], className)}
      >
        {children}
      </motion.div>
    )
  }

  return <div className={cn('bento-grid', gapClasses[gap], className)}>{children}</div>
}

// ─── BentoSlot ─── //

interface BentoSlotProps {
  children: React.ReactNode
  /** Size preset determining column/row span */
  size?: WidgetSize
  /** Stable widget identifier for future personalization */
  widgetId?: string
  className?: string
}

const sizeClasses: Record<WidgetSize, string> = {
  hero: 'bento-hero',
  wide: 'bento-wide',
  medium: 'bento-medium',
  tall: 'bento-tall',
  small: 'bento-small',
}

export function BentoSlot({ children, size = 'medium', widgetId, className }: BentoSlotProps) {
  return (
    <div
      data-widget-id={widgetId}
      data-widget-size={size}
      className={cn('min-w-0 min-h-0', sizeClasses[size], className)}
    >
      {children}
    </div>
  )
}
