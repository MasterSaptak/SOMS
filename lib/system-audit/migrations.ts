import { createClient } from '@supabase/supabase-js'
import { AuditResult, AuditFinding } from './types'

const getSupabaseService = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function auditMigrations(): Promise<AuditResult> {
  const start = Date.now()
  const supabase = getSupabaseService()
  
  const { data, error } = await supabase.rpc('audit_migrations')

  if (error || !data) {
    return {
      status: 'ERROR',
      score: 0,
      warnings: 0,
      errors: 1,
      critical: 1,
      findings: [{
        id: 'migration-engine-fail',
        issue: 'Engine Connection Failed',
        severity: 'critical',
        riskLevel: 'high',
        description: error?.message || 'Failed to connect to Migrations engine.',
        repairable: false,
      }],
      metadata: { coverage: 0, confidence: 0, dataSource: 'RPC Failed', durationMs: Date.now() - start, lastScan: new Date().toISOString(), objectsScanned: 0, objectsSkipped: 0 },
      details: {}
    }
  }

  const rawFindings: any[] = data.findings || [];
  const findings: AuditFinding[] = rawFindings.map((f, idx) => ({
    id: `migration-finding-${idx}`,
    issue: f.issue || 'Migration Error',
    severity: f.severity || 'high',
    riskLevel: 'high' as const,
    description: f.error || 'Check migration checksums or execution history.',
    display_repair_sql: f.repair_sql,
    repairable: false,
  }))

  const critical = findings.filter(f => f.severity === 'critical').length
  const errors = findings.filter(f => f.severity === 'high').length

  const score = Math.max(0, 100 - (critical * 25) - (errors * 10));
  let status: 'READY' | 'WARNING' | 'ERROR' = 'READY';
  if (errors > 0) status = 'WARNING';
  if (critical > 0) status = 'ERROR';

  return {
    status,
    score,
    warnings: 0,
    errors,
    critical,
    findings,
    metadata: {
      coverage: data.coverage || 100,
      confidence: data.confidence || 100,
      dataSource: 'supabase_migrations.schema_migrations',
      durationMs: Date.now() - start,
      lastScan: new Date().toISOString(),
      objectsScanned: rawFindings.length,
      objectsSkipped: 0
    },
    details: data
  }
}
