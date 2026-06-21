import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { Resource, Action } from '@/lib/rbac'

interface AuditLogOptions {
  userId?: string
  action: Action | string
  resource: Resource | string
  details?: Record<string, any>
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
}

export async function logAuditAction({
  userId,
  action,
  resource,
  details = {},
  oldValues,
  newValues
}: AuditLogOptions) {
  try {
    const supabase = await createClient()
    const headersList = await headers()
    
    // Attempt to extract IP and User-Agent
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown'
    const userAgent = headersList.get('user-agent') || 'Unknown'

    const fullDetails = {
      ...details,
      ...(oldValues ? { oldValues } : {}),
      ...(newValues ? { newValues } : {})
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId || null,
        action,
        resource,
        details: fullDetails,
        ip_address: ipAddress,
        user_agent: userAgent
      })

    if (error) {
      console.error('Failed to insert audit log:', error)
    }
  } catch (error) {
    // Audit logging should never crash the main application flow
    console.error('Audit logging exception:', error)
  }
}
