"use client"

import React, { useRef, useState } from 'react'
import { motion, useAnimation, useMotionValue, useTransform } from 'motion/react'
import { Trash2 } from 'lucide-react'

interface SwipeableItemProps {
  children: React.ReactNode
  onDismiss: () => void
  rightAction?: React.ReactNode
  threshold?: number
}

export function SwipeableItem({
  children,
  onDismiss,
  rightAction = <Trash2 className="w-5 h-5" />,
  threshold = 100
}: SwipeableItemProps) {
  const [isRemoved, setIsRemoved] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const x = useMotionValue(0)
  
  const opacity = useTransform(x, [-threshold, 0], [1, 0])
  const scale = useTransform(x, [-threshold, 0], [1, 0.8])

  const handleDragEnd = async (e: any, { offset }: any) => {
    const swipe = offset.x
    
    if (swipe < -threshold) {
      await controls.start({ x: -window.innerWidth, transition: { duration: 0.2 } })
      setIsRemoved(true)
      onDismiss()
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 400, damping: 30 } })
    }
  }

  if (isRemoved) return null

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-destructive" ref={containerRef}>
      <motion.div 
        className="absolute inset-y-0 right-0 flex items-center justify-end px-6 text-destructive-foreground"
        style={{ opacity, scale }}
      >
        {rightAction}
      </motion.div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0.5, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 w-full bg-card shadow-sm border border-border/50 rounded-xl touch-pan-y"
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  )
}
