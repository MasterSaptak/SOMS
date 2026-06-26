import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CalendarEvent } from '@/lib/calendar/calendar.service';
import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DailyTimelineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

export function DailyTimelineDrawer({ isOpen, onClose, date, events, onEventClick }: DailyTimelineDrawerProps) {
  if (!date) return null;

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  // Sort events by start time. If no start time, put at top (all day)
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.startTime && !b.startTime) return 0;
    if (!a.startTime) return -1;
    if (!b.startTime) return 1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">{displayDate}</SheetTitle>
          <SheetDescription>Daily Timeline & Schedule</SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          
          {/* Work Start indicator */}
          <div className="relative flex items-center gap-4 group">
             <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-background shadow-sm shrink-0 z-10 text-muted-foreground">
               <Clock className="w-4 h-4" />
             </div>
             <div className="text-sm font-medium text-muted-foreground">09:00 - Check In</div>
          </div>

          {sortedEvents.length === 0 ? (
            <div className="pl-14 text-sm text-muted-foreground italic">No events scheduled.</div>
          ) : (
            sortedEvents.map((event) => {
              const timeString = event.startTime 
                ? new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'All Day';
              
              return (
                <div key={event.id} className="relative flex items-start gap-4 group cursor-pointer" onClick={() => onEventClick(event)}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-background bg-background shadow-sm shrink-0 z-10 text-xs font-bold text-muted-foreground">
                    {timeString.split(' ')[0]}
                  </div>
                  <div className="flex-1 p-4 rounded-xl border border-border/50 bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{event.type}</Badge>
                    </div>
                    <h4 className="text-base font-semibold">{event.title}</h4>
                    {event.type === 'project' && (
                       <p className="text-sm text-muted-foreground mt-1">Milestone expected to complete today.</p>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* Work End indicator */}
          <div className="relative flex items-center gap-4 group">
             <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted border-2 border-background shadow-sm shrink-0 z-10 text-muted-foreground">
               <Clock className="w-4 h-4" />
             </div>
             <div className="text-sm font-medium text-muted-foreground">18:00 - Check Out</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
