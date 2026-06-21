"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export function AuditDialogButton({ details }: { details: any }) {
  // In a full implementation, this would open a Dialog with JSON view.
  return (
    <Button variant="ghost" size="sm" onClick={() => {
      alert(JSON.stringify(details, null, 2))
    }}>
      <FileText className="w-4 h-4 mr-1" />
      View JSON
    </Button>
  )
}
