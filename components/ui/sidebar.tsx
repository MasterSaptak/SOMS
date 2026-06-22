"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { cn } from "@/lib/utils"
// import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

export const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (val: boolean) => void
}>({ collapsed: false, setCollapsed: () => {} })

export function SidebarProvider({ children, defaultCollapsed = false }: { children: React.ReactNode, defaultCollapsed?: boolean }) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function Sidebar({ children, className }: { children: React.ReactNode, className?: string }) {
  const { collapsed } = React.useContext(SidebarContext)
  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card/60 backdrop-blur-xl transition-all duration-300 z-30 h-screen",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {children}
    </aside>
  )
}

export function SidebarHeader({ children }: { children: React.ReactNode }) {
  const { collapsed } = React.useContext(SidebarContext)
  return (
    <div className={cn("flex h-14 items-center border-b px-4", collapsed ? "justify-center px-0" : "px-4")}>
      {children}
    </div>
  )
}

export function SidebarContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 overflow-auto py-2 flex flex-col gap-1 px-2">{children}</div>
}

export function SidebarFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t p-2">{children}</div>
}

const sidebarMenuButtonVariants = cva(
  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-muted-foreground",
  {
    variants: {
      isActive: {
        true: "bg-accent/80 text-foreground shadow-sm ring-1 ring-border/50 font-medium",
        false: "",
      },
      collapsed: {
        true: "justify-center px-0",
        false: "",
      }
    },
    defaultVariants: {
      isActive: false,
      collapsed: false
    }
  }
)

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof sidebarMenuButtonVariants> {
  icon?: React.ReactNode
  label?: string
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, isActive, icon, label, ...props }, ref) => {
    const { collapsed } = React.useContext(SidebarContext)
    
    return (
      <button
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ isActive, collapsed, className }), "w-full")}
        title={collapsed ? label : undefined}
        {...props}
      >
        {icon && <span className="flex items-center justify-center shrink-0 w-5 h-5">{icon}</span>}
        {!collapsed && !!label && <span className="flex-1 truncate text-left">{label}</span>}
        {!collapsed && props.children}
      </button>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

