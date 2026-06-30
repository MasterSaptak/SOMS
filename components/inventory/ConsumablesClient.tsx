"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Plus, Search, Boxes, MoreVertical, Edit, Minus, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { getConsumablesAction, createConsumableAction, adjustConsumableStockAction } from "@/app/actions/inventory.actions"
import { useOrganizationStore } from "@/store/use-organization-store"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { toast } from 'sonner'

export function ConsumablesClient() {
  const { activeOrganizationId } = useOrganizationStore()
  const [items, setItems] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    category: "Office Supplies",
    description: "",
    quantity: 0,
    minimum_stock: 10,
    unit: "pcs",
    unit_price: 0,
    location: "",
    supplier: "",
  })

  const [adjustData, setAdjustData] = useState({
    adjustment: 0,
    notes: ""
  })

  const loadItems = useCallback(async () => {
    if (!activeOrganizationId) return
    setLoading(true)
    const res = await getConsumablesAction()
    if (res.success && res.data) {
      setItems(res.data)
    }
    setLoading(false)
  }, [activeOrganizationId])

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await createConsumableAction({
      ...formData,
      quantity: Number(formData.quantity),
      minimum_stock: Number(formData.minimum_stock),
      unit_price: Number(formData.unit_price)
    })
    if (res.success) {
      setIsAddOpen(false)
      toast.success('Consumable added successfully')
      loadItems()
      setFormData({ name: "", category: "Office Supplies", description: "", quantity: 0, minimum_stock: 10, unit: "pcs", unit_price: 0, location: "", supplier: "" })
    } else {
      toast.error(res.error?.message || 'Failed to add consumable')
    }
  }

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) return
    const res = await adjustConsumableStockAction(
      selectedItem.id,
      selectedItem.quantity,
      selectedItem.minimum_stock,
      Number(adjustData.adjustment),
      adjustData.notes
    )
    if (res.success) {
      setIsAdjustOpen(false)
      setSelectedItem(null)
      setAdjustData({ adjustment: 0, notes: "" })
      loadItems()
    } else {
      console.error(res.error)
    }
  }

  const filteredItems = items.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (a.category && a.category.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'In Stock': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
      case 'Low Stock': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'Out of Stock': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const openAdjustDialog = (item: any) => {
    setSelectedItem(item)
    setAdjustData({ adjustment: 0, notes: "" })
    setIsAdjustOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center">
            <Boxes className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Consumables</h1>
            <p className="text-sm text-muted-foreground">Manage supplies, components, and items tracked by quantity</p>
          </div>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" /> Add Consumable
        </Button>
      </div>

      <Card>
        <CardHeader className="p-4 border-b border-border/40">
          <div className="flex items-center">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search consumables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-transparent focus-visible:bg-transparent"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No consumables found.</TableCell></TableRow>
              ) : (
                filteredItems.map((item) => {
                  const percentage = Math.min(100, Math.max(0, (item.quantity / (item.minimum_stock * 3)) * 100))
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{item.name}</span>
                          <span className="text-xs text-muted-foreground">{item.location || 'No location set'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1.5 max-w-[150px]">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">{item.quantity} {item.unit}</span>
                            <span className="text-muted-foreground">Min: {item.minimum_stock}</span>
                          </div>
                          <Progress value={percentage} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${Number(item.unit_price || 0).toLocaleString()} / {item.unit}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openAdjustDialog(item)}>
                            Adjust
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Consumable</DialogTitle>
            <DialogDescription>Add a new supply or bulk item to inventory tracking.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Item Name</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Printer Paper A4" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="IT Accessories">IT Accessories</SelectItem>
                    <SelectItem value="Cleaning">Cleaning</SelectItem>
                    <SelectItem value="Pantry">Pantry</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Optional description" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Current Qty</Label>
                <Input type="number" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Min Stock</Label>
                <Input type="number" min="1" value={formData.minimum_stock} onChange={e => setFormData({...formData, minimum_stock: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="e.g. boxes, pcs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Unit Price ($)</Label>
                <Input type="number" step="0.01" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Supply Closet B" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Consumable</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Adjust Stock: {selectedItem?.name}</DialogTitle>
            <DialogDescription>Record a consumption or a new restock. Current quantity is {selectedItem?.quantity}.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Adjustment Quantity (Negative for usage, Positive for restock)</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" onClick={() => setAdjustData(prev => ({...prev, adjustment: prev.adjustment - 1}))}>
                  <Minus className="w-4 h-4" />
                </Button>
                <Input type="number" className="text-center text-lg font-bold" value={adjustData.adjustment} onChange={e => setAdjustData({...adjustData, adjustment: Number(e.target.value)})} />
                <Button type="button" variant="outline" onClick={() => setAdjustData(prev => ({...prev, adjustment: prev.adjustment + 1}))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                New Quantity will be: {Math.max(0, (selectedItem?.quantity || 0) + Number(adjustData.adjustment))}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason / Notes</Label>
              <Input required value={adjustData.notes} onChange={e => setAdjustData({...adjustData, notes: e.target.value})} placeholder="e.g. Taken by IT Dept, Restock arrival" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>Cancel</Button>
              <Button type="submit">Confirm Adjustment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
