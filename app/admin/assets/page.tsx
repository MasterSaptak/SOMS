"use client"

import React from "react"
import { Package, Plus, Search, Filter } from "lucide-react"

export default function AssetsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
            <Package className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Asset Management</h1>
            <p className="text-sm text-muted-foreground">Track and manage company assets, equipment, and inventory.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[400px] border border-dashed border-border/60 rounded-2xl bg-muted/10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-500/5 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8 text-orange-500/60" />
          </div>
          <h3 className="font-semibold text-lg">Asset Management Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Track laptops, monitors, furniture, and other company equipment. Assign assets to employees and manage inventory.
          </p>
        </div>
      </div>
    </div>
  )
}
