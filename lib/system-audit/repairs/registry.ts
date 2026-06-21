import { RepairDefinition } from '../types'
import { missingUpdatedAtRepair } from './missing-updated-at'

// The Registry holds all supported repairs
const registry: Record<string, RepairDefinition> = {
  [missingUpdatedAtRepair.id]: missingUpdatedAtRepair,
}

export function getRepairDefinition(id: string): RepairDefinition {
  const repair = registry[id]
  if (!repair) {
    throw new Error(`Repair Definition '${id}' not found in registry.`)
  }
  return repair
}

export function getAllRepairs(): RepairDefinition[] {
  return Object.values(registry)
}

/**
 * Returns a topologically sorted array of repair definitions, 
 * ensuring dependencies are executed first.
 */
export function getSortedRepairs(repairs: RepairDefinition[]): RepairDefinition[] {
  const sorted: RepairDefinition[] = []
  const visited = new Set<string>()
  const visiting = new Set<string>()

  function visit(repair: RepairDefinition) {
    if (visited.has(repair.id)) return
    if (visiting.has(repair.id)) throw new Error(`Circular dependency detected: ${repair.id}`)

    visiting.add(repair.id)

    const deps = repair.dependencies || []
    for (const depId of deps) {
      // Find the dependency in the provided repairs list first
      let dep = repairs.find(r => r.id === depId)
      if (!dep) {
         // Fallback to registry if not in the list being sorted
         dep = registry[depId]
      }
      if (!dep) {
        throw new Error(`Missing dependency: ${depId} required by ${repair.id}`)
      }
      visit(dep)
    }

    visiting.delete(repair.id)
    visited.add(repair.id)
    sorted.push(repair)
  }

  for (const repair of repairs) {
    visit(repair)
  }

  return sorted
}
