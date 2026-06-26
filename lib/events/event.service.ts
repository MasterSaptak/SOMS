import { getAdminClient } from '@/lib/supabase/server'

export type EventPriority = 'critical' | 'high' | 'medium' | 'low' | 'informational'
export type EventVisibility = 'private' | 'team' | 'department' | 'public'
export type EventSource = 'task' | 'project' | 'leave' | 'meeting' | 'training' | 'mission' | 'goal'

export interface EnterpriseEvent {
  id: string
  organization_id: string
  source: EventSource
  source_id: string
  event_type: string
  title: string
  description: string | null
  start_at: string | null
  end_at: string | null
  owner_id: string | null
  participants: string[]
  priority: EventPriority
  status: string
  visibility: EventVisibility
  metadata: any
  created_at: string
  updated_at: string
}

export class EventService {
  /**
   * Fetch events for the organization within a specific date range.
   */
  static async getEventsByDateRange(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    sourceFilter?: EventSource[]
  ): Promise<EnterpriseEvent[]> {
    const supabase: any = getAdminClient()

    let query = supabase
      .from('enterprise_events')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('start_at', startDate.toISOString())
      .lte('end_at', endDate.toISOString())

    if (sourceFilter && sourceFilter.length > 0) {
      query = query.in('source', sourceFilter)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching enterprise events:', error)
      return []
    }

    return data as unknown as EnterpriseEvent[]
  }

  /**
   * Fetch events assigned to or owned by a specific employee.
   */
  static async getEventsByOwner(
    organizationId: string,
    ownerId: string,
    limit: number = 50
  ): Promise<EnterpriseEvent[]> {
    const supabase: any = getAdminClient()

    const { data, error } = await supabase
      .from('enterprise_events')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('owner_id', ownerId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching owner events:', error)
      return []
    }

    return data as unknown as EnterpriseEvent[]
  }
}
