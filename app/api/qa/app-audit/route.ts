import { NextResponse } from 'next/server'
import { AppEngineReport } from '@/lib/app-audit/types'
import { auditApiRoutes } from '@/lib/app-audit/api-routes'
import { auditAuthentication } from '@/lib/app-audit/auth-check'
import { auditRepositories } from '@/lib/app-audit/repositories'
import { runProjectDiscovery } from '@/lib/app-audit/discovery'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const inventory = runProjectDiscovery()
    const apiRoutesResult = auditApiRoutes()
    const authResult = auditAuthentication()
    const reposResult = auditRepositories()

    const allResults = [apiRoutesResult, authResult, reposResult]
    const overallScore = Math.round(allResults.reduce((acc, r) => acc + r.score, 0) / allResults.length)
    
    let status: 'PASS' | 'FAIL' = 'PASS'
    if (allResults.some(r => r.status === 'FAIL')) status = 'FAIL'

    const report: AppEngineReport = {
      inventory,
      apiRoutes: apiRoutesResult,
      authentication: authResult,
      repositories: reposResult,
      overallScore,
      status,
      scannedAt: new Date().toISOString()
    }

    return NextResponse.json(report)

  } catch (error: any) {
    console.error('App Audit Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    )
  }
}
