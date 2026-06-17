"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/use-auth-store'
import { MOCK_REWARDS, MOCK_EMPLOYEES, getFullName, getDepartmentById } from '@/lib/mock-data'
import { Wallet, Gift, Star, Zap, TrendingUp, ShoppingBag, ArrowRight, Coins } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const rewardItems = [
  { name: 'Amazon Gift Card', cost: 500, icon: <ShoppingBag className="w-5 h-5" />, color: 'bg-amber-500/10 text-amber-500' },
  { name: 'Extra Day Off', cost: 1000, icon: <Star className="w-5 h-5" />, color: 'bg-purple-500/10 text-purple-500' },
  { name: 'Team Lunch Voucher', cost: 300, icon: <Gift className="w-5 h-5" />, color: 'bg-pink-500/10 text-pink-500' },
  { name: 'Learning Budget', cost: 750, icon: <Zap className="w-5 h-5" />, color: 'bg-blue-500/10 text-blue-500' },
]

export default function RewardsPage() {
  const { employee } = useAuthStore()

  const myRewards = MOCK_REWARDS.filter(r => r.employeeId === employee?.id)
  const totalEarned = myRewards.reduce((sum, r) => sum + r.amount, 0)
  const totalSpent = myRewards.filter(r => r.type === 'spent').reduce((sum, r) => sum + Math.abs(r.amount), 0)
  const balance = myRewards.reduce((sum, r) => sum + r.amount, 0)

  // Top earners leaderboard
  const employeeCredits = MOCK_EMPLOYEES.map(emp => {
    const earned = MOCK_REWARDS.filter(r => r.employeeId === emp.id).reduce((sum, r) => sum + r.amount, 0)
    return { employee: emp, credits: earned }
  }).sort((a, b) => b.credits - a.credits).slice(0, 5)

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-bold tracking-tight">Credits & Rewards</h1>
        <p className="text-muted-foreground mt-1">Earn credits for your contributions and redeem rewards</p>
      </motion.div>

      {/* Balance Card */}
      <motion.div variants={itemVars}>
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10"><Coins className="w-24 h-24" /></div>
          <CardContent className="p-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Available Balance</p>
                <p className="text-4xl font-bold">{balance.toLocaleString()}</p>
                <p className="text-xs text-primary-foreground/50 mt-1">credits</p>
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Total Earned</p>
                <p className="text-2xl font-bold flex items-center gap-1"><TrendingUp className="w-5 h-5" />{totalEarned.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-primary-foreground/70 text-sm mb-1">Total Redeemed</p>
                <p className="text-2xl font-bold">{totalSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Redeem Store */}
        <motion.div variants={itemVars} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Reward Store</CardTitle>
              <CardDescription>Redeem your credits for exciting rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewardItems.map(item => (
                  <div key={item.name} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} shrink-0`}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">{item.cost} credits</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs shrink-0" disabled={balance < item.cost}>
                      Redeem
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Leaderboard */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Top Earners</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {employeeCredits.map((entry, i) => {
                const dept = getDepartmentById(entry.employee.departmentId)
                return (
                  <div key={entry.employee.id} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-amber-700 text-white' : 'bg-muted text-muted-foreground'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{getFullName(entry.employee)}</p>
                      <p className="text-[10px] text-muted-foreground">{dept?.name}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{entry.credits}</span>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Credit History */}
      <motion.div variants={itemVars}>
        <Card>
          <CardHeader>
            <CardTitle>Credit History</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {myRewards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12"><Wallet className="w-10 h-10 text-muted-foreground/20 mb-3" /><p className="text-sm text-muted-foreground">No credit activity yet</p></div>
            ) : (
              myRewards.map(reward => (
                <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${reward.amount > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {reward.amount > 0 ? <TrendingUp className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{reward.reason}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(reward.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${reward.amount > 0 ? 'text-emerald-500' : 'text-red-500'}`}>{reward.amount > 0 ? '+' : ''}{reward.amount}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
