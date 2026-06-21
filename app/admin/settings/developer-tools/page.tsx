'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Database, Download, RefreshCw, Trash2, Zap, Server, ShieldAlert } from 'lucide-react'
import { 
  createDemoOrganizationAction, 
  deleteDemoOrganizationAction, 
  resetDemoOrganizationAction 
} from '@/app/actions/demo.actions'

export default function DeveloperToolsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const handleAction = async (actionFn: () => Promise<any>, actionName: string) => {
    setIsLoading(true)
    setLastAction(`Running: ${actionName}...`)
    try {
      const res = await actionFn()
      if (res.success) {
        setLastAction(`Success: ${actionName}`)
      } else {
        setLastAction(`Failed: ${actionName} - ${res.error?.message || 'Unknown error'}`)
      }
    } catch (e) {
      setLastAction(`Error: ${e}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
          <p className="text-muted-foreground mt-1">System configuration, database health, and demo environments.</p>
        </div>
        <Badge variant="outline" className="font-mono bg-amber-500/10 text-amber-600 border-amber-500/20 gap-1.5 py-1">
          <ShieldAlert className="w-3.5 h-3.5" /> Restricted Access
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Database Health */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Database className="w-5 h-5 text-primary" />
                Current Database
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20">Healthy</Badge>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Organizations</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Employees</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b pb-2">
                <span className="text-muted-foreground">Departments</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Seed Version</span>
                <span className="font-mono">1.0.0</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-primary/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Server className="w-32 h-32" />
            </div>
            <CardHeader>
              <CardTitle>Demo Organization Management</CardTitle>
              <CardDescription>
                Create and manage realistic demo data within the multi-tenant architecture. 
                Demo organizations are flagged (`is_demo=true`) and safe to reset without affecting customer data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button 
                  onClick={() => handleAction(createDemoOrganizationAction, 'Create Demo Organization')}
                  disabled={isLoading}
                  className="w-full gap-2 justify-start h-12"
                >
                  <Zap className="w-4 h-4" />
                  Create Demo Organization
                </Button>

                <Button 
                  onClick={() => handleAction(resetDemoOrganizationAction, 'Reset Demo Organization')}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full gap-2 justify-start h-12"
                >
                  <RefreshCw className="w-4 h-4" />
                  Reset Demo Organization
                </Button>

                <Button 
                  onClick={() => handleAction(deleteDemoOrganizationAction, 'Delete Demo Organization')}
                  disabled={isLoading}
                  variant="destructive"
                  className="w-full gap-2 justify-start h-12 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700 border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Demo Organization
                </Button>

                <Button 
                  disabled={true}
                  variant="outline"
                  className="w-full gap-2 justify-start h-12"
                  title="Coming soon"
                >
                  <Download className="w-4 h-4" />
                  Export Demo Data
                </Button>
              </div>

              {lastAction && (
                <div className="p-3 text-sm rounded-md bg-muted/50 border font-mono">
                  {lastAction}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
