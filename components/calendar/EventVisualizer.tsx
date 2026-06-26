import React from 'react';
import { CalendarEvent } from '@/lib/calendar/calendar.service';
import { Badge } from '@/components/ui/badge';

interface EventVisualizerProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
}

export function EventVisualizer({ event, onClick }: EventVisualizerProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) onClick(event);
  };

  switch (event.type) {
    case 'attendance':
      return (
        <div onClick={handleClick} className="flex items-center gap-1 text-[10px] px-1 py-0.5 rounded cursor-pointer hover:bg-emerald-500/10 transition-colors" title={event.title}>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate">{event.title}</span>
        </div>
      );
    
    case 'leave':
      const titleLower = event.title.toLowerCase();
      let leaveStyles = "bg-orange-500/10 text-orange-600 border-orange-200 hover:bg-orange-500/20";
      
      if (titleLower.includes('medical')) {
        leaveStyles = "bg-rose-500/10 text-rose-600 border-rose-200 hover:bg-rose-500/20";
      } else if (titleLower.includes('emergency')) {
        leaveStyles = "bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20 font-bold";
      } else if (titleLower.includes('unpaid')) {
        leaveStyles = "bg-slate-500/10 text-slate-600 border-slate-200 hover:bg-slate-500/20 border-dashed";
      } else if (titleLower.includes('casual')) {
        leaveStyles = "bg-sky-500/10 text-sky-600 border-sky-200 hover:bg-sky-500/20";
      } else if (titleLower.includes('paid')) {
        leaveStyles = "bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20";
      }

      return (
        <div onClick={handleClick} className={`text-[10px] px-2 py-0.5 rounded-full border truncate cursor-pointer transition-colors ${leaveStyles}`} title={event.title}>
          {event.title}
        </div>
      );

    case 'task':
      const priorityColors = {
        low: 'bg-green-500',
        medium: 'bg-yellow-500',
        high: 'bg-orange-500',
        critical: 'bg-red-500'
      };
      const pColor = event.priority ? priorityColors[event.priority] : 'bg-blue-500';
      return (
        <div onClick={handleClick} className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-700 border border-blue-200 cursor-pointer hover:bg-blue-500/20 transition-colors truncate">
          <div className={`w-1.5 h-1.5 rounded-full ${pColor} shrink-0`} />
          <span className="truncate">{event.title}</span>
        </div>
      );

    case 'project':
      return (
        <div onClick={handleClick} className="relative group text-[10px] h-5 rounded overflow-hidden bg-purple-500/10 border border-purple-300 cursor-pointer hover:bg-purple-500/20 transition-colors flex items-center">
          <div className="absolute top-0 left-0 bottom-0 bg-purple-500/20" style={{ width: `${event.progress || 0}%` }} />
          <span className="px-1.5 relative z-10 font-medium text-purple-700 truncate">{event.title}</span>
          
          {/* Hover Card */}
          <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 p-2 bg-popover text-popover-foreground border border-border shadow-lg rounded z-50">
            <p className="font-bold mb-1 truncate">{event.title}</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-muted-foreground">Progress:</span>
              <span className="text-right font-medium">{event.progress}%</span>
              <span className="text-muted-foreground">Owner:</span>
              <span className="text-right truncate">{event.owner}</span>
              <span className="text-muted-foreground">Members:</span>
              <span className="text-right">{event.members}</span>
              <span className="text-muted-foreground">Milestones:</span>
              <span className="text-right">{event.completedMilestones}/{event.milestonesCount}</span>
            </div>
          </div>
        </div>
      );

    case 'mission':
      return (
        <div onClick={handleClick} className="text-[9px] uppercase tracking-wider font-bold px-1 py-0.5 bg-indigo-500 text-white truncate cursor-pointer hover:bg-indigo-600 transition-colors" title={event.title}>
          {event.title}
        </div>
      );

    case 'goal':
      return (
        <div onClick={handleClick} className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 border border-teal-200 cursor-pointer flex flex-col gap-0.5 hover:bg-teal-500/20 transition-colors">
          <div className="flex justify-between items-center gap-2">
            <span className="truncate text-teal-700 font-medium">{event.title}</span>
            <span className="text-teal-600 shrink-0">{event.progress}%</span>
          </div>
          <div className="h-1 w-full bg-teal-200 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500" style={{ width: `${event.progress || 0}%` }} />
          </div>
        </div>
      );

    case 'meeting':
      return (
        <div onClick={handleClick} className="text-[10px] px-1.5 py-1 rounded bg-cyan-500/10 border-l-2 border-l-cyan-500 text-cyan-800 cursor-pointer hover:bg-cyan-500/20 transition-colors truncate">
          {event.startTime ? new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''} {event.title}
        </div>
      );

    case 'holiday':
      return (
        <div onClick={handleClick} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500 text-white font-medium truncate cursor-pointer hover:bg-red-600 transition-colors" title={event.title}>
          {event.title}
        </div>
      );

    case 'birthday':
      return (
        <div onClick={handleClick} className="flex items-center gap-1 text-[10px] px-1 py-0.5 rounded cursor-pointer hover:bg-pink-500/10 transition-colors text-pink-600 font-medium truncate" title={event.title}>
          🎂 <span className="truncate">{event.title}</span>
        </div>
      );

    case 'training':
      return (
        <div onClick={handleClick} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-200 text-amber-700 cursor-pointer hover:bg-amber-500/20 transition-colors truncate" title={event.title}>
          🎓 {event.title}
        </div>
      );

    case 'reminder':
      return (
        <div onClick={handleClick} className="flex items-center gap-1 text-[10px] px-1 py-0.5 rounded cursor-pointer hover:bg-slate-500/10 transition-colors text-slate-700 truncate" title={event.title}>
          🔔 <span className="truncate">{event.title}</span>
        </div>
      );

    case 'company_event':
      return (
        <div onClick={handleClick} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-800 text-white font-medium truncate cursor-pointer hover:bg-blue-900 transition-colors" title={event.title}>
          {event.title}
        </div>
      );

    default:
      return (
        <div onClick={handleClick} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground truncate">
          {event.title}
        </div>
      );
  }
}
