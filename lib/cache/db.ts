import Dexie, { Table } from 'dexie'
import { EnterpriseEvent } from '../events/event.service'

export interface CachedProfile {
  id: string
  role: string
  updated_at: string
  // Store any extra profile data
  [key: string]: any
}

export interface CachedOrganization {
  id: string
  name: string
  type: string // 'branch', 'department', 'team', 'role' etc.
  parent_id?: string
  updated_at: string
  [key: string]: any
}

export interface CachedTask {
  id: string
  title: string
  status: string
  priority: string
  assignee_id?: string
  due_date?: string
  project_id?: string
  metadata?: any
  updated_at: string
}

export interface CachedProject {
  id: string
  name: string
  status: string
  owner_id: string
  updated_at: string
}

export interface CachedEmployee {
  id: string
  first_name: string
  last_name: string
  department: string
  updated_at: string
  [key: string]: any
}

export interface CachedHRSetting {
  id: string
  key: string
  value: any
  updated_at: string
}

export interface CachedSetting {
  id: string
  key: string
  value: any
  updated_at: string
}

export interface CacheMetadata {
  key: string
  version: string
  schema: number
  lastSync: string
  bootstrapCompleted?: boolean
  userId?: string
}

export class SOMSDatabase extends Dexie {
  profiles!: Table<CachedProfile, string>
  organization!: Table<CachedOrganization, string>
  tasks!: Table<CachedTask, string>
  projects!: Table<CachedProject, string>
  employees!: Table<CachedEmployee, string>
  hrSettings!: Table<CachedHRSetting, string>
  settings!: Table<CachedSetting, string>
  enterpriseEvents!: Table<EnterpriseEvent, string>
  metadata!: Table<CacheMetadata, string>

  constructor() {
    super('SOMSTurboCache')
    
    // Schema version 1 (Keep for backward compatibility during upgrade)
    this.version(1).stores({
      tasks: 'id, status, assignee_id, project_id, updated_at',
      projects: 'id, status, owner_id, updated_at',
      employees: 'id, department, updated_at',
      enterpriseEvents: 'id, source, event_type, owner_id, start_at, end_at, updated_at',
      metadata: 'key' 
    })

    // Schema version 2 (Added new tables for offline-first architecture)
    this.version(2).stores({
      profiles: 'id, role, updated_at',
      organization: 'id, type, parent_id, updated_at',
      tasks: 'id, status, assignee_id, project_id, updated_at',
      projects: 'id, status, owner_id, updated_at',
      employees: 'id, department, updated_at',
      hrSettings: 'id, key, updated_at',
      settings: 'id, key, updated_at',
      enterpriseEvents: 'id, source, event_type, owner_id, start_at, end_at, updated_at',
      metadata: 'key'
    })
  }
}

export const db = new SOMSDatabase()
