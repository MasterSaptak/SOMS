import React from 'react'
import { Badge } from '@/components/ui/badge'
import { VerificationStatus } from '@/lib/types'
import { CheckCircle, Clock, XCircle } from 'lucide-react'

interface VerificationBadgeProps {
  status?: VerificationStatus
  notes?: string | null
  className?: string
  showText?: boolean
}

export function VerificationBadge({ 
  status = 'pending', 
  notes, 
  className,
  showText = true 
}: VerificationBadgeProps) {
  if (status === 'verified') {
    return (
      <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-200 gap-1 font-medium ${className || ''}`}>
        <CheckCircle className="w-3.5 h-3.5" />
        {showText && "Verified by HR"}
      </Badge>
    )
  }

  if (status === 'rejected') {
    return (
      <Badge variant="outline" className={`bg-red-50 text-red-700 border-red-200 gap-1 font-medium ${className || ''}`} title={notes || 'Verification Rejected'}>
        <XCircle className="w-3.5 h-3.5" />
        {showText && "Rejected"}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className={`bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 font-medium ${className || ''}`}>
      <Clock className="w-3.5 h-3.5" />
      {showText && "Pending Verification"}
    </Badge>
  )
}
