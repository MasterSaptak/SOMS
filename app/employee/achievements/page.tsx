"use client"

import React from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuthStore } from '@/store/use-auth-store'
import { Trophy, Lock, Star, Flame, Zap, Target, Shield, Clock, Award, Crown, Users, Coffee } from 'lucide-react'

const containerVars = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVars = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

const achievementIcons: Record<string, React.ReactNode> = {
  'first_task': <Zap className="w-6 h-6" />,
  'streak_7': <Flame className="w-6 h-6" />,
  'streak_30': <Flame className="w-6 h-6" />,
  'team_player': <Users className="w-6 h-6" />,
  'early_bird': <Clock className="w-6 h-6" />,
  'top_performer': <Crown className="w-6 h-6" />,
  'mentor': <Shield className="w-6 h-6" />,
  'perfectionist': <Target className="w-6 h-6" />,
  'coffee_master': <Coffee className="w-6 h-6" />,
}

const tierColors = {
  bronze: 'from-amber-700 to-amber-900 text-amber-100',
  silver: 'from-slate-400 to-slate-600 text-white',
  gold: 'from-amber-400 to-amber-600 text-white',
  platinum: 'from-indigo-400 to-purple-600 text-white',
}

const tierBorders = {
  bronze: 'border-amber-700/30',
  silver: 'border-slate-400/30',
  gold: 'border-amber-400/30',
  platinum: 'border-indigo-400/30',
}

export default function AchievementsPage() {
  const { employee } = useAuthStore()

  const myAchievements = ([] as any[]).filter(a => a.employeeId === employee?.id)
  const unlocked = myAchievements.filter(a => a.unlockedAt)
  const inProgress = myAchievements.filter(a => !a.unlockedAt)

  const totalXP = unlocked.reduce((sum, a) => sum + a.xp, 0)
  const level = Math.floor(totalXP / 500) + 1
  const xpInLevel = totalXP % 500
  const xpToNext = 500

  return (
    <motion.div className="flex flex-col gap-6 pb-12" variants={containerVars} initial="hidden" animate="show">
      <motion.div variants={itemVars}>
        <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        <p className="text-muted-foreground mt-1">Track your milestones and unlock rewards</p>
      </motion.div>

      {/* Level Card */}
      <motion.div variants={itemVars}>
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-6 opacity-10"><Trophy className="w-24 h-24" /></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="text-3xl font-black">{level}</span>
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-sm">Your Level</p>
                <h2 className="text-2xl font-bold mb-2">Level {level} — {level >= 5 ? 'Elite' : level >= 3 ? 'Pro' : 'Rising Star'}</h2>
                <div className="flex items-center gap-3">
                  <Progress value={(xpInLevel / xpToNext) * 100} className="h-2 flex-1 bg-white/10" indicatorClassName="bg-white" />
                  <span className="text-xs text-white/70 font-medium">{xpInLevel} / {xpToNext} XP</span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-4xl font-black">{totalXP}</span>
                <span className="text-xs text-white/50 uppercase tracking-wider">Total XP</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-primary">{unlocked.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Unlocked</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{inProgress.length}</p>
          <p className="text-xs text-muted-foreground mt-1">In Progress</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{totalXP}</p>
          <p className="text-xs text-muted-foreground mt-1">Total XP</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{([] as any[]).length}</p>
          <p className="text-xs text-muted-foreground mt-1">Total Available</p>
        </CardContent></Card>
      </motion.div>

      {/* Unlocked */}
      {unlocked.length > 0 && (
        <motion.div variants={itemVars}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-primary" />Unlocked Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlocked.map((ach: any) => (
              <Card key={ach.id} className={`hover:shadow-md transition-all ${tierBorders[ach.tier as keyof typeof tierBorders]}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tierColors[ach.tier as keyof typeof tierColors]} flex items-center justify-center shrink-0 shadow-sm`}>
                    {achievementIcons[ach.achievementId as keyof typeof achievementIcons] || <Award className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-sm">{ach.title}</h3>
                      <Badge variant="outline" className="text-[9px] uppercase">{ach.tier}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{ach.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary">+{ach.xp} XP</span>
                      {ach.unlockedAt && <span className="text-[10px] text-muted-foreground">{new Date(ach.unlockedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* In Progress */}
      {inProgress.length > 0 && (
        <motion.div variants={itemVars}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-muted-foreground" />In Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgress.map(ach => (
              <Card key={ach.id} className="opacity-70 hover:opacity-100 transition-all">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                    <Lock className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm mb-0.5">{ach.title}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{ach.description}</p>
                    <div className="flex items-center gap-2">
                      <Progress value={(ach.currentProgress / ach.targetProgress) * 100} className="h-1.5 flex-1" />
                      <span className="text-[10px] text-muted-foreground font-medium">{ach.currentProgress}/{ach.targetProgress}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">+{ach.xp} XP on unlock</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
