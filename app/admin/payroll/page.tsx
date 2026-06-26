"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data
import { Banknote, Download, FileText, TrendingUp, Wallet, Users, ArrowUpRight } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

export default function PayrollPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const totalPayroll = ([] as any[]).reduce((sum, s) => sum + s.baseSalary + s.hra + s.da + s.specialAllowance + s.bonus, 0)
  const totalDeductions = ([] as any[]).reduce((sum, s) => sum + s.pf + s.tax + s.esi + s.professionalTax, 0)
  const netPayroll = totalPayroll - totalDeductions

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
          <p className="text-muted-foreground mt-1">Manage salaries, deductions, and payslips</p>
        </div>
        <Button className="gap-1.5"><Download className="w-4 h-4" />Export Report</Button>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: 'Total Payroll', value: formatCurrency(totalPayroll), icon: <Banknote className="w-5 h-5" />, bg: 'bg-emerald-500/10 text-emerald-500' },
          { title: 'Total Deductions', value: formatCurrency(totalDeductions), icon: <TrendingUp className="w-5 h-5" />, bg: 'bg-red-500/10 text-red-500' },
          { title: 'Net Disbursement', value: formatCurrency(netPayroll), icon: <Wallet className="w-5 h-5" />, bg: 'bg-primary/10 text-primary' },
        ].map(card => (
          <motion.div key={card.title} variants={itemVars}>
            <Card className="hover:border-primary/20 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>{card.icon}</div>
                </div>
                <span className="text-sm text-muted-foreground">{card.title}</span>
                <span className="text-2xl font-bold block mt-1">{card.value}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="gap-1.5"><Users className="w-3.5 h-3.5" />Salary Structure</TabsTrigger>
          <TabsTrigger value="payslips" className="gap-1.5"><FileText className="w-3.5 h-3.5" />Payslips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-[1fr_100px_80px_80px_80px_80px_100px] gap-3 px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                <span>Employee</span><span>Base</span><span>HRA</span><span>DA</span><span>PF</span><span>Tax</span><span>Net</span>
              </div>
              {([] as any[]).map(salary => {
                const emp = ([] as any[]).find(e => e.id === salary.employeeId)
                const gross = salary.baseSalary + salary.hra + salary.da + salary.specialAllowance + salary.bonus
                const deductions = salary.pf + salary.tax + salary.esi + salary.professionalTax
                const net = gross - deductions
                return (
                  <div key={salary.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_80px_80px_80px_80px_100px] gap-2 md:gap-3 items-center p-4 border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{emp ? (emp ? `${emp.firstName} ${emp.lastName}` : "Unknown") : '—'}</span>
                      <span className="text-[10px] text-muted-foreground">{emp?.designation?.title || (typeof emp?.designation === 'string' ? emp.designation : '—')}</span>
                    </div>
                    <span className="text-xs font-mono">{formatCurrency(salary.baseSalary)}</span>
                    <span className="text-xs font-mono">{formatCurrency(salary.hra)}</span>
                    <span className="text-xs font-mono">{formatCurrency(salary.da)}</span>
                    <span className="text-xs font-mono text-red-500">{formatCurrency(salary.pf)}</span>
                    <span className="text-xs font-mono text-red-500">{formatCurrency(salary.tax)}</span>
                    <span className="text-sm font-mono font-bold">{formatCurrency(net)}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payslips">
          <div className="flex flex-col gap-3">
            {([] as any[]).map(slip => {
              const emp = ([] as any[]).find(e => e.id === slip.employeeId)
              return (
                <Card key={slip.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp ? (emp ? `${emp.firstName} ${emp.lastName}` : "Unknown") : '—'} — {slip.month}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>Gross: {formatCurrency(slip.grossSalary)}</span>
                          <span>Deductions: {formatCurrency(slip.totalDeductions)}</span>
                          <span className="font-semibold text-foreground">Net: {formatCurrency(slip.netSalary)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[10px] ${slip.status === 'paid' ? 'text-emerald-600 border-emerald-200' : 'text-amber-600 border-amber-200'}`}>
                        {slip.status === 'paid' ? 'Paid' : 'Generated'}
                      </Badge>
                      <Button variant="ghost" size="sm" className="text-xs gap-1"><Download className="w-3.5 h-3.5" />PDF</Button>
                    </div>
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
