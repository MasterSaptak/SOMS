import Dexie, { Table } from 'dexie'
import { EnterpriseEvent } from '../events/event.service'

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
}

export interface CacheMetadata {
  key: string
  version: string
  schema: number
  lastSync: string
}

export class SOMSDatabase extends Dexie {
  tasks!: Table<CachedTask, string>
  projects!: Table<CachedProject, string>
  employees!: Table<CachedEmployee, string>
  enterpriseEvents!: Table<EnterpriseEvent, string>
  metadata!: Table<CacheMetadata, string>

  constructor() {
    super('SOMSTurboCache')
    
    // Schema version 1
    this.version(1).stores({
      tasks: 'id, status, assignee_id, project_id, updated_at',
      projects: 'id, status, owner_id, updated_at',
      employees: 'id, department, updated_at',
      enterpriseEvents: 'id, source, event_type, owner_id, start_at, end_at, updated_at',
      metadata: 'key' // single row table to store lastSync and app version
    })
  }
}

export const db = new SOMSDatabase()
