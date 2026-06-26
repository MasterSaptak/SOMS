'use server'

import { inventoryRepository } from '@/lib/repositories/inventory.repository'
import { permissionService } from '@/lib/services/permission.service'
import { AuthError, PermissionError } from '@/lib/errors'
import { Result, failure, success } from '@/lib/utils/result'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new AuthError('Not authenticated')

  const { data: employee } = await supabase
    .from('employees')
    .select('organization_id, id')
    .eq('user_id', user.id)
    .single()

  if (!employee?.organization_id) {
    throw new AuthError('No organization found for user')
  }

  return { userId: user.id, organizationId: employee.organization_id, employeeId: employee.id }
}

// ==========================================================
// ASSETS
// ==========================================================

export async function getAssetsAction(): Promise<Result<any[]>> {
  try {
    const { userId, organizationId } = await getAuthContext()
    
    // Check permission
    const hasPermission = await permissionService.can(userId, organizationId, 'view', 'assets')
    if (!hasPermission.data) throw new PermissionError()

    const res = await inventoryRepository.getAssets(organizationId)
    if (!res.success) throw res.error
    
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}

export async function createAssetAction(payload: any): Promise<Result<any>> {
  try {
    const { userId, organizationId } = await getAuthContext()
    
    const hasPermission = await permissionService.can(userId, organizationId, 'create', 'assets')
    if (!hasPermission.data) throw new PermissionError()

    const dataToInsert = {
      ...payload,
      organization_id: organizationId
    }

    const res = await inventoryRepository.createAsset(dataToInsert)
    if (!res.success) throw res.error
    
    revalidatePath('/admin/assets')
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}

// ==========================================================
// CONSUMABLES
// ==========================================================

export async function getConsumablesAction(): Promise<Result<any[]>> {
  try {
    const { userId, organizationId } = await getAuthContext()
    
    const hasPermission = await permissionService.can(userId, organizationId, 'view', 'assets') // reuse assets permission for now
    if (!hasPermission.data) throw new PermissionError()

    const res = await inventoryRepository.getConsumables(organizationId)
    if (!res.success) throw res.error
    
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}

export async function createConsumableAction(payload: any): Promise<Result<any>> {
  try {
    const { userId, organizationId } = await getAuthContext()
    
    const hasPermission = await permissionService.can(userId, organizationId, 'create', 'assets')
    if (!hasPermission.data) throw new PermissionError()

    // Determine status based on quantity and min stock
    const qty = payload.quantity || 0
    const min = payload.minimum_stock || 10
    let status = 'In Stock'
    if (qty === 0) status = 'Out of Stock'
    else if (qty <= min) status = 'Low Stock'

    const dataToInsert = {
      ...payload,
      organization_id: organizationId,
      status
    }

    const res = await inventoryRepository.createConsumable(dataToInsert)
    if (!res.success) throw res.error
    
    revalidatePath('/admin/consumables')
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}

export async function adjustConsumableStockAction(
  id: string, 
  currentQty: number, 
  minStock: number, 
  adjustment: number, 
  notes: string
): Promise<Result<any>> {
  try {
    const { userId, organizationId, employeeId } = await getAuthContext()
    
    const hasPermission = await permissionService.can(userId, organizationId, 'edit', 'assets')
    if (!hasPermission.data) throw new PermissionError()

    const newQty = Math.max(0, currentQty + adjustment)
    
    // Log the checkup
    await inventoryRepository.logCheckup({
      organization_id: organizationId,
      item_type: 'consumable',
      item_id: id,
      action: 'stock_adjustment',
      quantity_change: adjustment,
      performed_by: employeeId,
      notes
    })

    const res = await inventoryRepository.updateConsumableQuantity(id, newQty)
    if (!res.success) throw res.error
    
    revalidatePath('/admin/consumables')
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}

// ==========================================================
// CHECKUPS
// ==========================================================

export async function getCheckupsAction(itemType: string, itemId: string): Promise<Result<any[]>> {
  try {
    const { userId, organizationId } = await getAuthContext()
    
    const hasPermission = await permissionService.can(userId, organizationId, 'view', 'assets')
    if (!hasPermission.data) throw new PermissionError()

    const res = await inventoryRepository.getCheckups(organizationId, itemType, itemId)
    if (!res.success) throw res.error
    
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}

export async function logAssetCheckupAction(payload: any): Promise<Result<any>> {
  try {
    const { userId, organizationId, employeeId } = await getAuthContext()
    
    const hasPermission = await permissionService.can(userId, organizationId, 'edit', 'assets')
    if (!hasPermission.data) throw new PermissionError()

    const dataToInsert = {
      ...payload,
      organization_id: organizationId,
      performed_by: employeeId,
      item_type: 'asset'
    }

    const res = await inventoryRepository.logCheckup(dataToInsert)
    if (!res.success) throw res.error
    
    revalidatePath('/admin/assets')
    return success(res.data)
  } catch (error) {
    return failure(error as Error)
  }
}
