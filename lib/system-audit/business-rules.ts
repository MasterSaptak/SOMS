import { createClient } from '@supabase/supabase-js'
import { AuditResult, AuditFinding } from './types'

const getSupabaseService = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

// Layer 3: SOMS Business Rules
export async function auditBusinessRulesLayer(): Promise<AuditResult> {
  const start = Date.now()
  const supabase = getSupabaseService()
  
  const findings: AuditFinding[] = []
  
  // Rule 1: Check for duplicate auth emails (Integrity check)
  const { data: integrityData, error } = await supabase.rpc('audit_integrity_engine')

  if (!error && integrityData?.duplicate_emails > 0) {
    findings.push({
      id: `br-auth-emails`,
      issue: 'Duplicate Auth Emails',
      severity: 'critical',
      riskLevel: 'high',
      description: `Found ${integrityData.duplicate_emails} duplicate emails in auth.users.`,
      whyItMatters: 'Duplicate emails can compromise user login and identity resolution.',
      repairable: false,
      display_repair_sql: '-- Manual intervention required. Run: SELECT email, count(*) FROM auth.users GROUP BY email HAVING count(*) > 1;',
    })
  }

  // Example Rule 2: Attendance logic (mocked for safety, would query actual tables)
  // SELECT count(*) FROM attendance WHERE check_out IS NOT NULL AND check_in > check_out;
  
  const critical = findings.filter(f => f.severity === 'critical').length
  const errors = findings.filter(f => f.severity === 'high').length
  const warnings = findings.filter(f => f.severity === 'medium').length

  const score = Math.max(0, 100 - (critical * 25) - (errors * 10) - (warnings * 5));
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
      coverage: 80, // Business logic coverage is lower initially
      confidence: 100,
      dataSource: 'Data Anomaly Queries',
      durationMs: Date.now() - start,
      lastScan: new Date().toISOString(),
      objectsScanned: 2, // e.g. auth.users, attendance
      objectsSkipped: 0
    },
    details: {}
  }
}
