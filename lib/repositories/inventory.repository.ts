import { BaseRepository } from './base.repository'
import { Result, success, failure } from '@/lib/utils/result'
import { getAdminClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type Asset = Database['public']['Tables']['assets']['Row']
type Consumable = Database['public']['Tables']['consumables']['Row']
type InventoryCheckup = Database['public']['Tables']['inventory_checkups']['Row']

export class InventoryRepository extends BaseRepository<Asset> {
  constructor() {
    super('assets')
  }

  // ==========================================
  // ASSETS
  // ==========================================
  
  async getAssets(organizationId: string): Promise<Result<Asset[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('assets')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return success(data as Asset[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async createAsset(payload: any): Promise<Result<Asset>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('assets')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error
      return success(data as Asset)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ==========================================
  // CONSUMABLES
  // ==========================================

  async getConsumables(organizationId: string): Promise<Result<Consumable[]>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('consumables')
        .select('*')
        .eq('organization_id', organizationId)
        .order('name', { ascending: true })

      if (error) throw error
      return success(data as Consumable[])
    } catch (error) {
      return failure(error as Error)
    }
  }

  async createConsumable(payload: any): Promise<Result<Consumable>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('consumables')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error
      return success(data as Consumable)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async updateConsumableQuantity(id: string, newQuantity: number): Promise<Result<Consumable>> {
    try {
      const client = await this.getClient()
      
      // Determine status based on quantity (requires fetching minimum_stock first, or client provides it)
      // For simplicity, we just update quantity here and calculate status in action
      
      const { data, error } = await client
        .from('consumables')
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return success(data as Consumable)
    } catch (error) {
      return failure(error as Error)
    }
  }

  // ==========================================
  // INVENTORY CHECKUPS
  // ==========================================

  async logCheckup(payload: any): Promise<Result<InventoryCheckup>> {
    try {
      const client = await this.getClient()
      const { data, error } = await client
        .from('inventory_checkups')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error
      return success(data as InventoryCheckup)
    } catch (error) {
      return failure(error as Error)
    }
  }

  async getCheckups(organizationId: string, itemType: string, itemId: string): Promise<Result<any[]>> {
    try {
      const client = await this.getClient()
      // We want to join with employees to get performed_by name
      const { data, error } = await client
        .from('inventory_checkups')
        .select(`
          *,
          employees ( full_name, email )
        `)
        .eq('organization_id', organizationId)
        .eq('item_type', itemType)
        .eq('item_id', itemId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return success(data)
    } catch (error) {
      return failure(error as Error)
    }
  }
}

export const inventoryRepository = new InventoryRepository()
