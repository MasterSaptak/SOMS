"use client"

import React, { useState } from "react"
import { Users, LayoutTemplate, Shield, Activity, Search, BarChart3, FileSpreadsheet } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import PeopleDirectoryClient from "../people/PeopleDirectoryClient"
import StructureVisualTree from "./StructureVisualTree"
import PermissionsMatrix from "./PermissionsMatrix"
import ActivityTimeline from "./ActivityTimeline"

interface PaginatedPeople {
  data: any[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

interface WorkforceWorkspaceProps {
  stats: {
    totalPeople: number
    activePeople: number
    onLeave: number
    probation: number
    newHires: number
  }
  initialPeopleData: PaginatedPeople
  filterOptions: any
  organizationId: string | null
}

export function WorkforceWorkspace({ stats, initialPeopleData, filterOptions, organizationId }: WorkforceWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("people")
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["people"]))
  const [globalSearch, setGlobalSearch] = useState("")

  const handleTabChange = (val: string) => {
    setActiveTab(val)
    setVisitedTabs(prev => new Set(prev).add(val))
  }

  // Linear-style segmented buttons for tabs
  const tabItems = [
    { id: 'people', label: 'People', icon: Users },
    { id: 'structure', label: 'Structure', icon: LayoutTemplate },
    { id: 'permissions', label: 'Permissions', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, disabled: true },
    { id: 'reports', label: 'Reports', icon: FileSpreadsheet, disabled: true },
  ]

  return (
    <div className="flex flex-col h-full space-y-0">
      {/* Workspace Header Area */}
      <div className="bg-surface-base px-2 pt-2 pb-4 shrink-0 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Workforce</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Manage employees and organization structure</p>
            </div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border/60 rounded-full focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Interactive KPI Cards (Filters) */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'total', label: 'Employees', value: stats.totalPeople, color: 'text-foreground' },
            { id: 'active', label: 'Active', value: stats.activePeople, color: 'text-emerald-500' },
            { id: 'leave', label: 'On Leave', value: stats.onLeave, color: 'text-blue-500' },
            { id: 'new', label: 'New Hires', value: stats.newHires, color: 'text-violet-500' },
          ].map(stat => (
            <button 
              key={stat.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-border/50 bg-card hover:bg-accent/50 hover:border-border transition-all whitespace-nowrap shadow-sm group"
            >
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{stat.label}</span>
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Segmented Tabs & Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1 overflow-hidden">
        <div className="px-2 shrink-0">
          <TabsList className="bg-muted/50 p-1 rounded-xl inline-flex h-auto space-x-1 border border-border/50 shadow-sm">
            {tabItems.map(item => (
              <TabsTrigger
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground hover:text-foreground data-[state=active]:scale-100 flex items-center gap-2"
              >
                <item.icon size={15} className="opacity-70" />
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden mt-4 relative">
          <TabsContent value="people" forceMount hidden={activeTab !== 'people'} className="h-full m-0 p-0 outline-none data-[state=inactive]:hidden">
            {visitedTabs.has('people') && (
              <PeopleDirectoryClient 
                initialData={initialPeopleData}
                filterOptions={filterOptions}
                organizationId={organizationId}
                searchQuery={globalSearch}
              />
            )}
          </TabsContent>

          <TabsContent value="structure" forceMount hidden={activeTab !== 'structure'} className="h-full m-0 p-0 outline-none data-[state=inactive]:hidden">
            {visitedTabs.has('structure') && (
              <StructureVisualTree />
            )}
          </TabsContent>

          <TabsContent value="permissions" forceMount hidden={activeTab !== 'permissions'} className="h-full m-0 p-0 outline-none data-[state=inactive]:hidden">
            {visitedTabs.has('permissions') && (
              <div className="py-2">
                <PermissionsMatrix />
              </div>
            )}
          </TabsContent>

          <TabsContent value="activity" forceMount hidden={activeTab !== 'activity'} className="h-full m-0 p-0 outline-none data-[state=inactive]:hidden overflow-y-auto pt-2 pb-10">
            {visitedTabs.has('activity') && (
              <ActivityTimeline />
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
