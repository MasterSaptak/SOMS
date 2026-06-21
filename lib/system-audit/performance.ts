import { createClient } from '@supabase/supabase-js'
import { AuditResult, AuditFinding } from './types'

const getSupabaseService = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function auditPerformance(): Promise<AuditResult> {
  const start = Date.now()
  const supabase = getSupabaseService()
  
  const { data, error } = await supabase.rpc('audit_performance')

  if (error || !data) {
    return {
      status: 'ERROR',
      score: 0,
      warnings: 0,
      errors: 1,
      critical: 1,
      findings: [{
        id: 'perf-engine-fail',
        issue: 'Engine Connection Failed',
        severity: 'critical',
        riskLevel: 'high',
        description: error?.message || 'Failed to connect to Performance engine.',
        repairable: false,
      }],
      metadata: { coverage: 0, confidence: 0, dataSource: 'RPC Failed', durationMs: Date.now() - start, lastScan: new Date().toISOString(), objectsScanned: 0, objectsSkipped: 0 },
      details: {}
    }
  }

  const rawFindings: any[] = data.findings || [];
  const findings: AuditFinding[] = rawFindings.map((f, idx) => ({
    id: `perf-finding-${idx}`,
    issue: f.issue || 'Performance Warning',
    severity: f.severity || 'medium',
    riskLevel: 'medium' as const,
    description: `Table ${f.table_name} has ${f.seq_scan_count} sequential scans.`,
    whyItMatters: 'Sequential scans bypass indexes, resulting in massive CPU and Disk I/O usage at scale.',
    affectedObjects: [f.table_name].filter(Boolean),
    display_repair_sql: f.repair_sql,
    repairable: false,
  }))

  const warnings = findings.filter(f => f.severity === 'medium').length

  const score = Math.max(0, 100 - (warnings * 3));
  let status: 'READY' | 'WARNING' | 'ERROR' = 'READY';
  if (warnings > 0) status = 'WARNING';

  return {
    status,
    score,
    warnings,
    errors: 0,
    critical: 0,
    findings,
    metadata: {
      coverage: data.coverage || 90,
      confidence: data.confidence || 90,
      dataSource: 'pg_stat_user_tables',
      durationMs: Date.now() - start,
      lastScan: new Date().toISOString(),
      objectsScanned: rawFindings.length,
      objectsSkipped: 0
    },
    details: data
  }
}
