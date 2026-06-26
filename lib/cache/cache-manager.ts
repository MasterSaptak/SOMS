import { db, CachedTask, CachedProject, CachedEmployee } from './db'
import { EnterpriseEvent } from '../events/event.service'

export class CacheManager {
  static async getTasks(): Promise<CachedTask[]> {
    return await db.tasks.toArray()
  }

  static async saveTasks(tasks: CachedTask[]) {
    await db.tasks.bulkPut(tasks)
  }

  static async getProjects(): Promise<CachedProject[]> {
    return await db.projects.toArray()
  }

  static async saveProjects(projects: CachedProject[]) {
    await db.projects.bulkPut(projects)
  }

  static async getEmployees(): Promise<CachedEmployee[]> {
    return await db.employees.toArray()
  }

  static async saveEmployees(employees: CachedEmployee[]) {
    await db.employees.bulkPut(employees)
  }

  static async getEnterpriseEvents(): Promise<EnterpriseEvent[]> {
    return await db.enterpriseEvents.toArray()
  }

  static async saveEnterpriseEvents(events: EnterpriseEvent[]) {
    await db.enterpriseEvents.bulkPut(events)
  }

  static async getLastSync(): Promise<string | null> {
    const meta = await db.metadata.get('sync')
    return meta?.lastSync || null
  }

  static async updateLastSync(dateStr: string) {
    await db.metadata.put({
      key: 'sync',
      version: '1.0.0',
      schema: 1,
      lastSync: dateStr
    })
  }

  static async clearAll() {
    await db.tasks.clear()
    await db.projects.clear()
    await db.employees.clear()
    await db.enterpriseEvents.clear()
    await db.metadata.clear()
  }
}
