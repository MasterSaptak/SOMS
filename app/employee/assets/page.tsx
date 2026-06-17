"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MOCK_ASSETS, MOCK_ASSET_ASSIGNMENTS, MOCK_EMPLOYEES, getFullName } from '@/lib/mock-data'
import { ASSET_CATEGORIES, ASSET_CONDITIONS } from '@/lib/constants'
import { useAuthStore } from '@/store/use-auth-store'
import { Search, Monitor, Laptop, Smartphone, Headphones, Package, AlertTriangle } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const assetIcons: Record<string, React.ReactNode> = {
  laptop: <Laptop className="w-5 h-5" />,
  desktop: <Monitor className="w-5 h-5" />,
  monitor: <Monitor className="w-5 h-5" />,
  phone: <Smartphone className="w-5 h-5" />,
  accessory: <Headphones className="w-5 h-5" />,
}

export default function AssetsPage() {
  const { employee } = useAuthStore()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('my-assets')

  const myAssignments = MOCK_ASSET_ASSIGNMENTS.filter(a => a.employeeId === employee?.id && !a.returnedDate)
  const myAssets = myAssignments.map(a => ({ ...MOCK_ASSETS.find(as => as.id === a.assetId)!, assignment: a })).filter(a => a.id)

  const allAssets = MOCK_ASSETS.filter(a => search === '' || a.name.toLowerCase().includes(search.toLowerCase()))

  const expiringWarranties = MOCK_ASSETS.filter(a => {
    const expiry = new Date(a.warrantyExpiry)
    const now = new Date()
    const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diffDays <= 90 && diffDays > 0
  })

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-bold tracking-tight">Asset Management</h1>
        <p className="text-muted-foreground mt-1">View and manage your assigned equipment</p>
      </motion.div>

      {/* Category summary */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.keys(ASSET_CATEGORIES) as Array<keyof typeof ASSET_CATEGORIES>).map(cat => {
          const count = MOCK_ASSETS.filter(a => a.category === cat).length
          return (
            <Card key={cat} className="hover:border-primary/20 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{assetIcons[cat]}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{ASSET_CATEGORIES[cat].label}</p>
                  <p className="text-lg font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="my-assets" className="gap-1.5"><Package className="w-3.5 h-3.5" />My Assets<span className="ml-1 text-[10px] bg-muted rounded-full px-1.5 py-0.5">{myAssets.length}</span></TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5"><Monitor className="w-3.5 h-3.5" />All Assets</TabsTrigger>
          {expiringWarranties.length > 0 && (
            <TabsTrigger value="warranty" className="gap-1.5"><AlertTriangle className="w-3.5 h-3.5" />Warranty Alerts<span className="ml-1 text-[10px] bg-destructive text-destructive-foreground rounded-full px-1.5 py-0.5">{expiringWarranties.length}</span></TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-assets">
          {myAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16"><Package className="w-12 h-12 text-muted-foreground/20 mb-3" /><p className="text-sm text-muted-foreground">No assets assigned to you</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAssets.map(asset => (
                <Card key={asset.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">{assetIcons[asset.category]}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">{asset.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">S/N: {asset.serialNumber}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{ASSET_CATEGORIES[asset.category].label}</Badge>
                        <Badge variant="outline" className={`text-[10px] ${ASSET_CONDITIONS[asset.condition].color}`}>{ASSET_CONDITIONS[asset.condition].label}</Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-2">Assigned {new Date(asset.assignment.assignedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          <div className="mb-4">
            <div className="relative max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search assets..." className="pl-9" />
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-[1fr_100px_110px_90px_90px_110px] gap-3 px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                <span>Asset</span><span>Category</span><span>Serial</span><span>Condition</span><span>Status</span><span>Assigned To</span>
              </div>
              {allAssets.map(asset => {
                const assignment = MOCK_ASSET_ASSIGNMENTS.find(a => a.assetId === asset.id && !a.returnedDate)
                const assignee = assignment ? MOCK_EMPLOYEES.find(e => e.id === assignment.employeeId) : null
                return (
                  <div key={asset.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_110px_90px_90px_110px] gap-2 md:gap-3 items-center p-4 border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-primary">{assetIcons[asset.category]}</span>
                      <span className="text-sm font-medium">{asset.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{ASSET_CATEGORIES[asset.category].label}</span>
                    <span className="text-xs font-mono text-muted-foreground">{asset.serialNumber}</span>
                    <Badge variant="outline" className={`text-[10px] w-fit ${ASSET_CONDITIONS[asset.condition].color}`}>{asset.condition}</Badge>
                    <Badge variant="outline" className={`text-[10px] w-fit ${asset.status === 'available' ? 'text-emerald-500' : asset.status === 'assigned' ? 'text-blue-500' : 'text-amber-500'}`}>{asset.status}</Badge>
                    <span className="text-xs">{assignee ? getFullName(assignee) : '—'}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty">
          <div className="flex flex-col gap-3">
            {expiringWarranties.map(asset => {
              const daysLeft = Math.ceil((new Date(asset.warrantyExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <Card key={asset.id} className="border-amber-200 dark:border-amber-800 hover:border-amber-300 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><AlertTriangle className="w-4 h-4" /></div>
                      <div>
                        <p className="text-sm font-medium">{asset.name}</p>
                        <p className="text-xs text-muted-foreground">S/N: {asset.serialNumber} · Expires {new Date(asset.warrantyExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs shrink-0">{daysLeft} days left</Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
