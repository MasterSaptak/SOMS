import { NextResponse } from 'next/server'
import { RepairActionPayload } from '@/lib/system-audit/types'
import { getRepairDefinition } from '@/lib/system-audit/repairs/registry'
import { executeRepairTransaction } from '@/lib/system-audit/repairs/executor'
import { runDatabaseDoctor } from '@/lib/system-audit/audit'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const payload: RepairActionPayload & { dryRun?: boolean } = await req.json()

    if (!payload.repairDefinitionId) {
      return NextResponse.json({ error: 'Missing repairDefinitionId in payload' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )

    // Lookup the repair in the registry
    const repair = getRepairDefinition(payload.repairDefinitionId)
    
    // For Dry Run, we don't need the transaction executor, we just use Supabase to check
    if (payload.dryRun) {
      const ctx = { 
        findingId: payload.findingId, 
        targetObjects: payload.targetObjects || [],
        executeDb: async () => [] 
      }
      const result = await repair.dryRun(ctx)
      return NextResponse.json(result)
    }

    // Actually execute the repair using the Transaction Manager
    const result = await executeRepairTransaction(payload.findingId, repair, payload.targetObjects || [])

    if (!result.success) {
      // Track failed execution
      await supabase.from('repair_history').insert({
        finding_id: payload.findingId,
        repair_def_id: payload.repairDefinitionId,
        status: 'failed',
        error_message: result.errorMessage
      })
      return NextResponse.json({ error: result.errorMessage || 'Repair failed' }, { status: 500 })
    }

    // Track successful execution in repair_history
    await supabase.from('repair_history').insert({
      finding_id: payload.findingId,
      repair_def_id: payload.repairDefinitionId,
      status: 'success',
      execution_time_ms: repair.estimateMs,
      rows_affected: result.rowsAffected || 0
    })

    // Continuous Health Monitoring: Auto re-audit on success
    await runDatabaseDoctor()

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Doctor API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
