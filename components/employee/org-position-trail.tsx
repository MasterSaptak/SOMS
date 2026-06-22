import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function OrgPositionTrail({ employeeId }: { employeeId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [chain, setChain] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTrail() {
      setIsLoading(true)
      const newChain = []
      let currentId = employeeId

      // Fetch up to 4 levels of managers to prevent infinite loops
      for (let i = 0; i < 4; i++) {
        if (!currentId) break
        
        const { data, error } = await (supabase as any)
          .from('employees')
          .select('id, full_name, manager_id')
          .eq('id', currentId)
          .single()

        if (error || !data) break

        newChain.unshift(data) // add to front so top-most manager is first
        currentId = data.manager_id
      }

      setChain(newChain)
      setIsLoading(false)
    }

    if (employeeId) loadTrail()
  }, [employeeId, supabase])

  if (isLoading) return <div className="animate-pulse bg-muted h-6 w-64 rounded"></div>
  if (chain.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      {chain.map((emp, index) => (
        <React.Fragment key={emp.id}>
          <div 
            onClick={() => {
              if (index < chain.length - 1) {
                router.push(`/employee/${emp.id}`)
              }
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
              index < chain.length - 1 
                ? 'bg-muted/50 hover:bg-muted cursor-pointer text-muted-foreground' 
                : 'bg-primary/10 text-primary font-medium'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>{emp.full_name || 'Unknown'}</span>
          </div>
          {index < chain.length - 1 && (
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
