import React from 'react'
import { cn } from '@/lib/utils'

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {}

export function BentoGrid({ className, children, ...props }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-[minmax(180px,auto)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export interface BentoSlotProps extends React.HTMLAttributes<HTMLDivElement> {
  span?: "1" | "wide" | "tall" | "large" | "full"
}

export function BentoSlot({ className, span = "1", children, ...props }: BentoSlotProps) {
  const spanClasses = {
    "1": "col-span-1 row-span-1",
    "wide": "col-span-1 md:col-span-2 row-span-1",
    "tall": "col-span-1 row-span-2",
    "large": "col-span-1 md:col-span-2 lg:col-span-2 row-span-2",
    "full": "col-span-1 md:col-span-3 lg:col-span-4",
  }

  return (
    <div
      className={cn(
        "flex",
        spanClasses[span],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
