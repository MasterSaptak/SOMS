import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/supabase/types'
import { Result, success, failure } from '@/lib/utils/result'

export type TableName = keyof Database['public']['Tables']
export type Row<T extends TableName> = Database['public']['Tables'][T]['Row']
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert']
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update']

/**
 * Base abstract repository enforcing standard CRUD patterns
 * via Supabase. Every domain repository should extend this.
 */
export abstract class BaseRepository<T extends TableName> {
  protected readonly tableName: T

  constructor(tableName: T) {
    this.tableName = tableName
  }

  /**
   * Helper to lazily initialize the supabase server client.
   * Repositories are used on the server so they must await headers().
   */
  protected async getClient(): Promise<SupabaseClient<Database>> {
    return await createClient()
  }

  async findById(id: string): Promise<Result<Row<T>>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .eq('id' as never, id)
        .single()

      if (error) throw error
      if (!data) return failure(new Error('Record not found'))
      
      return success((data as object) as Row<T>)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async findAll(limit = 100, offset = 0): Promise<Result<Row<T>[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .select('*')
        .range(offset, offset + limit - 1)

      if (error) throw error
      
      return success(((data || []) as object[]) as Row<T>[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async create(payload: Insert<T>): Promise<Result<Row<T>>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .insert(payload as never)
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
      const client = await this.getClient()
      const { data, error } = await client
        .from(this.tableName)
        .update(payload as never)
        .eq('id' as never, id)
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
      const client = await this.getClient()
      const { error } = await client
        .from(this.tableName)
        .delete()
        .eq('id' as never, id)

      if (error) throw error
      return success(true)
    } catch (error) {
      return failure(error as Error)
    }
  }
}
