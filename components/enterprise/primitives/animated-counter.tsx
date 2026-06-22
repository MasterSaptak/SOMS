"use client"

import React, { useEffect, useState } from 'react'
import { useMotionValue, animate } from 'motion/react'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}: AnimatedCounterProps) {
  const [display, setDisplay] = useState('0')
  const motionValue = useMotionValue(0)

  useEffect(() => {
    const unsubscribe = motionValue.on('change', (v) => {
      setDisplay(
        v.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      )
    })

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    })

    return () => {
      unsubscribe()
      controls.stop()
    }
  }, [value, duration, decimals, motionValue])

  return (
    <span className={cn('tabular-nums', className)}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
