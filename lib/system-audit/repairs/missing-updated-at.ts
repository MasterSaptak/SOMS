import { RepairDefinition, RepairContext } from '../types'

export const missingUpdatedAtRepair: RepairDefinition = {
  id: 'missing-updated-at-trigger',
  name: 'Create updated_at Trigger',
  description: 'Creates a BEFORE UPDATE trigger to automatically update the updated_at timestamp column.',
  
  // Dependency resolution (e.g., if it depended on another repair to add the column first)
  dependencies: [],

  // Safety Metadata
  isReadOnly: false,
  isOnlineSafe: true,
  requiresLock: true,
  requiresExclusiveLock: false, // Triggers require ShareRowExclusiveLock usually, not AccessExclusive
  requiresMaintenanceWindow: false,
  estimateMs: 50,

  preCheck: async (ctx: RepairContext) => {
    const table = ctx.targetObjects[0]
    // Verify the table actually exists and has an updated_at column
    const res = await ctx.executeDb(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = $1 
        AND column_name = 'updated_at'
    `, [table])
    
    return res.length > 0
  },

  generateSql: (ctx: RepairContext) => {
    const table = ctx.targetObjects[0]
    return `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS update_${table}_updated_at ON public.${table};
      CREATE TRIGGER update_${table}_updated_at
      BEFORE UPDATE ON public.${table}
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `
  },

  verify: async (ctx: RepairContext) => {
    const table = ctx.targetObjects[0]
    // Verify the trigger was created
    const res = await ctx.executeDb(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_schema = 'public' 
        AND event_object_table = $1 
        AND trigger_name = $2
    `, [table, `update_${table}_updated_at`])
    
    return res.length > 0
  },

  rollback: async (ctx: RepairContext) => {
    const table = ctx.targetObjects[0]
    try {
      await ctx.executeDb(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON public.${table};`)
      return true
    } catch (e) {
      return false
    }
  },

  dryRun: async (ctx: RepairContext) => {
    return {
      explainData: { message: 'DDL operations cannot be EXPLAINed directly. A ShareRowExclusiveLock will be held briefly.' },
      estimatedLockTime: '< 50ms'
    }
  }
}
