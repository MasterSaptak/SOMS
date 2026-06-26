import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info, ArrowRight } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state';
// TODO: Fetch real data instead of mock data

export function InsightsStream() {
  const sortedInsights = [...([] as any[])].sort((a: any, b: any) => {
    const sevScore: Record<string, number> = { critical: 3, warning: 2, info: 1 }
    return (sevScore[b.severity] || 0) - (sevScore[a.severity] || 0)
  })

  return (
    <Card className="h-full border-border/50 shadow-sm overflow-hidden flex flex-col">
      <CardHeader className="bg-muted/20 border-b border-border/30 px-5 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live Insights Feed
          </CardTitle>
          <Badge variant="secondary" className="font-normal text-xs">{([] as any[]).length} active</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="flex flex-col divide-y divide-border/30">
          {sortedInsights.map(insight => {
            const employee: any = undefined
            let Icon = Info
            let iconColor = 'text-blue-500'
            let bgStyle = ''
            
            if (insight.severity === 'critical') {
              Icon = AlertTriangle
              iconColor = 'text-red-500'
              bgStyle = 'bg-red-500/5 hover:bg-red-500/10'
            } else if (insight.severity === 'warning') {
              Icon = AlertCircle
              iconColor = 'text-amber-500'
              bgStyle = 'bg-amber-500/5 hover:bg-amber-500/10'
            } else {
              bgStyle = 'hover:bg-muted/30'
            }

            const timeStr = new Date(insight.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})

            return (
              <div key={insight.id} className={`p-4 transition-colors group cursor-pointer ${bgStyle}`}>
                <div className="flex gap-4">
                  <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{insight.title}</h4>
                      <div className="text-[10px] text-muted-foreground whitespace-nowrap pt-0.5">{timeStr}</div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {insight.content}
                    </p>
                    <div className="flex items-center justify-between">
                      {employee && (
                        <Badge variant="outline" className="text-[10px] font-normal bg-background/50">
                          {(employee ? `${employee.firstName} ${employee.lastName}` : "Unknown")}
                        </Badge>
                      )}
                      <div className="flex items-center text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 transform duration-200">
                        Take Action <ArrowRight className="w-3 h-3 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {sortedInsights.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No new insights at this time.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
