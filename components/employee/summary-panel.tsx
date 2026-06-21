import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface SummaryPanelProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  viewAllHref?: string
  className?: string
}

export function SummaryPanel({ title, icon, children, viewAllHref, className = '' }: SummaryPanelProps) {
  return (
    <Card className={`overflow-hidden border-border/50 h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="text-primary">
            {icon}
          </div>
          {title}
        </div>
        {viewAllHref && (
          <Link href={viewAllHref} className="flex items-center gap-0.5 text-xs text-primary hover:underline font-medium">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        {children}
      </CardContent>
    </Card>
  )
}
