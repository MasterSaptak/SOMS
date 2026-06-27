import { BaseRepository, TableName, Row, Insert, Update } from './base.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { getCurrentOrganizationId } from '@/lib/tenant-context'

/**
 * An abstract repository that automatically injects and enforces the current
 * user's organization_id into all database operations.
 * 
 * This prevents cross-tenant data leaks at the service/repository layer
 * as an added defense-in-depth measure alongside RLS.
 */
export abstract class OrganizationScopedRepository<T extends TableName> extends BaseRepository<T> {

  /**
   * Helper to lazily resolve the current organization ID.
   */
  protected async getOrgId(): Promise<string> {
    const orgResult = await getCurrentOrganizationId()
    if (!orgResult.success) throw new Error(`Organization Scope Error: ${orgResult.error?.message}`)
    return orgResult.data!
  }

  // Override methods to enforce organization_id filter
  async findById(id: string): Promise<Result<Row<T>>> {
    try {
      const orgId = await this.getOrgId()
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('id' as never, id)
        .eq('organization_id' as never, orgId)
        .single()

      if (error) throw error
      if (!data) return failure(new Error('Record not found in this organization'))
      
      return success((data as object) as Row<T>)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findAll(limit = 100, offset = 0): Promise<Result<Row<T>[]>> {
    try {
      const orgId = await this.getOrgId()
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('organization_id' as never, orgId)
        .range(offset, offset + limit - 1)

      if (error) throw error
      
      return success(((data || []) as object[]) as Row<T>[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async create(payload: Omit<Insert<T>, 'organization_id'>): Promise<Result<Row<T>>> {
    try {
      const orgId = await this.getOrgId()
      const client = await this.getClient()
      
      // Inject organization_id securely
      const payloadWithOrg = { ...payload, organization_id: orgId }
      
      const { data, error } = await client
        .from(this.tableName)
        .insert(payloadWithOrg as never)
        .select()
        .single()

      if (error) throw error
      return success((data as object) as Row<T>)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async update(id: string, payload: Update<T>): Promise<Result<Row<T>>> {
    try {
      const orgId = await this.getOrgId()
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .update(payload as never)
        .eq('id' as never, id)
        .eq('organization_id' as never, orgId)
        .select()
        .single()

      if (error) throw error
      return success((data as object) as Row<T>)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async delete(id: string): Promise<Result<boolean>> {
    try {
      const orgId = await this.getOrgId()
      const client = await this.getClient()
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('id' as never, id)
        .eq('organization_id' as never, orgId)

      if (error) throw error
      return success(true)
    } catch (error) {
      return failure(error as Error)
    }
  }
}
