import { AppAuditResult, AppAuditFinding } from './types'
import { getApiRoutes } from './scanner'
import path from 'path'

export function auditApiRoutes(): AppAuditResult {
  const start = Date.now()
  const files = getApiRoutes()
  const findings: AppAuditFinding[] = []
  
  files.forEach(file => {
    const relativePath = path.relative(process.cwd(), file.filePath)
    
    // Check for POST/PUT without Zod parsing
    const hasPostOrPut = file.content.includes('export async function POST') || file.content.includes('export async function PUT')
    const hasZod = file.content.includes('.parse(') || file.content.includes('.safeParse(') || file.content.includes('zod')
    
    if (hasPostOrPut && !hasZod) {
      findings.push({
        id: `api-no-zod-${relativePath}`,
        file: relativePath,
        issue: 'Missing Schema Validation (Zod)',
        severity: 'high',
        description: `The API route ${relativePath} accepts POST/PUT requests but does not appear to use Zod (or similar) to validate the incoming request body.`,
        whyItMatters: 'Without runtime schema validation, the API is vulnerable to unexpected payloads, type mismatch errors, and potentially NoSQL injection or mass assignment attacks if data is passed directly to the DB.',
        repairable: false, // Too complex to auto-guess schema
      })
    }

    // Basic structure checks
    if (!file.content.includes('NextResponse')) {
        findings.push({
            id: `api-no-next-response-${relativePath}`,
            file: relativePath,
            issue: 'Not using NextResponse',
            severity: 'low',
            description: `The API route ${relativePath} doesn't import NextResponse.`,
            whyItMatters: 'Standard Next.js App Router conventions expect NextResponse for API returns.',
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
    moduleName: 'API Endpoint Schema',
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
