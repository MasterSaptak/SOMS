"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MOCK_VISITORS, MOCK_EMPLOYEES, getFullName } from '@/lib/mock-data'
import type { VisitorLog } from '@/lib/types'
import { UserPlus, LogIn, LogOut, Search, Clock, Building2, Phone, X, Plus } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

function RegisterVisitorDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [purpose, setPurpose] = useState('')
  const [hostId, setHostId] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border/60">
          <h2 className="text-lg font-semibold">Register Visitor</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
        </div>
        <form className="p-6 flex flex-col gap-4" onSubmit={e => { e.preventDefault(); onClose() }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Visitor Name</label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required /></div>
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Company</label><Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Phone</label><Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." /></div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Host</label>
              <select value={hostId} onChange={e => setHostId(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" required>
                <option value="">Select host...</option>
                {MOCK_EMPLOYEES.filter(e => e.status === 'active').map(emp => <option key={emp.id} value={emp.id}>{getFullName(emp)}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5"><label className="text-sm font-medium">Purpose</label>
            <textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="Purpose of visit..." rows={2} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="gap-1.5"><LogIn className="w-4 h-4" />Check In</Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function ReceptionPage() {
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [visitors, setVisitors] = useState<VisitorLog[]>(MOCK_VISITORS)
  const [activeTab, setActiveTab] = useState('active')

  const activeVisitors = visitors.filter(v => v.status === 'checked_in')
  const pastVisitors = visitors.filter(v => v.status === 'checked_out')

  const handleCheckout = (id: string) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'checked_out' as const, checkOut: new Date().toISOString() } : v))
  }

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Management</h1>
          <p className="text-muted-foreground mt-1">{activeVisitors.length} visitors currently in office</p>
        </div>
        <Button onClick={() => setShowRegisterDialog(true)} className="gap-1.5"><Plus className="w-4 h-4" />Register Visitor</Button>
      </motion.div>

      {/* Quick stats */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><LogIn className="w-5 h-5" /></div>
          <div><p className="text-xs text-muted-foreground">Checked In</p><p className="text-2xl font-bold">{activeVisitors.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center text-slate-500"><LogOut className="w-5 h-5" /></div>
          <div><p className="text-xs text-muted-foreground">Checked Out</p><p className="text-2xl font-bold">{pastVisitors.length}</p></div>
        </CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><UserPlus className="w-5 h-5" /></div>
          <div><p className="text-xs text-muted-foreground">Total Today</p><p className="text-2xl font-bold">{visitors.length}</p></div>
        </CardContent></Card>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="gap-1.5"><LogIn className="w-3.5 h-3.5" />Active<span className="ml-1 text-[10px] bg-emerald-500/20 text-emerald-600 rounded-full px-1.5 py-0.5">{activeVisitors.length}</span></TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5"><Clock className="w-3.5 h-3.5" />History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeVisitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16"><UserPlus className="w-12 h-12 text-muted-foreground/20 mb-3" /><p className="text-sm text-muted-foreground">No active visitors</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              {activeVisitors.map(visitor => {
                const host = MOCK_EMPLOYEES.find(e => e.id === visitor.hostId)
                return (
                  <Card key={visitor.id} className="hover:border-primary/20 transition-colors">
                    <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                          {visitor.visitorName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{visitor.visitorName}</h3>
                            <Badge variant="outline" className="text-[10px]">Badge: {visitor.badgeNumber}</Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{visitor.company}</span>
                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{visitor.phone}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Host: <strong>{host ? getFullName(host) : '—'}</strong> · {visitor.purpose}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">Checked in: {new Date(visitor.checkIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => handleCheckout(visitor.id)}>
                        <LogOut className="w-3.5 h-3.5" />Check Out
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="p-0">
              <div className="hidden md:grid grid-cols-[1fr_120px_120px_120px_100px] gap-3 px-4 py-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
                <span>Visitor</span><span>Company</span><span>Host</span><span>Check In</span><span>Check Out</span>
              </div>
              {pastVisitors.map(v => {
                const host = MOCK_EMPLOYEES.find(e => e.id === v.hostId)
                return (
                  <div key={v.id} className="grid grid-cols-1 md:grid-cols-[1fr_120px_120px_120px_100px] gap-2 md:gap-3 items-center p-4 border-b border-border/30">
                    <span className="text-sm font-medium">{v.visitorName}</span>
                    <span className="text-xs text-muted-foreground">{v.company}</span>
                    <span className="text-xs">{host ? getFullName(host) : '—'}</span>
                    <span className="text-xs text-muted-foreground">{new Date(v.checkIn).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    <span className="text-xs text-muted-foreground">{v.checkOut ? new Date(v.checkOut).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '—'}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showRegisterDialog && <RegisterVisitorDialog onClose={() => setShowRegisterDialog(false)} />}
    </motion.div>
  )
}
