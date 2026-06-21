import { AppAuditResult, AppAuditFinding } from './types'
import { getApiRoutes } from './scanner'
import path from 'path'

export function auditAuthentication(): AppAuditResult {
  const start = Date.now()
  const files = getApiRoutes()
  const findings: AppAuditFinding[] = []
  
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file.filePath)
    
    // Check if the route connects to Supabase or handles auth
    const hasSupabase = file.content.includes('supabase') || file.content.includes('@supabase')
    const hasGetUser = file.content.includes('.auth.getUser()') || file.content.includes('.auth.getSession()')
    
    if (hasSupabase && !hasGetUser) {
        // Some routes might be public deliberately. We will flag them as High risk warnings.
        findings.push({
            id: `api-no-auth-${relativePath}`,
            file: relativePath,
            issue: 'Missing Authentication Check',
            severity: 'high',
            description: `The API route ${relativePath} interacts with Supabase but does not appear to call supabase.auth.getUser() to verify the user's session.`,
            whyItMatters: 'If an endpoint modifies data without validating the user session, it is vulnerable to unauthorized access (Broken Access Control). Relying solely on RLS is good, but application-level session validation prevents anonymous abuse.',
            repairable: false
        })
    }
  })

  const critical = findings.filter(f => f.severity === 'critical').length
  const errors = findings.filter(f => f.severity === 'high').length
  
  let score = 100 - (critical * 20) - (errors * 10)
  if (score < 0) score = 0

  let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS'
  if (errors > 0) status = 'WARNING'
  if (critical > 0) status = 'FAIL'

  return {
    moduleName: 'Authentication',
    score,
    status,
    findings,
    metadata: {
      filesScanned: files.length,
      filesSkipped: 0,
      durationMs: Date.now() - start,
      dataSource: 'Regex Parser'
    }
  }
}
