"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  ShieldCheck, Database, CheckCircle2, AlertTriangle, 
  ShieldAlert, FileCode2, RefreshCw, Zap, 
  ChevronDown, Code2, HeartPulse, Hammer, PlaySquare, Server, Lock, Clock, AlertOctagon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { EngineReport, AuditFinding, RepairActionPayload } from '@/lib/system-audit/types'
import { AppEngineReport, AppAuditFinding, AppAuditResult } from '@/lib/app-audit/types'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }
const itemVars = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } }

export default function QAEnterpriseDashboard() {
  const [platformTab, setPlatformTab] = useState<'database' | 'application'>('database')

  // Database State
  const [dbReport, setDbReport] = useState<EngineReport | null>(null)
  const [dbIsAuditing, setDbIsAuditing] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null)
  const [isRepairing, setIsRepairing] = useState<string | null>(null) 
  const [isDryRunning, setIsDryRunning] = useState<string | null>(null) 
  const [dryRunResults, setDryRunResults] = useState<Record<string, any>>({})
  
  const [dbActiveTab, setDbActiveTab] = useState<'overview' | 'repair_center' | 'history'>('overview')
  const [repairTab, setRepairTab] = useState<'pending' | 'completed'>('pending')

  // App State
  const [appReport, setAppReport] = useState<AppEngineReport | null>(null)
  const [appIsAuditing, setAppIsAuditing] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)

  const runDbAudit = async () => {
    setDbIsAuditing(true)
    setDbError(null)
    try {
      const res = await fetch('/api/qa/audit')
      if (!res.ok) throw new Error('Failed to run audit engine')
      const data = await res.json()
      setDbReport(data)
    } catch (err: any) {
      setDbError(err.message)
    } finally {
      setDbIsAuditing(false)
    }
  }

  const runAppAudit = async () => {
    setAppIsAuditing(true)
    setAppError(null)
    try {
      const res = await fetch('/api/qa/app-audit')
      if (!res.ok) throw new Error('Failed to run app audit engine')
      const data = await res.json()
      setAppReport(data)
    } catch (err: any) {
      setAppError(err.message)
    } finally {
      setAppIsAuditing(false)
    }
  }

  const handleDryRun = async (finding: AuditFinding) => {
    if (!finding.repairDefinitionId) return
    setIsDryRunning(finding.id)
    try {
      const payload: RepairActionPayload & { dryRun: boolean } = {
        findingId: finding.id,
        repairDefinitionId: finding.repairDefinitionId,
        targetObjects: finding.affectedObjects || [],
        dryRun: true
      }
      const res = await fetch('/api/qa/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setDryRunResults(prev => ({ ...prev, [finding.id]: data }))
    } catch (err: any) {
      alert(`Dry run failed: ${err.message}`)
    } finally {
      setIsDryRunning(null)
    }
  }

  const executeRepair = async (finding: AuditFinding) => {
    if (!finding.repairDefinitionId) return
    
    if (finding.requiresDowntime || finding.riskLevel === 'high' || finding.requiresExclusiveLock) {
      if (!window.confirm(`WARNING: This repair requires explicit execution (Downtime/Exclusive Lock).\nProceed?`)) return;
    }

    setIsRepairing(finding.id)
    try {
      const payload: RepairActionPayload = {
        findingId: finding.id,
        repairDefinitionId: finding.repairDefinitionId,
        targetObjects: finding.affectedObjects || []
      }
      const res = await fetch('/api/qa/doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Execution failed')
      }

      await runDbAudit()
      alert('Repair executed successfully. Transaction verified and system re-audited.')
    } catch (err: any) {
      alert(`Repair transaction failed and was rolled back: ${err.message}`)
    } finally {
      setIsRepairing(null)
    }
  }

  useEffect(() => { 
    runDbAudit()
    runAppAudit()
  }, [])

  if (platformTab === 'database' && dbError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <ShieldAlert className="w-12 h-12 text-red-500" />
      <h2 className="text-xl font-bold">Health Platform Engine Failed</h2>
      <p className="text-muted-foreground">{dbError}</p>
      <Button onClick={runDbAudit} variant="outline" className="gap-2"><RefreshCw className="w-4 h-4" /> Retry Audit</Button>
    </div>
  )

  if (platformTab === 'database' && (dbIsAuditing || !dbReport)) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="relative">
        <HeartPulse className="w-20 h-20 text-emerald-500 opacity-20 animate-pulse" />
        <RefreshCw className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Running 4-Layer Validation...</h2>
        <p className="text-muted-foreground max-w-md">Inspecting Infrastructure, Physical schema, Architecture standards, and Business rules.</p>
      </div>
    </div>
  )

  const dbIsReady = dbReport?.overallStatus === 'READY'

  const dbModules = dbReport ? [
    { name: 'Layer 0: Infrastructure', result: dbReport.layer0_infrastructure, icon: <Server className="w-4 h-4" /> },
    { name: 'Layer 1: Physical DB', result: dbReport.layer1_physical, icon: <Database className="w-4 h-4" /> },
    { name: 'Layer 2: Enterprise Std.', result: dbReport.layer2_best_practices, icon: <FileCode2 className="w-4 h-4" /> },
    { name: 'Layer 3: Business Rules', result: dbReport.layer3_business_rules, icon: <Zap className="w-4 h-4" /> },
  ] : []

  const dbAllFindings = dbModules.flatMap(m => m.result.findings.map(f => ({ ...f, module: m.name })))
  const dbRepairableFindings = dbAllFindings.filter(f => f.repairable)

  const mockHistoryData = dbReport ? [
    { name: 'Run 1', score: 85, coverage: 90 },
    { name: 'Run 2', score: 88, coverage: 92 },
    { name: 'Run 3', score: 82, coverage: 95 },
    { name: 'Now', score: dbReport.overallScore, coverage: 95 },
  ] : []

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      {/* Top Platform Navigation */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-max">
        <button 
          onClick={() => setPlatformTab('database')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${platformTab === 'database' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Database Auditor
        </button>
        <button 
          onClick={() => setPlatformTab('application')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${platformTab === 'application' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Application Auditor
        </button>
      </div>

      {platformTab === 'database' && dbReport && (
        <>
          <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">Database Health Platform</h1>
                <Badge variant="outline" className={`py-1 gap-1.5 ${dbIsReady ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {dbIsReady ? <><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> HEALTHY</> : <><ShieldAlert className="w-3 h-3" /> ACTION REQUIRED</>}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">4-Layer Validation with Version-Controlled Repair Registry.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={runDbAudit} variant="outline" className="gap-2" disabled={dbIsAuditing}>
                <RefreshCw className={`w-4 h-4 ${dbIsAuditing ? 'animate-spin' : ''}`} /> Re-scan
              </Button>
              <Button className={`gap-2 text-white shadow-lg ${dbIsReady ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-muted-foreground opacity-50'}`} disabled={!dbIsReady}>
                <CheckCircle2 className="w-4 h-4" /> Approve Build
              </Button>
            </div>
          </motion.div>

          <div className="flex border-b">
            <button onClick={() => setDbActiveTab('overview')} className={`px-4 py-2 text-sm border-b-2 transition-colors ${dbActiveTab === 'overview' ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground'}`}>Validation Layers</button>
            <button onClick={() => setDbActiveTab('repair_center')} className={`px-4 py-2 text-sm border-b-2 transition-colors flex items-center gap-2 ${dbActiveTab === 'repair_center' ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground'}`}>
              Repair Center {dbRepairableFindings.length > 0 && <Badge variant="destructive" className="h-5 px-1.5">{dbRepairableFindings.length}</Badge>}
            </button>
            <button onClick={() => setDbActiveTab('history')} className={`px-4 py-2 text-sm border-b-2 transition-colors ${dbActiveTab === 'history' ? 'border-primary font-medium text-foreground' : 'border-transparent text-muted-foreground'}`}>Historical Trends</button>
          </div>

          {dbActiveTab === 'overview' && (
        <motion.div variants={itemVars} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
             <Card className={`border-l-4 ${dbIsReady ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-red-500 bg-red-500/5'}`}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    {dbIsReady ? <HeartPulse className="w-8 h-8 text-emerald-500" /> : <ShieldAlert className="w-8 h-8 text-red-500" />}
                    <div>
                      <h2 className={`text-2xl font-bold ${dbIsReady ? 'text-emerald-500' : 'text-red-500'}`}>{dbIsReady ? 'System Healthy' : 'Doctor Intervention Required'}</h2>
                      <p className="text-muted-foreground text-sm">{dbIsReady ? 'All validation layers passed.' : 'Anomalies detected. Check Repair Center.'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-5xl font-black ${dbIsReady ? 'text-emerald-500' : 'text-red-500'}`}>{dbReport.overallScore}<span className="text-2xl opacity-60">%</span></div>
                  </div>
                </CardContent>
             </Card>

            <Card>
              <CardHeader><CardTitle>Validation Layers</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {dbModules.map((m) => (
                  <div key={m.name} className="p-4 rounded-lg border bg-card hover:bg-muted/50">
                    <div className="flex justify-between mb-3 font-semibold">
                      <div className="flex items-center gap-2">{m.icon} {m.name}</div>
                      <span>{m.result.score}%</span>
                    </div>
                    <Progress value={m.result.score} className="h-1.5 mb-4" />
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground text-[9px] uppercase block">Coverage</span><span className="font-semibold">{m.result.metadata.coverage}%</span></div>
                      <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground text-[9px] uppercase block">Confidence</span><span className="font-semibold">{m.result.metadata.confidence}%</span></div>
                      <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground text-[9px] uppercase block">Scanned</span><span className="font-semibold">{m.result.metadata.objectsScanned}</span></div>
                      <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground text-[9px] uppercase block">Skipped</span><span className="font-semibold">{m.result.metadata.objectsSkipped}</span></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {dbActiveTab === 'repair_center' && (
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader className="bg-muted/20 border-b p-0">
              <div className="flex">
                <button onClick={() => setRepairTab('pending')} className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${repairTab === 'pending' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>Pending Repairs</button>
                <button onClick={() => setRepairTab('completed')} className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${repairTab === 'completed' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground'}`}>Completed</button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {repairTab === 'pending' && (
                dbRepairableFindings.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground"><CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" /><p>No actionable repairs required.</p></div>
                ) : (
                  <div className="divide-y">
                    {dbRepairableFindings.map(finding => {
                      const isExpanded = expandedFinding === finding.id
                      const drData = dryRunResults[finding.id]
                      
                      return (
                        <div key={finding.id} className="bg-card">
                          <button onClick={() => setExpandedFinding(isExpanded ? null : finding.id)} className="w-full p-4 flex items-start gap-4 hover:bg-muted/50 text-left">
                            <AlertTriangle className="w-5 h-5 mt-1 text-orange-500" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Badge variant="outline" className="text-[10px] h-4 uppercase">{finding.severity}</Badge>
                                <span className="text-xs font-medium text-muted-foreground">{finding.repairDefinitionId}</span>
                              </div>
                              <p className="font-semibold text-foreground text-base">{finding.issue}</p>
                            </div>
                            <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden bg-muted/10 border-t">
                                <div className="p-6 space-y-6 text-sm">
                                  
                                  {/* Safety Metadata Section */}
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg border bg-background">
                                    <div className="flex items-center gap-2">
                                      <Lock className={`w-4 h-4 ${finding.requiresExclusiveLock ? 'text-red-500' : 'text-emerald-500'}`} />
                                      <span className="text-xs font-medium">{finding.requiresExclusiveLock ? 'Exclusive Lock Req.' : 'Shared Lock Only'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className={`w-4 h-4 ${finding.requiresDowntime ? 'text-red-500' : 'text-emerald-500'}`} />
                                      <span className="text-xs font-medium">{finding.requiresDowntime ? 'Maintenance Window Req.' : 'Online Safe'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <AlertOctagon className={`w-4 h-4 text-muted-foreground`} />
                                      <span className="text-xs font-medium">Risk: {finding.riskLevel.toUpperCase()}</span>
                                    </div>
                                  </div>

                                  <p className="text-muted-foreground">{finding.description}</p>
                                  
                                  {finding.display_repair_sql && (
                                    <div className="bg-zinc-950 p-4 rounded-lg border border-zinc-800">
                                      <span className="text-xs text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Code2 className="w-4 h-4"/> Registry Generated SQL</span>
                                      <pre className="text-emerald-400 font-mono text-xs overflow-x-auto">{finding.display_repair_sql}</pre>
                                    </div>
                                  )}

                                  {drData && (
                                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                                      <span className="font-semibold text-blue-500 mb-2 block">Dry Run Results</span>
                                      <p className="text-muted-foreground mb-2">Estimated Lock Time: {drData.estimatedLockTime}</p>
                                      <pre className="text-xs font-mono text-blue-400 overflow-x-auto">{JSON.stringify(drData.explainData, null, 2)}</pre>
                                    </div>
                                  )}

                                  <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="secondary" onClick={() => handleDryRun(finding)} disabled={isDryRunning === finding.id}>
                                      {isDryRunning === finding.id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin"/> : <PlaySquare className="w-4 h-4 mr-2"/>}
                                      Dry Run
                                    </Button>
                                    <Button onClick={() => executeRepair(finding)} disabled={isRepairing === finding.id || !finding.repairDefinitionId}>
                                      {isRepairing === finding.id ? <RefreshCw className="w-4 h-4 mr-2 animate-spin"/> : <Hammer className="w-4 h-4 mr-2"/>}
                                      Execute Transaction
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </div>
                )
              )}
              {repairTab === 'completed' && <div className="p-12 text-center text-muted-foreground">Historical repairs will appear here.</div>}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {dbActiveTab === 'history' && (
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader><CardTitle>Historical Trends</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[400px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockHistoryData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={3} activeDot={{ r: 8 }} name="Health Score" />
                    <Line type="monotone" dataKey="coverage" stroke="#10b981" strokeWidth={2} name="Coverage %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </>
      )}

      {/* APPLICATION AUDITOR VIEW */}
      {platformTab === 'application' && (
        appIsAuditing || !appReport ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold">Scanning Source Code...</h2>
              <p className="text-muted-foreground text-sm">Evaluating AST, API routes, and Typescript schemas.</p>
            </div>
          </div>
        ) : (
          <motion.div variants={itemVars} className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Application Auditor</h1>
                <p className="text-muted-foreground mt-1 text-sm">Validating API Security, Zod Schemas, and Repositories.</p>
              </div>
              <Button onClick={runAppAudit} variant="outline" className="gap-2">
                <RefreshCw className="w-4 h-4" /> Re-scan Source Code
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-6">
                 <Card className={`border-l-4 ${appReport.status === 'PASS' ? 'border-l-emerald-500 bg-emerald-500/5' : 'border-l-red-500 bg-red-500/5'}`}>
                    <CardContent className="p-6 flex justify-between items-center">
                      <div className="flex gap-4 items-center">
                        {appReport.status === 'PASS' ? <ShieldCheck className="w-8 h-8 text-emerald-500" /> : <ShieldAlert className="w-8 h-8 text-red-500" />}
                        <div>
                          <h2 className={`text-2xl font-bold ${appReport.status === 'PASS' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {appReport.status === 'PASS' ? 'Application Code Healthy' : 'Vulnerabilities Detected'}
                          </h2>
                          <p className="text-muted-foreground text-sm">AST static analysis complete.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-5xl font-black ${appReport.status === 'PASS' ? 'text-emerald-500' : 'text-red-500'}`}>{appReport.overallScore}<span className="text-2xl opacity-60">%</span></div>
                      </div>
                    </CardContent>
                 </Card>

                 {/* Results List */}
                 <div className="space-y-4">
                   {[appReport.apiRoutes, appReport.authentication, appReport.repositories].map(mod => (
                     <Card key={mod.moduleName} className={mod.status === 'FAIL' ? 'border-red-500/30' : ''}>
                       <CardHeader className="bg-muted/10 border-b p-4">
                         <div className="flex justify-between items-center">
                           <div className="flex items-center gap-2">
                             <FileCode2 className="w-4 h-4 text-primary" />
                             <CardTitle className="text-lg">{mod.moduleName}</CardTitle>
                           </div>
                           <Badge variant={mod.status === 'PASS' ? 'default' : 'destructive'} className={mod.status === 'PASS' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}>
                             {mod.status}
                           </Badge>
                         </div>
                       </CardHeader>
                       <CardContent className="p-4 space-y-4">
                         <div className="flex justify-between text-xs text-muted-foreground mb-4">
                           <span>Files Scanned: {mod.metadata.filesScanned}</span>
                           <span>Duration: {mod.metadata.durationMs}ms</span>
                         </div>
                         
                         {mod.findings.length === 0 ? (
                           <div className="text-sm text-emerald-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> No issues found.</div>
                         ) : (
                           <div className="space-y-4">
                             {mod.findings.map(f => (
                               <div key={f.id} className="p-3 bg-muted/30 rounded-lg border flex gap-3 text-sm">
                                 <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${f.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
                                 <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <Badge variant="outline" className="text-[9px] uppercase h-4 px-1">{f.severity}</Badge>
                                      <span className="font-mono text-xs text-muted-foreground">{f.file}</span>
                                   </div>
                                   <p className="font-semibold text-foreground">{f.issue}</p>
                                   <p className="text-muted-foreground mt-1 leading-relaxed">{f.description}</p>
                                   <p className="text-xs text-muted-foreground/80 mt-2 bg-background p-2 rounded border border-border/50"><span className="font-semibold text-foreground">Why it matters:</span> {f.whyItMatters}</p>
                                 </div>
                               </div>
                             ))}
                           </div>
                         )}
                       </CardContent>
                     </Card>
                   ))}
                 </div>
              </div>
              
              <div className="lg:col-span-1">
                 <Card>
                    <CardHeader>
                       <CardTitle>AST Project Inventory</CardTitle>
                       <CardDescription>Metrics from the Discovery Engine</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium">Total Files</span>
                          <Badge variant="secondary">{appReport.inventory.metrics.totalFiles}</Badge>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium">API Routes</span>
                          <Badge variant="secondary">{appReport.inventory.metrics.totalApiRoutes}</Badge>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium">Repositories</span>
                          <Badge variant="secondary">{appReport.inventory.metrics.totalRepositories}</Badge>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium">Components</span>
                          <Badge variant="secondary">{appReport.inventory.metrics.totalComponents}</Badge>
                       </div>
                       <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                          <span className="text-sm font-medium">Avg Complexity Score</span>
                          <Badge variant="secondary">{appReport.inventory.metrics.averageComplexity}</Badge>
                       </div>
                    </CardContent>
                 </Card>
              </div>
            </div>
          </motion.div>
        )
      )}

    </motion.div>
  )
}
