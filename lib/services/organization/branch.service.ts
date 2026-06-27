import { createClient } from '@/lib/supabase/server'
import { Result, success, failure } from '@/lib/utils/result'
import { logger } from '@/lib/logger/logger'

export class BranchService {
  async getBranches(orgId: string): Promise<Result<any[]>> {
    try {
      const client = await createClient()
      const { data, error } = await client
        .from('branches')
        .select('*')
        .eq('organization_id', orgId)
        .order('name')

      if (error) throw error
      return success(data || [])
    } catch (err) {
      logger.error('[BranchService] getBranches error', err)
      return failure(err as Error)
    }
  }

  async createBranch(orgId: string, data: any): Promise<Result<any>> {
    try {
      const client = await createClient()
      const { data: branch, error } = await client
        .from('branches')
        .insert({ ...data, organization_id: orgId })
        .select()
        .single()

      if (error) throw error
      return success(branch)
    } catch (err) {
      logger.error('[BranchService] createBranch error', err)
      return failure(err as Error)
    }
  }
}

export const branchService = new BranchService()
