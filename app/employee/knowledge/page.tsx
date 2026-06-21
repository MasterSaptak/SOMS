"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  BookOpen, Search, ChevronRight, Clock, User, Eye, ThumbsUp,
  FileText, Shield, HelpCircle, GraduationCap, Cog, FolderOpen,
} from 'lucide-react'

type KBCategory = 'policies' | 'faqs' | 'training' | 'procedures' | 'guides'

interface Article {
  id: string
  title: string
  excerpt: string
  category: KBCategory
  author: string
  publishedAt: string
  updatedAt: string
  views: number
  likes: number
  readTime: string
  tags: string[]
}

const CATEGORY_CONFIG: Record<KBCategory, { label: string; icon: React.ReactNode; color: string }> = {
  policies: { label: 'Policies', icon: <Shield className="w-4 h-4" />, color: 'text-blue-500 bg-blue-500/10' },
  faqs: { label: 'FAQs', icon: <HelpCircle className="w-4 h-4" />, color: 'text-emerald-500 bg-emerald-500/10' },
  training: { label: 'Training', icon: <GraduationCap className="w-4 h-4" />, color: 'text-purple-500 bg-purple-500/10' },
  procedures: { label: 'Procedures', icon: <Cog className="w-4 h-4" />, color: 'text-amber-500 bg-amber-500/10' },
  guides: { label: 'How-To Guides', icon: <BookOpen className="w-4 h-4" />, color: 'text-cyan-500 bg-cyan-500/10' },
}

const MOCK_ARTICLES: Article[] = [
  { id: 'kb1', title: 'Work From Home Policy', excerpt: 'Guidelines for remote work including eligibility, scheduling, equipment, and communication expectations for WFH employees.', category: 'policies', author: 'Priya Sharma', publishedAt: '2026-05-01', updatedAt: '2026-06-15', views: 342, likes: 28, readTime: '5 min', tags: ['WFH', 'Remote', 'Policy'] },
  { id: 'kb2', title: 'Leave Application Process', excerpt: 'Step-by-step guide on how to apply for different types of leaves including casual, medical, emergency, and WFH.', category: 'procedures', author: 'Priya Sharma', publishedAt: '2026-03-10', updatedAt: '2026-06-01', views: 567, likes: 45, readTime: '3 min', tags: ['Leave', 'HR', 'Process'] },
  { id: 'kb3', title: 'How to Reset Your Password', excerpt: 'Quick guide on resetting your SOMS account password, enabling 2FA, and recovering locked accounts.', category: 'faqs', author: 'Admin User', publishedAt: '2026-01-15', updatedAt: '2026-04-20', views: 890, likes: 12, readTime: '2 min', tags: ['Password', 'Security', 'Account'] },
  { id: 'kb4', title: 'Onboarding Checklist', excerpt: 'Complete onboarding checklist for new employees covering IT setup, HR paperwork, team introductions, and first-week tasks.', category: 'training', author: 'Priya Sharma', publishedAt: '2026-02-01', updatedAt: '2026-05-10', views: 234, likes: 67, readTime: '8 min', tags: ['Onboarding', 'New Hire', 'Checklist'] },
  { id: 'kb5', title: 'Code Review Guidelines', excerpt: 'Best practices for code reviews including review etiquette, checklist, turnaround time expectations, and approval criteria.', category: 'guides', author: 'Mike Johnson', publishedAt: '2026-04-15', updatedAt: '2026-06-10', views: 178, likes: 34, readTime: '6 min', tags: ['Code Review', 'Engineering', 'Best Practices'] },
  { id: 'kb6', title: 'Expense Reimbursement Policy', excerpt: 'How to submit expense claims, eligible expenses, required documentation, and approval workflow for reimbursements.', category: 'policies', author: 'Priya Sharma', publishedAt: '2026-03-01', updatedAt: '2026-05-20', views: 445, likes: 19, readTime: '4 min', tags: ['Expenses', 'Finance', 'Policy'] },
  { id: 'kb7', title: 'Meeting Room Booking Guide', excerpt: 'How to book meeting rooms, check availability, set up A/V equipment, and manage recurring bookings.', category: 'guides', author: 'Lisa Park', publishedAt: '2026-04-01', updatedAt: '2026-06-05', views: 312, likes: 22, readTime: '3 min', tags: ['Meetings', 'Rooms', 'Guide'] },
  { id: 'kb8', title: 'Performance Review Process', excerpt: 'Understanding the quarterly performance review cycle, self-assessment templates, and goal-setting framework.', category: 'procedures', author: 'Priya Sharma', publishedAt: '2026-01-01', updatedAt: '2026-06-12', views: 567, likes: 41, readTime: '7 min', tags: ['Performance', 'Review', 'HR'] },
]

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<KBCategory | 'all'>('all')

  const filteredArticles = MOCK_ARTICLES.filter((article) => {
    if (selectedCategory !== 'all' && article.category !== selectedCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return article.title.toLowerCase().includes(q) || article.excerpt.toLowerCase().includes(q) || article.tags.some(t => t.toLowerCase().includes(q))
    }
    return true
  })

  const categoryCounts = Object.keys(CATEGORY_CONFIG).reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = MOCK_ARTICLES.filter(a => a.category === cat).length
    return acc
  }, {})

  return (
    <motion.div
      className="flex flex-col gap-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground mt-1">Find answers, policies, and guides</p>
      </div>

      {/* Search */}
      <div className="relative max-w-2xl">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles, policies, guides..."
          className="pl-12 h-12 text-base rounded-xl"
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {(Object.entries(CATEGORY_CONFIG) as [KBCategory, typeof CATEGORY_CONFIG[KBCategory]][]).map(([key, config]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(selectedCategory === key ? 'all' : key)}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
              selectedCategory === key
                ? 'border-primary/30 bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/20 hover:bg-muted/50'
            }`}
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${config.color}`}>
              {config.icon}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">{categoryCounts[key]} articles</p>
            </div>
          </button>
        ))}
      </div>

      {/* Articles */}
      <div className="flex flex-col gap-3">
        {filteredArticles.map((article) => {
          const catConfig = CATEGORY_CONFIG[article.category]
          return (
            <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${catConfig.color}`}>
                    {catConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{article.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{article.excerpt}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {article.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {article.readTime} read
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {article.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {article.likes}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-[10px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No articles found</p>
        </div>
      )}
    </motion.div>
  )
}
