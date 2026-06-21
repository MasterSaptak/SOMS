import { describe, it, expect } from 'vitest'
import { getSortedRepairs } from '../repairs/registry'
import { RepairDefinition } from '../types'

const mockContext = { findingId: 'test', targetObjects: [], executeDb: async () => [] }
const baseRepair = {
  description: '',
  isReadOnly: false,
  isOnlineSafe: true,
  requiresLock: false,
  requiresExclusiveLock: false,
  requiresMaintenanceWindow: false,
  estimateMs: 10,
  preCheck: async () => true,
  generateSql: () => '',
  verify: async () => true,
  rollback: async () => true,
  dryRun: async () => ({ explainData: {}, estimatedLockTime: '1ms' })
}

describe('Repair Registry Dependency Resolver', () => {
  it('should sort repairs according to dependencies', () => {
    const repairA: RepairDefinition = { ...baseRepair, id: 'A', name: 'A', dependencies: [] }
    const repairB: RepairDefinition = { ...baseRepair, id: 'B', name: 'B', dependencies: ['A'] }
    const repairC: RepairDefinition = { ...baseRepair, id: 'C', name: 'C', dependencies: ['B'] }

    // Add them in reverse order to ensure it sorts them
    const repairs = [repairC, repairB, repairA]
    
    // We mock the registry internal lookup by temporarily replacing it or just testing the algorithm
    // In actual implementation, `getSortedRepairs` relies on `registry` map. 
    // Since this is a unit test, we should pass the registry or mock it.
    // However, since we defined registry as a static object in registry.ts, 
    const sorted = getSortedRepairs(repairs)
    expect(sorted.map(r => r.id)).toEqual(['A', 'B', 'C'])
  })
  
  it('should throw on missing dependency', () => {
    const repairA: RepairDefinition = { ...baseRepair, id: 'A', name: 'A', dependencies: ['Z'] }
    expect(() => getSortedRepairs([repairA])).toThrow('Missing dependency')
  })
})
