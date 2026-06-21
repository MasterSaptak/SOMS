import { Client } from 'pg'
import { RepairDefinition, RepairContext } from '../types'

// Global execution lock to prevent race conditions on schema changes
let isExecuting = false

// For unit testing only
export function resetExecutionLockForTesting() {
  isExecuting = false
}

export async function executeRepairTransaction(
  findingId: string, 
  repair: RepairDefinition, 
  targetObjects: string[]
): Promise<{ success: boolean; rowsAffected?: number; errorMessage?: string }> {
  
  if (isExecuting) {
    return { success: false, errorMessage: 'Another repair is currently executing. Schema changes are queued sequentially.' }
  }

  isExecuting = true

  // Connect directly to Postgres to manage interactive transactions
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  })

  await client.connect()

  const ctx: RepairContext = {
    findingId,
    targetObjects,
    executeDb: async (sql: string, params?: any[]) => {
      const res = await client.query(sql, params)
      return res.rows
    }
  }

  try {
    // 1. Queue lock / Advisory Lock to be totally safe across nodes
    // Using an arbitrary ID for the lock
    const lockRes = await client.query('SELECT pg_try_advisory_xact_lock(192837465)')
    if (!lockRes.rows[0].pg_try_advisory_xact_lock) {
      throw new Error('Could not acquire database execution lock.')
    }

    // 2. Pre-Verification
    const preCheckPassed = await repair.preCheck(ctx)
    if (!preCheckPassed) {
      throw new Error('Pre-verification failed. Target objects are not in the expected state.')
    }

    // 3. Begin Transaction
    await client.query('BEGIN')

    try {
      // 4. Execute Generated SQL
      const sql = repair.generateSql(ctx)
      
      let rowsAffected = 0
      // We wrap execution in another try/catch so we can explicitly ROLLBACK if query fails
      try {
        const result = await client.query(sql)
        rowsAffected = result.rowCount ?? 0
      } catch (err: any) {
        throw new Error(`SQL Execution Failed: ${err.message}`)
      }

      // 5. Post-Verification
      const verifyPassed = await repair.verify(ctx)
      if (!verifyPassed) {
        // Automatically rollback inside the block
        await client.query('ROLLBACK')
        // Attempt custom rollback script if defined (run in new transaction or just individually)
        await repair.rollback(ctx)
        throw new Error('Post-verification failed. The repair did not achieve the expected state and was rolled back.')
      }

      // 6. Commit
      await client.query('COMMIT')
      return { success: true, rowsAffected }

    } catch (err: any) {
      await client.query('ROLLBACK')
      throw err
    }

  } catch (err: any) {
    return { success: false, errorMessage: err.message }
  } finally {
    await client.end()
    isExecuting = false
  }
}
