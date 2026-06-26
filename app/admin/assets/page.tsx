"use client"

import React from "react"
import { Package, Plus, Search, Filter } from "lucide-react"
import { AssetsClient } from "@/components/inventory/AssetsClient"

export default function AssetsPage() {
  return (
    <div className="w-full">
      <AssetsClient />
    </div>
  )
}
