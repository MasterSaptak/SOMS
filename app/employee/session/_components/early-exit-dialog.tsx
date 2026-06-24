"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { LogOut, AlertTriangle, Clock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatTime } from '@/lib/format-time'

const EXIT_REASONS = [
  { value: 'family_emergency', label: 'Family Emergency', icon: '👨‍👩‍👧' },
  { value: 'medical_emergency', label: 'Medical Emergency', icon: '🏥' },
  { value: 'personal_work', label: 'Personal Work', icon: '📋' },
  { value: 'internet_issue', label: 'Internet Issue', icon: '📡' },
  { value: 'power_outage', label: 'Power Outage', icon: '⚡' },
  { value: 'office_permission', label: 'Office Permission', icon: '🏢' },
  { value: 'other', label: 'Other', icon: '💬' },
]

interface EarlyExitDialogProps {
  totalWorkSeconds: number
  normalWorkSeconds: number
  onConfirm: (reason: string, notes: string) => void
  onClose: () => void
}

export function EarlyExitDialog({ totalWorkSeconds, normalWorkSeconds, onConfirm, onClose }: EarlyExitDialogProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [notes, setNotes] = useState('')

  const missingSeconds = Math.max(normalWorkSeconds - totalWorkSeconds, 0)
  const completedFormatted = formatTime(totalWorkSeconds)
  const expectedFormatted = formatTime(normalWorkSeconds)
  const missingFormatted = formatTime(missingSeconds)

  const handleSubmit = () => {
    const reasonLabel = EXIT_REASONS.find(r => r.value === selectedReason)?.label || selectedReason
    if (reasonLabel.trim()) onConfirm(reasonLabel.trim(), notes.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-lg bg-card rounded-3xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/60 bg-red-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">End Today&apos;s Session?</h2>
              <p className="text-xs text-muted-foreground">This action will close your work session for today.</p>
            </div>
          </div>

          {/* Completion Summary */}
          <div className="bg-background/60 rounded-2xl p-4 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Completed</p>
                <p className="text-2xl font-mono font-black text-foreground">{completedFormatted}</p>
              </div>
              <div className="text-muted-foreground/30 px-2">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div className="text-center flex-1">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Expected</p>
                <p className="text-2xl font-mono font-black text-muted-foreground">{expectedFormatted}</p>
              </div>
            </div>
            {missingSeconds > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  The remaining <span className="font-bold font-mono">{missingFormatted}</span> will be added to your
                  Compensation Balance and can be recovered on future working days using the daily 30-minute buffer.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Reason Selection */}
        <div className="p-6 space-y-4 max-h-[40vh] overflow-y-auto">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 block">
              Reason (Required)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {EXIT_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  onClick={() => setSelectedReason(reason.value)}
                  className={`text-left px-4 py-3 rounded-2xl border text-sm font-medium transition-all flex items-center gap-3 ${
                    selectedReason === reason.value
                      ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400 ring-1 ring-red-500/20'
                      : 'bg-muted/20 border-border/50 hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <span className="text-base">{reason.icon}</span>
                  {reason.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Additional Notes (Optional)
            </label>
            <textarea
              placeholder="Any additional context..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 rounded-2xl border border-border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 min-h-[80px]"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 p-6 border-t border-border/60">
          <Button variant="ghost" onClick={onClose} className="flex-1 rounded-full h-12 text-sm font-semibold">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="flex-1 rounded-full h-12 text-sm font-semibold gap-2 shadow-[0_0_20px_rgba(220,38,38,0.2)]"
          >
            <LogOut className="w-4 h-4" /> Confirm End Session
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
