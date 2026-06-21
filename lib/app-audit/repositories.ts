import { AppAuditResult, AppAuditFinding } from './types'
import { getAllFiles } from './scanner'
import path from 'path'
import fs from 'fs'

export function auditRepositories(): AppAuditResult {
  const start = Date.now()
  const libDir = path.join(process.cwd(), 'lib')
  let files: string[] = []
  
  if (fs.existsSync(libDir)) {
      files = getAllFiles(libDir).filter(f => f.endsWith('.ts') && !f.includes('types.ts'))
  }
  
  const findings: AppAuditFinding[] = []
  
  files.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Check for N+1 queries by looking for supabase calls inside loops
    const hasLoop = content.includes('for (') || content.includes('forEach(') || content.includes('.map(')
    const hasSupabaseAwait = content.includes('await supabase') || content.includes('await db')
    
    // A rudimentary check: if both exist in the same file, flag as potential N+1 warning
    // AST is much better for this, but Regex works for V1.
    if (hasLoop && hasSupabaseAwait) {
        findings.push({
            id: `repo-n1-${relativePath}`,
            file: relativePath,
            issue: 'Potential N+1 Query Detected',
            severity: 'medium',
            description: `The file ${relativePath} contains loops and database awaits. This pattern often indicates N+1 queries.`,
            whyItMatters: 'Executing database queries inside loops severely degrades performance and scales poorly. Use `in` filters or join operations instead.',
            repairable: false
        })
    }
  })

  const critical = findings.filter(f => f.severity === 'critical').length
  const errors = findings.filter(f => f.severity === 'high').length
  const warnings = findings.filter(f => f.severity === 'medium').length
  
  let score = 100 - (critical * 20) - (errors * 10) - (warnings * 2)
  if (score < 0) score = 0

  let status: 'PASS' | 'WARNING' | 'FAIL' = 'PASS'
  if (warnings > 0) status = 'WARNING'
  if (errors > 0 || critical > 0) status = 'FAIL'

  return {
    moduleName: 'Repositories & Services',
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
