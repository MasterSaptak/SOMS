import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeRepairTransaction, resetExecutionLockForTesting } from '../repairs/executor'
import { RepairDefinition } from '../types'

// Mock pg client
const mClient = {
  connect: vi.fn(),
  query: vi.fn().mockImplementation((q) => {
    if (q.includes('pg_try_advisory_xact_lock')) {
      return Promise.resolve({ rows: [{ pg_try_advisory_xact_lock: true }], rowCount: 1 })
    }
    return Promise.resolve({ rows: [], rowCount: 1 })
  }),
  end: vi.fn(),
}

vi.mock('pg', () => {
  return {
    Client: class {
      connect = mClient.connect
      query = mClient.query
      end = mClient.end
    }
  }
})

const baseRepair: RepairDefinition = {
  id: 'test',
  name: 'Test',
  description: '',
  isReadOnly: false,
  isOnlineSafe: true,
  requiresLock: false,
  requiresExclusiveLock: false,
  requiresMaintenanceWindow: false,
  estimateMs: 10,
  preCheck: async () => true,
  generateSql: () => 'UPDATE test SET x=1;',
  verify: async () => true,
  rollback: async () => true,
  dryRun: async () => ({ explainData: {}, estimatedLockTime: '1ms' })
}

describe('Transaction Manager Executor', () => {
  
  beforeEach(() => {
    vi.clearAllMocks()
    resetExecutionLockForTesting()
  })

  it('should execute full lifecycle: Lock -> PreCheck -> Begin -> Exec -> Verify -> Commit', async () => {
    const result = await executeRepairTransaction('finding-1', baseRepair, ['table1'])
    expect(result.success).toBe(true)
  })

  it('should rollback if preCheck fails', async () => {
    const failingRepair = { ...baseRepair, preCheck: async () => false }
    const result = await executeRepairTransaction('finding-2', failingRepair, ['table1'])
    expect(result.success).toBe(false)
    expect(result.errorMessage).toContain('Pre-verification failed')
  })

  it('should rollback and call custom rollback if verify fails', async () => {
    let rollbackCalled = false
    const failingVerifyRepair = { 
      ...baseRepair, 
      verify: async () => false,
      rollback: async () => { rollbackCalled = true; return true }
    }
    const result = await executeRepairTransaction('finding-3', failingVerifyRepair, ['table1'])
    expect(result.success).toBe(false)
    expect(result.errorMessage).toContain('Post-verification failed')
    expect(rollbackCalled).toBe(true)
  })
})
