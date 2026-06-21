import { createClient } from '@supabase/supabase-js'
import { AuditResult, AuditFinding } from './types'

const getSupabaseService = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  )
}

export async function auditIntegrity(): Promise<AuditResult> {
  const start = Date.now()
  const supabase = getSupabaseService()
  
  const { data, error } = await supabase.rpc('audit_integrity_engine')

  if (error || !data) {
    return {
      status: 'ERROR',
      score: 0,
      warnings: 0,
      errors: 1,
      critical: 1,
      findings: [{
        id: 'integrity-engine-fail',
        issue: 'Engine Connection Failed',
        severity: 'critical',
        riskLevel: 'high',
        description: error?.message || 'Failed to connect to integrity engine',
        repairable: false,
      }],
      metadata: { coverage: 0, confidence: 0, dataSource: 'RPC Failed', durationMs: Date.now() - start, lastScan: new Date().toISOString(), objectsScanned: 0, objectsSkipped: 0 },
      details: {}
    }
  }

  const findings: AuditFinding[] = []
  if (data.duplicate_org_slugs > 0) {
    findings.push({
      id: 'integrity-dup-slugs',
      issue: 'Duplicate Organization Slugs',
      severity: 'high',
      riskLevel: 'high',
      description: `Found ${data.duplicate_org_slugs} duplicate slugs.`,
      whyItMatters: 'Slugs must be unique for correct routing and multi-tenant isolation.',
      repairable: false,
    })
  }
  if (data.duplicate_emails > 0) {
    findings.push({
      id: 'integrity-dup-emails',
      issue: 'Duplicate Auth Emails',
      severity: 'high',
      riskLevel: 'high',
      description: `Found ${data.duplicate_emails} duplicate emails in auth.users.`,
      whyItMatters: 'Duplicate emails can compromise user login and identity resolution.',
      repairable: false,
    })
  }

  const errorCount = findings.length;
  const score = Math.max(0, 100 - (errorCount * 15));
  let status: 'READY' | 'WARNING' | 'ERROR' = 'READY';
  if (errorCount > 0) status = 'ERROR';

  return {
    status,
    score,
    warnings: 0,
    errors: errorCount,
    critical: errorCount > 5 ? 1 : 0,
    findings,
    metadata: {
      coverage: 85,
      confidence: 100,
      dataSource: 'Table Scans',
      durationMs: Date.now() - start,
      lastScan: new Date().toISOString(),
      objectsScanned: 2,
      objectsSkipped: 0
    },
    details: data
  }
}
