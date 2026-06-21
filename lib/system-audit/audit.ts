import { auditInfrastructureLayer } from './infrastructure'
import { auditPhysicalLayer } from './physical'
import { auditBestPracticesLayer } from './best-practices'
import { auditBusinessRulesLayer } from './business-rules'
import { EngineReport } from './types'
import { createClient } from '@supabase/supabase-js'

export async function runDatabaseDoctor(): Promise<EngineReport> {
  const layer0 = await auditInfrastructureLayer()
  const layer1 = await auditPhysicalLayer()
  
  const [layer2, layer3] = await Promise.all([
    auditBestPracticesLayer(layer1.details),
    auditBusinessRulesLayer()
  ])

  const allResults = [layer0, layer1, layer2, layer3]

  const totalCritical = allResults.reduce((sum, res) => sum + res.critical, 0)
  const totalHigh = allResults.reduce((sum, res) => sum + res.errors, 0)
  const totalMedium = allResults.reduce((sum, res) => sum + res.warnings, 0)
  const totalLow = 0

  const overallScore = Math.round(
    allResults.reduce((sum, res) => sum + res.score, 0) / allResults.length
  )

  const overallStatus = totalCritical > 0 || totalHigh > 5 ? 'NOT READY' : 'READY'

  const report: EngineReport = {
    layer0_infrastructure: layer0,
    layer1_physical: layer1,
    layer2_best_practices: layer2,
    layer3_business_rules: layer3,
    overallScore,
    totalCritical,
    totalHigh,
    totalMedium,
    totalLow,
    overallStatus,
    scannedAt: new Date().toISOString()
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    )
    
    const totalScanned = allResults.reduce((sum, r) => sum + r.metadata.objectsScanned, 0)
    const totalSkipped = allResults.reduce((sum, r) => sum + r.metadata.objectsSkipped, 0)
    const totalDuration = allResults.reduce((sum, r) => sum + r.metadata.durationMs, 0)

    const { data } = await supabase.from('audit_history').insert({
      status: overallStatus,
      overall_score: overallScore,
      critical_issues: totalCritical,
      high_issues: totalHigh,
      medium_issues: totalMedium,
      low_issues: totalLow,
      report_json: report,
      objects_scanned: totalScanned,
      objects_skipped: totalSkipped,
      run_duration_ms: totalDuration
    }).select('id').single()
    
    if (data) {
      report.id = data.id
      
      // Save findings for history tracking
      const allFindings = allResults.flatMap(m => m.findings)
      if (allFindings.length > 0) {
          const findingsPayload = allFindings.map(f => ({
              audit_id: data.id,
              module: 'various', // We could pass the layer name
              issue: f.issue,
              severity: f.severity,
              risk_level: f.riskLevel,
              repairable: f.repairable,
              repair_def_id: f.repairDefinitionId,
              target_objects: f.affectedObjects || []
          }))
          await supabase.from('audit_findings').insert(findingsPayload)
      }
    }
  } catch (err) {
    console.error('Failed to save audit history', err)
  }

  return report
}
