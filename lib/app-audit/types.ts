export type AppSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type ArtifactType = 
  | 'api_route' 
  | 'server_action' 
  | 'repository' 
  | 'service' 
  | 'component' 
  | 'schema' 
  | 'type' 
  | 'config' 
  | 'unknown';

export interface AppArtifactMetadata {
  path: string;
  type: ArtifactType;
  dependencies: string[]; // List of imported modules
  exports: string[];      // List of exported symbols
  imports: { name: string; source: string }[];
  complexityScore: number; // Rough AST node count or branch count
  ownership?: string;
  confidence: number;
}

export interface ApplicationInventory {
  artifacts: AppArtifactMetadata[];
  metrics: {
    totalFiles: number;
    totalApiRoutes: number;
    totalComponents: number;
    totalRepositories: number;
    averageComplexity: number;
  };
}

export interface AppAuditFinding {
  id: string;
  file: string; 
  issue: string;
  severity: AppSeverity;
  description: string;
  whyItMatters: string;
  line?: number;
  snippet?: string; 
  repairable: boolean; 
  repairSnippet?: string; 
}

export interface AppAuditMetadata {
  filesScanned: number;
  filesSkipped: number;
  durationMs: number;
  dataSource: string; 
}

export interface AppAuditResult {
  moduleName: string;
  score: number;
  status: 'PASS' | 'WARNING' | 'FAIL';
  findings: AppAuditFinding[];
  metadata: AppAuditMetadata;
}

export interface AppEngineReport {
  inventory: ApplicationInventory;
  apiRoutes: AppAuditResult;
  authentication: AppAuditResult;
  repositories: AppAuditResult;
  overallScore: number;
  status: 'PASS' | 'FAIL';
  scannedAt: string;
}
