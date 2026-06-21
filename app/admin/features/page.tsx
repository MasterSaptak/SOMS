"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  ToggleLeft, Plus, Search, Filter, AlertTriangle, ShieldAlert,
  Users, Server, Zap, GitBranch, History, Settings2
} from 'lucide-react'

interface FeatureFlag {
  id: string
  name: string
  key: string
  description: string
  status: 'enabled' | 'disabled' | 'testing'
  environments: ('production' | 'staging' | 'development')[]
  rolloutPercentage: number
  lastUpdated: string
  author: string
}

const MOCK_FEATURES: FeatureFlag[] = [
  { id: 'ff1', name: 'AI Workplace Copilot', key: 'ai_copilot_enabled', description: 'Enable the Gemini-powered AI copilot across the workspace.', status: 'testing', environments: ['development', 'staging'], rolloutPercentage: 100, lastUpdated: '2 hours ago', author: 'Admin User' },
  { id: 'ff2', name: 'Universal Search V2', key: 'universal_search_v2', description: 'New global search with improved ranking and cross-module indexing.', status: 'enabled', environments: ['production', 'staging', 'development'], rolloutPercentage: 100, lastUpdated: '1 week ago', author: 'Mike Johnson' },
  { id: 'ff3', name: 'Real-time Document Collaboration', key: 'docs_realtime_collab', description: 'Enable multi-user real-time editing in the Knowledge Base.', status: 'disabled', environments: [], rolloutPercentage: 0, lastUpdated: '1 month ago', author: 'Sarah Chen' },
  { id: 'ff4', name: 'Advanced Executive Analytics', key: 'exec_analytics_advanced', description: 'New predictive analytics models for the executive dashboard.', status: 'testing', environments: ['staging'], rolloutPercentage: 25, lastUpdated: '3 days ago', author: 'Admin User' },
  { id: 'ff5', name: 'Dark Mode V2', key: 'theme_dark_v2', description: 'Updated dark mode color palette with higher contrast ratios.', status: 'enabled', environments: ['production', 'staging', 'development'], rolloutPercentage: 100, lastUpdated: '2 weeks ago', author: 'John Doe' },
]

export default function FeaturesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [features, setFeatures] = useState(MOCK_FEATURES)

  const toggleFeature = (id: string, currentStatus: FeatureFlag['status']) => {
    setFeatures(features.map(f => {
      if (f.id === id) {
        return { ...f, status: currentStatus === 'enabled' ? 'disabled' : 'enabled' }
      }
      return f
    }))
  }

  const filteredFeatures = features.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    f.key.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      className="flex flex-col gap-6 p-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ToggleLeft className="w-8 h-8 text-primary" />
            Feature Flags
          </h1>
          <p className="text-muted-foreground mt-1">Manage feature rollouts, beta testing, and kill switches</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Flag
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle>All Features</CardTitle>
              <Badge variant="secondary">{features.length} Total</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search flags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {filteredFeatures.map((feature) => (
              <div key={feature.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-semibold">{feature.name}</h3>
                    <code className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {feature.key}
                    </code>
                    {feature.status === 'testing' && (
                      <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">
                        <Zap className="w-3 h-3 mr-1" /> Beta Testing
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{feature.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Server className="w-3.5 h-3.5" />
                      Environments: 
                      {feature.environments.length > 0 ? (
                        <div className="flex gap-1 ml-1">
                          {feature.environments.map(env => (
                            <span key={env} className={`px-1.5 py-0.5 rounded-[4px] text-[10px] uppercase font-bold ${
                              env === 'production' ? 'bg-red-500/10 text-red-600' :
                              env === 'staging' ? 'bg-blue-500/10 text-blue-600' :
                              'bg-emerald-500/10 text-emerald-600'
                            }`}>
                              {env.slice(0, 4)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 ml-1">None</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      Rollout: <span className="font-medium text-foreground">{feature.rolloutPercentage}%</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <History className="w-3.5 h-3.5" />
                      Updated {feature.lastUpdated} by {feature.author}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0 bg-background/50 p-4 rounded-xl border border-border/50">
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold capitalize ${
                        feature.status === 'enabled' ? 'text-emerald-500' : 
                        feature.status === 'testing' ? 'text-amber-500' : 'text-slate-500'
                      }`}>
                        {feature.status}
                      </span>
                      <Switch 
                        checked={feature.status === 'enabled' || feature.status === 'testing'} 
                        onCheckedChange={() => toggleFeature(feature.id, feature.status)}
                      />
                    </div>
                    {feature.status === 'enabled' && feature.environments.includes('production') && (
                      <span className="flex items-center text-[10px] text-red-500 font-medium">
                        <ShieldAlert className="w-3 h-3 mr-1" /> Live in Production
                      </span>
                    )}
                  </div>
                  
                  <div className="h-10 w-px bg-border"></div>
                  
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredFeatures.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ToggleLeft className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">No feature flags found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
