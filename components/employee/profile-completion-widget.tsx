"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { getProfileCompletionAction } from '@/app/actions/employee.actions'

export function ProfileCompletionWidget({ employeeId }: { employeeId: string }) {
  const [score, setScore] = useState<number | null>(null)
  const [missing, setMissing] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadScore() {
      setLoading(true)
      const res = await getProfileCompletionAction(employeeId)
      if (res.success && res.data) {
        setScore(res.data.score)
        setMissing(res.data.missing)
      }
      setLoading(false)
    }
    if (employeeId) {
      loadScore()
    }
  }, [employeeId])

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm animate-pulse">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="h-4 bg-muted w-1/2 rounded" />
          <div className="h-2 bg-muted w-full rounded" />
          <div className="h-10 bg-muted w-full rounded" />
        </CardContent>
      </Card>
    )
  }

  if (score === null) return null

  const isComplete = score === 100

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className={`border-border/50 shadow-sm ${isComplete ? 'bg-primary/5 border-primary/20' : ''}`}>
        <CardContent className="p-4 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm flex items-center gap-1.5">
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
              Profile Completion
            </h3>
            <span className={`font-bold text-lg ${isComplete ? 'text-emerald-600' : 'text-primary'}`}>
              {score}%
            </span>
          </div>

          <Progress value={score} className="h-2" />

          {!isComplete && missing.length > 0 && (
            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs text-muted-foreground font-medium">Missing items:</p>
              <ul className="flex flex-col gap-1.5">
                {missing.slice(0, 3).map((item, i) => (
                  <li key={i} className="text-xs flex items-center gap-1.5 text-muted-foreground/80">
                    <Circle className="w-3 h-3 text-border" /> {item}
                  </li>
                ))}
                {missing.length > 3 && (
                  <li className="text-[10px] text-muted-foreground italic pl-5">
                    + {missing.length - 3} more items
                  </li>
                )}
              </ul>
            </div>
          )}

          {isComplete && (
            <p className="text-xs text-emerald-600/80 font-medium">
              Profile is fully complete!
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
