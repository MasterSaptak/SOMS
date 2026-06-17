"use client"

import React from 'react'
import Link from 'next/link'
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs'
import { ChevronRight } from 'lucide-react'

export function Breadcrumbs() {
  const breadcrumbs = useBreadcrumbs()

  if (breadcrumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          {index > 0 && (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
          )}
          {crumb.isCurrentPage ? (
            <span className="font-medium text-foreground truncate max-w-[200px]">
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[150px]"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
