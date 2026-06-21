import { SupabaseClient } from '@supabase/supabase-js'

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

export interface AuditFinding {
  id: string; 
  issue: string;
  severity: Severity;
  riskLevel: RiskLevel;
  description?: string;
  whyItMatters?: string;
  affectedObjects?: string[];
  
  repairable: boolean;
  repairDefinitionId?: string; 
  requiresExclusiveLock?: boolean;
  requiresDowntime?: boolean;
  estimatedTimeMs?: number;
  
  display_repair_sql?: string;
  display_rollback_sql?: string;
  targetObjects?: string[]; // Used by repair dispatch
}

export interface AuditMetadata {
  coverage: number;
  confidence: number;
  dataSource: string;
  durationMs: number;
  lastScan: string;
  objectsScanned: number;
  objectsSkipped: number;
  skipReason?: string;
}

export interface AuditResult {
  status: 'READY' | 'WARNING' | 'ERROR' | 'LOADING';
  score: number;
  warnings: number;
  errors: number;
  critical: number;
  findings: AuditFinding[];
  metadata: AuditMetadata;
  details: any;
}

export interface EngineReport {
  id?: string;
  layer0_infrastructure: AuditResult;
  layer1_physical: AuditResult;
  layer2_best_practices: AuditResult;
  layer3_business_rules: AuditResult;
  overallScore: number;
  totalCritical: number;
  totalHigh: number;
  totalMedium: number;
  totalLow: number;
  overallStatus: 'READY' | 'NOT READY';
  scannedAt: string;
}

// Transaction Context now uses 'pg' for raw execution, but we keep Supabase client for easy queries if needed
export interface RepairContext {
  findingId: string;
  targetObjects: string[];
  executeDb: (sql: string, params?: any[]) => Promise<any>;
}

export interface RepairDefinition {
  id: string;
  name: string;
  description: string;
  dependencies?: string[]; // Wait for these to clear before executing

  // Safety Metadata
  isReadOnly: boolean;
  isOnlineSafe: boolean;
  requiresLock: boolean;
  requiresExclusiveLock: boolean;
  requiresMaintenanceWindow: boolean;
  estimateMs: number;

  // Verification Engine Lifecycle
  preCheck(ctx: RepairContext): Promise<boolean>;
  generateSql(ctx: RepairContext): string;
  verify(ctx: RepairContext): Promise<boolean>;
  rollback(ctx: RepairContext): Promise<boolean>;

  dryRun(ctx: RepairContext): Promise<{ explainData: any; estimatedLockTime: string }>;
}

export interface RepairActionPayload {
  findingId: string;
  repairDefinitionId: string;
  targetObjects: string[];
  dryRun?: boolean;
}
