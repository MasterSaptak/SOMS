"use client"

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, ChevronDown, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EmployeeNode {
  id: string
  full_name: string
  profile_photo: string | null
  manager_id: string | null
  department: string | null
  designation: string | null
  children: EmployeeNode[]
}

function buildTree(employees: any[]): EmployeeNode[] {
  const map = new Map<string, EmployeeNode>()
  const roots: EmployeeNode[] = []

  // Initialize nodes
  employees.forEach(emp => {
    map.set(emp.id, { ...emp, children: [] })
  })

  // Build hierarchy
  employees.forEach(emp => {
    const node = map.get(emp.id)!
    if (emp.manager_id && map.has(emp.manager_id)) {
      map.get(emp.manager_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function OrgNode({ node, level = 0 }: { node: EmployeeNode; level?: number }) {
  const [isExpanded, setIsExpanded] = React.useState(true)
  const hasChildren = node.children.length > 0

  return (
    <div className="flex flex-col relative">
      <div className={cn("flex items-center gap-4 py-2", level > 0 && "ml-8")}>
        {/* Connector lines logic could go here for advanced styling */}
        <Card className="min-w-[280px] hover:border-primary/50 transition-colors">
          <CardContent className="p-3 flex items-center justify-between gap-3">
            <Link href={`/employee/${node.id}`} className="flex items-center gap-3 flex-1 group">
              <Avatar className="h-10 w-10 border group-hover:border-primary transition-colors">
                <AvatarImage src={node.profile_photo || ''} />
                <AvatarFallback className="bg-primary/5 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                  {node.full_name}
                </span>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {node.designation || 'Employee'} {node.department ? ` • ${node.department}` : ''}
                </span>
              </div>
            </Link>
            {hasChildren && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
          </CardContent>
        </Card>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden flex flex-col relative"
          >
            {/* Vertical line connecting children */}
            <div 
              className="absolute left-[39px] top-0 bottom-6 w-px bg-border/50" 
              style={{ display: level === 0 ? 'block' : 'block' }}
            />
            {node.children.map(child => (
              <OrgNode key={child.id} node={child} level={level + 1} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function OrganizationChartClient({ initialEmployees }: { initialEmployees: any[] }) {
  const tree = useMemo(() => buildTree(initialEmployees), [initialEmployees])

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-xl">
        <User className="w-12 h-12 mb-4 opacity-20" />
        <p>No organizational data found.</p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto pb-12">
      <div className="min-w-max pr-8">
        {tree.map(root => (
          <OrgNode key={root.id} node={root} />
        ))}
      </div>
    </div>
  )
}
