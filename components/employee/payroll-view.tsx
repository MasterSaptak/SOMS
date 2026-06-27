"use client"

import React from 'react'
import { WidgetShell } from '@/components/enterprise/widget-shell'
import { Banknote, Download, Calendar, TrendingUp, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const SALARY_HISTORY = [
  { month: 'June 2026', gross: '₹65,000', deductions: '₹8,200', net: '₹56,800', status: 'Pending' },
  { month: 'May 2026', gross: '₹65,000', deductions: '₹8,200', net: '₹56,800', status: 'Paid' },
  { month: 'April 2026', gross: '₹65,000', deductions: '₹7,900', net: '₹57,100', status: 'Paid' },
  { month: 'March 2026', gross: '₹62,000', deductions: '₹7,500', net: '₹54,500', status: 'Paid' },
]

export default function PayrollView() {
  return (
    <div className="flex flex-col gap-4 md:gap-6 pb-12 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight">Payroll & Compensation</h2>
        <p className="text-xs md:text-sm text-muted-foreground">View your salary slips, deductions, and payment history.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Banknote className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Net Pay</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">₹56,800</div>
          <span className="text-[10px] text-muted-foreground">June 2026</span>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">YTD Earned</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">₹3,40,800</div>
          <span className="text-[10px] text-muted-foreground">6 months</span>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Pay Date</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">Jul 1</div>
          <span className="text-[10px] text-muted-foreground">Next payout</span>
        </div>
        <div className="p-3 md:p-4 rounded-2xl bg-surface-primary border border-border/40">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Banknote className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[10px] md:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Tax Deducted</span>
          </div>
          <div className="text-lg md:text-2xl font-bold">₹49,200</div>
          <span className="text-[10px] text-muted-foreground">YTD TDS</span>
        </div>
      </div>

      {/* Salary History */}
      <WidgetShell title="Salary History" subtitle="Recent pay slips">
        <div className="flex flex-col gap-3 mt-3">
          {SALARY_HISTORY.map((item, i) => (
            <div
              key={item.month}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/60 border border-border/30"
            >
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold">{item.month}</span>
                <span className="text-xs text-muted-foreground">Gross: {item.gross} • Deductions: {item.deductions}</span>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <span className="text-sm font-bold">{item.net}</span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  item.status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'
                }`}>{item.status}</span>
              </div>
              <Button variant="ghost" size="sm" className="shrink-0 h-8 w-8 p-0">
                <Download className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </WidgetShell>

      {/* Breakdown Card */}
      <WidgetShell title="June 2026 Breakdown" subtitle="Current month salary components">
        <div className="flex flex-col gap-2 mt-3">
          {[
            { label: 'Basic Salary', value: '₹32,500' },
            { label: 'HRA', value: '₹13,000' },
            { label: 'Special Allowance', value: '₹12,500' },
            { label: 'Conveyance', value: '₹3,000' },
            { label: 'Medical Allowance', value: '₹4,000' },
          ].map((row) => (
            <div key={row.label} className="flex justify-between py-1.5 border-b border-border/20 last:border-0">
              <span className="text-xs md:text-sm text-muted-foreground">{row.label}</span>
              <span className="text-xs md:text-sm font-medium">{row.value}</span>
            </div>
          ))}
          <div className="flex justify-between py-2 mt-1 border-t-2 border-border/50">
            <span className="text-sm font-semibold">Gross Salary</span>
            <span className="text-sm font-bold text-emerald-600">₹65,000</span>
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {[
              { label: 'Provident Fund (PF)', value: '- ₹3,900' },
              { label: 'Professional Tax', value: '- ₹200' },
              { label: 'Income Tax (TDS)', value: '- ₹4,100' },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-1">
                <span className="text-xs text-muted-foreground">{row.label}</span>
                <span className="text-xs font-medium text-destructive">{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between py-2 mt-1 border-t-2 border-primary/20 bg-primary/5 -mx-4 md:-mx-6 px-4 md:px-6 rounded-b-xl">
            <span className="text-sm font-bold">Net Pay</span>
            <span className="text-sm font-bold text-primary">₹56,800</span>
          </div>
        </div>
      </WidgetShell>
    </div>
  )
}
