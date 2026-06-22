import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { Loader2, ArrowUpRight } from 'lucide-react'

export interface WidgetShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  action?: React.ReactNode
  isLoading?: boolean
  href?: string
}

export function WidgetShell({
  title,
  subtitle,
  action,
  isLoading,
  href,
  className,
  children,
  ...props
}: WidgetShellProps) {
  const content = (
    <>
      {(title || action) && (
        <div className="flex items-start justify-between px-6 pt-6 pb-2 relative z-20">
          <div className="flex flex-col gap-1">
            {title && <h3 className="text-xs font-bold tracking-wider uppercase text-foreground/70">{title}</h3>}
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action && <div className="ml-4">{action}</div>}
          {!action && href && (
            <div className="ml-4 w-8 h-8 rounded-full bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-colors cursor-pointer text-foreground/60 hover:text-foreground">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          )}
        </div>
      )}
      
      <div className={cn("flex-1 px-6 pb-6 relative z-10 flex flex-col justify-end", !title && "pt-6")}>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-primary/50 backdrop-blur-sm z-30 rounded-[24px]">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : null}
        {children}
      </div>
    </>
  )

  const Wrapper = href ? motion.a : motion.div

  return (
    <Wrapper
      href={href}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative flex flex-col w-full h-full overflow-hidden rounded-[28px] bg-card border border-border/50 shadow-sm transition-all hover:shadow-lg hover:border-border/80 group",
        className
      )}
      {...props as any}
    >
      {content}
    </Wrapper>
  )
}
