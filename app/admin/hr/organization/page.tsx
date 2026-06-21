"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Building2, Users, MapPin, Plus, GitBranch, Settings, LayoutList,
} from 'lucide-react'
import { OrgChartCanvas } from '@/components/org/org-chart-canvas'
import { DepartmentCard } from '@/components/org/department-card'
import { DepartmentForm } from '@/components/org/department-form'
import {
  MOCK_DEPARTMENTS, MOCK_TEAMS, MOCK_EMPLOYEES,
  MOCK_DESIGNATIONS, MOCK_WORK_LOCATIONS,
  getDepartmentEmployees,
} from '@/lib/demo/generators/legacy-mock-data'
import type { Department } from '@/lib/types'

const containerVars = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
}

export default function OrganizationPage() {
  const [formOpen, setFormOpen]               = useState(false)
  const [editingDept, setEditingDept]         = useState<Department | undefined>()

  const totalMembers = MOCK_EMPLOYEES.length

  const openAddForm  = () => { setEditingDept(undefined); setFormOpen(true) }
  const openEditForm = (dept: Department) => { setEditingDept(dept); setFormOpen(true) }

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">

      {/* Page Header */}
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organization Structure</h1>
          <p className="text-muted-foreground mt-1">
            SOMS Enterprise &nbsp;·&nbsp;
            <span className="font-medium text-foreground">{totalMembers} employees</span> across&nbsp;
            <span className="font-medium text-foreground">{MOCK_DEPARTMENTS.length} departments</span>
          </p>
        </div>
        <Button className="gap-1.5" onClick={openAddForm}>
          <Plus className="w-4 h-4" />
          Add Department
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVars}>
        <Tabs defaultValue="chart">
          <TabsList className="mb-6">
            <TabsTrigger value="chart" className="gap-1.5">
              <GitBranch className="w-3.5 h-3.5" />
              Org Chart
            </TabsTrigger>
            <TabsTrigger value="depts" className="gap-1.5">
              <LayoutList className="w-3.5 h-3.5" />
              Departments & Teams
            </TabsTrigger>
            <TabsTrigger value="config" className="gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              Structure Config
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Org Chart ── */}
          <TabsContent value="chart">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Organization Chart</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Click any employee to view their full profile
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-0 overflow-x-auto">
                <OrgChartCanvas />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Tab 2: Departments & Teams ── */}
          <TabsContent value="depts">
            <div className="flex flex-col gap-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Departments',    value: MOCK_DEPARTMENTS.length, icon: <Building2 className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
                  { label: 'Teams',          value: MOCK_TEAMS.length,       icon: <Users className="w-4 h-4" />,    color: 'text-purple-500 bg-purple-500/10' },
                  { label: 'Total Employees',value: totalMembers,             icon: <Users className="w-4 h-4" />,    color: 'text-emerald-500 bg-emerald-500/10' },
                ].map(stat => (
                  <Card key={stat.label} className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Department Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_DEPARTMENTS.map((dept, i) => (
                  <DepartmentCard
                    key={dept.id}
                    department={dept}
                    index={i}
                    onEdit={() => openEditForm(dept)}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── Tab 3: Structure Config ── */}
          <TabsContent value="config">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Designations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Designations</CardTitle>
                    <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    {[...MOCK_DESIGNATIONS]
                      .sort((a, b) => b.level - a.level)
                      .map((desig, idx) => (
                        <div
                          key={desig.id}
                          className={`flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors ${idx < MOCK_DESIGNATIONS.length - 1 ? 'border-b border-border/30' : ''}`}
                        >
                          <span className="text-sm font-medium">{desig.title}</span>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            L{desig.level}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Work Locations */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Work Locations</CardTitle>
                    <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
                      <Plus className="w-3 h-3" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {MOCK_WORK_LOCATIONS.map(loc => (
                    <div
                      key={loc.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/20 hover:bg-muted/20 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{loc.name}</p>
                        {loc.address && (
                          <p className="text-xs text-muted-foreground truncate">{loc.address}</p>
                        )}
                        <Badge variant="outline" className="text-[9px] mt-1">{loc.timezone}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Department Form Dialog */}
      <DepartmentForm
        open={formOpen}
        onOpenChange={setFormOpen}
        department={editingDept}
      />
    </motion.div>
  )
}
