import { createClient } from '@supabase/supabase-js'
import { AuditResult, AuditFinding } from './types'

const getSupabaseService = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function auditSchema(): Promise<AuditResult> {
  const start = Date.now()
  const supabase = getSupabaseService()
  
  const { data, error } = await supabase.rpc('audit_schema_deep')

  if (error || !data) {
    return {
      status: 'ERROR',
      score: 0,
      warnings: 0,
      errors: 1,
      critical: 1,
      findings: [{
        id: 'schema-engine-fail',
        issue: 'Engine Connection Failed',
        severity: 'critical',
        riskLevel: 'high',
        description: error?.message || 'Failed to connect to schema deep engine. Did you apply the migration?',
        repairable: false,
      }],
      metadata: { coverage: 0, confidence: 0, dataSource: 'RPC Failed', durationMs: Date.now() - start, lastScan: new Date().toISOString(), objectsScanned: 0, objectsSkipped: 0 },
      details: {}
    }
  }

  const rawFindings: any[] = data.findings || [];
  const findings: AuditFinding[] = rawFindings.map((f, idx) => ({
    id: `schema-finding-${idx}`,
    issue: f.issue || 'Schema Anomaly',
    severity: f.severity || 'medium',
    riskLevel: 'medium' as const,
    description: `Detected on table: ${f.table_name || f.constraint_name}`,
    affectedObjects: [f.table_name].filter(Boolean),
    display_repair_sql: f.repair_sql,
    repairable: false,
  }))

  const critical = findings.filter(f => f.severity === 'critical').length
  const errors = findings.filter(f => f.severity === 'high').length
  const warnings = findings.filter(f => f.severity === 'medium').length

  const score = Math.max(0, 100 - (critical * 10) - (errors * 5) - (warnings * 2));
  let status: 'READY' | 'WARNING' | 'ERROR' = 'READY';
  if (warnings > 0) status = 'WARNING';
  if (critical > 0 || errors > 0) status = 'ERROR';

  return {
    status,
    score,
    warnings,
    errors,
    critical,
    findings,
    metadata: {
      coverage: data.coverage || 98,
      confidence: data.confidence || 100,
      dataSource: 'information_schema + pg_catalog',
      durationMs: Date.now() - start,
      lastScan: new Date().toISOString(),
      objectsScanned: rawFindings.length,
      objectsSkipped: 0
    },
    details: data
  }
}
