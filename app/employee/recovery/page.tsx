"use client"

import React from 'react'
import { motion } from 'motion/react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, ArrowRight, ShieldAlert, Sparkles, Scale3d, TrendingDown, Clock, CheckCircle2 } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVars: any = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

const debtData = [
  { day: 'Day 0', remaining: 4 },
  { day: 'Day 1', remaining: 3.5 },
  { day: 'Day 2', remaining: 3.0 },
  { day: 'Day 3', remaining: 2.5 },
  { day: 'Day 4', remaining: 2.0 },
  { day: 'Day 5', remaining: 1.5 },
  { day: 'Day 6', remaining: 1.0 },
  { day: 'Day 7', remaining: 0.5 },
  { day: 'Day 8', remaining: 0 },
]

export default function WorkDebtRecoveryPage() {
  return (
    <motion.div 
      className="flex flex-col gap-6 max-w-5xl mx-auto pb-12"
      variants={containerVars}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVars}>
        <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-full text-xs font-semibold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Signature Feature
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Work Debt Recovery</h1>
        <p className="text-muted-foreground">Manage and recover your missing work hours through structured daily extensions.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Debt Overview Card */}
        <motion.div variants={itemVars} className="lg:col-span-2">
          <Card className="h-full bg-gradient-to-br from-card to-destructive/5 relative overflow-hidden border-destructive/20">
            <div className="absolute -right-10 -top-10 opacity-[0.03] rotate-12 pointer-events-none">
              <TrendingDown className="w-[300px] h-[300px]" />
            </div>
            <CardHeader>
              <CardTitle className="text-destructive">Active Debt Profile</CardTitle>
              <CardDescription>Your current outstanding work deficit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 mt-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Debt</p>
                  <p className="text-5xl font-bold tabular-nums">4h 00m</p>
                  <Badge variant="outline" className="mt-3 text-destructive border-destructive/30">Missed: Tuesday, June 16</Badge>
                </div>
                
                <div className="hidden md:block w-px bg-border/60" />
                
                <div className="flex-1 flex flex-col justify-center">
                   <div className="flex justify-between items-end mb-2">
                     <p className="text-sm font-medium">Recovery Progress</p>
                     <p className="text-2xl font-bold">1h 00m <span className="text-sm text-muted-foreground font-normal">cleared</span></p>
                   </div>
                   <Progress value={25} className="h-2" indicatorClassName="bg-amber-500" />
                   <p className="text-xs text-muted-foreground mt-3">
                     Remaining debt: <strong className="text-foreground -tracking-tight">3h 00m</strong>
                   </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rules & Policy */}
        <motion.div variants={itemVars}>
          <Card className="h-full">
            <CardHeader className="pb-4">
               <CardTitle className="flex items-center gap-2"><Scale3d className="w-5 h-5 text-primary" /> Policy Limits</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-4">
              <div className="flex gap-3">
                <Clock className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <p>Maximum daily recovery limit is <strong>30 minutes</strong> per day to prevent burnout.</p>
              </div>
              <div className="flex gap-3">
                <Clock className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                <p>You have <strong>8 working days</strong> to clear a 4-hour deficit.</p>
              </div>
              <div className="flex gap-3 text-amber-600 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Unrecovered debt after the deadline will be deducted from next month&apos;s salary.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tracker Schedule */}
        <motion.div variants={itemVars} className="lg:col-span-3">
          <Card>
             <CardHeader className="border-b pb-6">
               <CardTitle>Recovery Plan</CardTitle>
               <CardDescription>Your automatic schedule to clear debt within policy limits.</CardDescription>
             </CardHeader>
             <CardContent className="p-0">
               <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 divide-x divide-border/40">
                  {/* Days */}
                  {[
                    { day: 'Day 1', date: 'Wed', mins: '30m', state: 'done' },
                    { day: 'Day 2', date: 'Thu', mins: '30m', state: 'done' },
                    { day: 'Day 3', date: 'Today', mins: '30m', state: 'active' },
                    { day: 'Day 4', date: 'Mon', mins: '30m', state: 'pending' },
                    { day: 'Day 5', date: 'Tue', mins: '30m', state: 'pending' },
                    { day: 'Day 6', date: 'Wed', mins: '30m', state: 'pending' },
                    { day: 'Day 7', date: 'Thu', mins: '30m', state: 'pending' },
                    { day: 'Day 8', date: 'Fri', mins: '30m', state: 'pending' },
                  ].map((block, i) => (
                    <div key={i} className={`p-4 sm:p-6 flex flex-col items-center justify-center relative transition-colors ${
                      block.state === 'active' ? 'bg-amber-500/5' : 
                      block.state === 'done' ? 'bg-primary/5' : 'bg-transparent'
                    }`}>
                      {block.state === 'active' && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />}
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{block.day}</span>
                      <span className="text-lg font-bold my-1">{block.date}</span>
                      
                      <div className="mt-4 flex flex-col items-center gap-2">
                        {block.state === 'done' ? (
                           <CheckCircle2 className="w-8 h-8 text-primary" />
                        ) : block.state === 'active' ? (
                           <div className="w-8 h-8 rounded-full border-2 border-amber-500 flex items-center justify-center shadow-sm bg-background">
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                           </div>
                        ) : (
                           <div className="w-8 h-8 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                             
                           </div>
                        )}
                        <span className={`text-xs font-medium tabular-nums ${
                          block.state === 'done' ? 'text-primary' : 
                          block.state === 'active' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                        }`}>{block.mins}</span>
                      </div>
                    </div>
                  ))}
               </div>
               
               {/* Line Chart */}
               <div className="p-6 border-t border-border/40 mt-2">
                 <h4 className="text-sm font-semibold mb-4 mx-2">Projected Debt Reduction</h4>
                 <div className="h-[200px] w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={debtData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                       <XAxis 
                         dataKey="day" 
                         axisLine={false}
                         tickLine={false}
                         tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                         dy={10}
                       />
                       <YAxis 
                         axisLine={false}
                         tickLine={false}
                         tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                         tickFormatter={(val) => `${val}h`}
                         dx={-10}
                       />
                       <Tooltip 
                         contentStyle={{ 
                           backgroundColor: 'hsl(var(--card))', 
                           borderColor: 'hsl(var(--border))',
                           borderRadius: '8px',
                           boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                         }}
                         itemStyle={{ color: 'hsl(var(--foreground))' }}
                         formatter={(value: any) => [`${value} hours`, 'Remaining Debt']}
                         labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                       />
                       <Line 
                         type="monotone" 
                         dataKey="remaining" 
                         stroke="hsl(var(--destructive))" 
                         strokeWidth={3}
                         dot={{ r: 4, fill: 'hsl(var(--destructive))', strokeWidth: 0 }}
                         activeDot={{ r: 6, stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                       />
                     </LineChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             </CardContent>
          </Card>
        </motion.div>

        {/* Action Call */}
        <motion.div variants={itemVars} className="lg:col-span-3">
           <Card className="bg-primary text-primary-foreground border-none">
             <CardContent className="flex flex-col sm:flex-row items-center justify-between p-8 gap-6">
                <div>
                   <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-foreground/70" /> Opt-in to extend session today</h3>
                   <p className="text-primary-foreground/80 text-sm max-w-xl">
                      By default, you must explicitly opt-in to apply extra work hours toward your debt. Leaving your session running past 8 hours without opting in simply logs over-time without clearing debt.
                   </p>
                </div>
                <Button size="lg" variant="secondary" className="whitespace-nowrap shrink-0 shadow-lg group font-bold">
                   Apply Today&apos;s Extension
                   <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
             </CardContent>
           </Card>
        </motion.div>

      </div>
    </motion.div>
  )
}
