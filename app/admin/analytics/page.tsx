"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart4, TrendingUp, Users, DollarSign, Activity, 
  ArrowUpRight, ArrowDownRight, Target, BrainCircuit,
  Briefcase
} from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <motion.div
      className="flex flex-col gap-6 p-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart4 className="w-8 h-8 text-primary" />
            Executive Analytics
          </h1>
          <p className="text-muted-foreground mt-1">High-level organizational performance and metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export Report</Button>
          <Button>AI Insights</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-background to-blue-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 12%
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Headcount</p>
            <h2 className="text-3xl font-bold">1,248</h2>
            <p className="text-xs text-muted-foreground mt-2">+142 this quarter</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-emerald-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 4.2%
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Avg Productivity Score</p>
            <h2 className="text-3xl font-bold">88.5</h2>
            <p className="text-xs text-muted-foreground mt-2">Target: 90.0</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-amber-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 8%
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">OKR Completion</p>
            <h2 className="text-3xl font-bold">72%</h2>
            <p className="text-xs text-muted-foreground mt-2">Q2 2026</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-background to-red-500/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-red-500" />
              </div>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                <ArrowUpRight className="w-3 h-3 mr-1" /> 2.1%
              </Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Voluntary Turnover</p>
            <h2 className="text-3xl font-bold">4.2%</h2>
            <p className="text-xs text-muted-foreground mt-2">Annualized rate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
            <CardDescription>Goal completion vs Budget utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              {[
                { name: 'Engineering', completion: 85, budget: 92 },
                { name: 'Sales & Marketing', completion: 65, budget: 88 },
                { name: 'Product & Design', completion: 90, budget: 85 },
                { name: 'Operations', completion: 78, budget: 75 },
              ].map((dept) => (
                <div key={dept.name} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-muted-foreground">{dept.completion}% Goals / {dept.budget}% Budget</span>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full opacity-50" 
                      style={{ width: `${dept.budget}%` }} 
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-primary rounded-full" 
                      style={{ width: `${dept.completion}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights Panel */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5" />
              AI Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 text-sm opacity-90 leading-relaxed">
              <p>
                <strong>Overall Health:</strong> The organization is performing strongly in Q2. Engineering and Product teams are exceeding OKR targets while maintaining budget discipline.
              </p>
              <p>
                <strong>Risk Alert:</strong> Sales goal completion is lagging at 65% while budget utilization is at 88%. Recommend reviewing pipeline velocity.
              </p>
              <p>
                <strong>Retention:</strong> Turnover is slightly elevated in Operations. Recent surveys indicate workload concerns. Recommend enabling additional automation workflows for ops tasks.
              </p>
            </div>
            <Button variant="secondary" className="w-full mt-6 bg-background text-foreground hover:bg-background/90">
              Generate Detailed Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
