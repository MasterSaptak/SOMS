import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, AlertTriangle, Info, Clock, CheckCircle2 } from 'lucide-react';
import { CalendarEvent } from '@/lib/calendar/calendar.service';

interface AIInsightsPanelProps {
  events: CalendarEvent[];
}

export function AIInsightsPanel({ events }: AIInsightsPanelProps) {
  // Simple heuristics as requested
  const activeTasks = events.filter(e => e.type === 'task' && e.status !== 'completed').length;
  const leaves = events.filter(e => e.type === 'leave').length; // highly simplified proxy for department absence
  const meetingHours = events.filter(e => e.type === 'meeting').length * 1.5; // proxy
  
  const deadlines = events.filter(e => e.type === 'project' && e.endDate);
  const urgentDeadlines = deadlines.filter(p => {
    const daysLeft = (p.endDate!.getTime() - new Date(2026, 5, 1).getTime()) / (1000 * 3600 * 24);
    return daysLeft < 5 && (p.progress || 0) < 70;
  });

  return (
    <Card className="border-border/50 shadow-sm bg-gradient-to-b from-primary/5 to-transparent h-full flex flex-col">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
          <Sparkles className="w-4 h-4" /> AI Workload Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 overflow-y-auto flex-1 hide-scrollbar">
        <div className="flex flex-col gap-3">
          
          {activeTasks > 8 && (
            <div className="p-3 bg-orange-500/10 border-orange-500/30 rounded-xl border text-sm">
              <div className="flex items-center gap-2 font-semibold text-orange-700 mb-1">
                <AlertTriangle className="w-4 h-4" /> High Workload
              </div>
              <p className="text-xs text-orange-800/80 leading-relaxed">
                You have {activeTasks} active tasks scheduled. Consider delegating or deferring low-priority items.
              </p>
            </div>
          )}

          {urgentDeadlines.map(p => (
            <div key={p.id} className="p-3 bg-red-500/10 border-red-500/30 rounded-xl border text-sm">
              <div className="flex items-center gap-2 font-semibold text-red-700 mb-1">
                <Clock className="w-4 h-4" /> Deadline Risk
              </div>
              <p className="text-xs text-red-800/80 leading-relaxed">
                Project <strong>{p.title}</strong> is due soon but only {p.progress}% complete.
              </p>
            </div>
          ))}

          {meetingHours > 5 && (
            <div className="p-3 bg-yellow-500/10 border-yellow-500/30 rounded-xl border text-sm">
               <div className="flex items-center gap-2 font-semibold text-yellow-700 mb-1">
                <Info className="w-4 h-4" /> Meeting Overload
              </div>
              <p className="text-xs text-yellow-800/80 leading-relaxed">
                You have {meetingHours} hours of meetings scheduled. Focus time is severely limited.
              </p>
            </div>
          )}

          {leaves > 3 && (
            <div className="p-3 bg-indigo-500/10 border-indigo-500/30 rounded-xl border text-sm">
               <div className="flex items-center gap-2 font-semibold text-indigo-700 mb-1">
                <AlertTriangle className="w-4 h-4" /> Staffing Alert
              </div>
              <p className="text-xs text-indigo-800/80 leading-relaxed">
                Multiple team members are on leave. Expect delays in project execution.
              </p>
            </div>
          )}

          {activeTasks <= 8 && urgentDeadlines.length === 0 && meetingHours <= 5 && leaves <= 3 && (
             <div className="p-3 bg-emerald-500/10 border-emerald-500/30 rounded-xl border text-sm flex flex-col items-center justify-center text-center py-6">
               <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
               <p className="font-semibold text-emerald-700">All Clear</p>
               <p className="text-xs text-emerald-600/80 mt-1">Workload is balanced and on track.</p>
             </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
