import { HolidayEngine, Country } from './holiday.engine';
import { ConfigEngine } from './config.engine';

export type EventType = 
  | 'attendance' 
  | 'leave' 
  | 'project' 
  | 'task' 
  | 'mission' 
  | 'goal' 
  | 'meeting' 
  | 'company_event' 
  | 'holiday' 
  | 'birthday' 
  | 'training' 
  | 'reminder';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  endDate?: Date; // For duration bars (projects, missions, etc)
  startTime?: Date;
  endTime?: Date;
  type: EventType;
  color?: string; // Optional if we use predefined colors per type
  icon?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical'; // for tasks
  progress?: number; // for goals/projects
  owner?: string;
  members?: number;
  milestonesCount?: number;
  completedMilestones?: number;
  status?: string;
  metadata?: any;
};

export class CalendarService {
  /**
   * Aggregates all events for a given month based on active layers
   * In a real implementation, this would fetch from Supabase.
   * For now, it mixes real logic (Holidays) with rich mock data.
   */
  static async getMonthlyEvents(
    year: number,
    month: number,
    country: Country,
    activeLayers: string[],
    filters?: { projectId?: string, goalId?: string, department?: string }
  ): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    
    // 1. Fetch Holidays
    if (activeLayers.includes('holidays')) {
      const holidays = HolidayEngine.getHolidays(country, year);
      holidays.forEach(h => {
        const hDate = new Date(h.date);
        if (hDate.getMonth() === month && hDate.getFullYear() === year) {
          events.push({
            id: `holiday-${h.date}-${h.name}`,
            title: h.name,
            date: hDate,
            type: 'holiday',
            metadata: h
          });
        }
      });
    }

    // Generate some deterministic mock data for the requested month
    // June 2026

    if (activeLayers.includes('company_events')) {
      events.push({
        id: 'company-event-1',
        title: 'Q2 Board Meeting',
        date: new Date(year, month, 15),
        type: 'company_event',
      });
    }

    if (activeLayers.includes('projects')) {
      if (!filters?.projectId || filters.projectId === 'proj-1') {
        events.push({
          id: 'proj-1',
          title: 'SOMS ERP Redesign',
          date: new Date(year, month, 1),
          endDate: new Date(year, month, 28),
          type: 'project',
          progress: 78,
          owner: 'John Doe',
          members: 12,
          completedMilestones: 2,
          milestonesCount: 5
        });
      }
    }

    if (activeLayers.includes('tasks')) {
      // Add a few tasks
      events.push({
        id: 'task-1', title: 'Fix Login', date: new Date(year, month, 5), type: 'task', priority: 'low'
      });
      events.push({
        id: 'task-2', title: 'UI Review', date: new Date(year, month, 5), type: 'task', priority: 'medium'
      });
      events.push({
        id: 'task-3', title: 'Client Meeting Prep', date: new Date(year, month, 12), type: 'task', priority: 'high'
      });
      events.push({
        id: 'task-4', title: 'Critical Auth Bug', date: new Date(year, month, 14), type: 'task', priority: 'critical'
      });
    }

    if (activeLayers.includes('missions')) {
      events.push({
        id: 'mission-1', title: 'Launch SOMS ERP v2', 
        date: new Date(year, month - 1, 1), 
        endDate: new Date(year, month + 3, 30), 
        type: 'mission'
      });
    }

    if (activeLayers.includes('goals')) {
      events.push({
        id: 'goal-1', title: 'Increase Sales Q2', date: new Date(year, month, 30), type: 'goal', progress: 82
      });
      events.push({
        id: 'goal-2', title: 'Complete Employee Onboarding', date: new Date(year, month, 15), type: 'goal', progress: 76
      });
    }

    if (activeLayers.includes('leaves')) {
      events.push({
        id: 'leave-1', title: 'Sarah - Annual Paid', date: new Date(year, month, 10), endDate: new Date(year, month, 14), type: 'leave'
      });
      events.push({
        id: 'leave-2', title: 'John - Medical Leave', date: new Date(year, month, 5), endDate: new Date(year, month, 6), type: 'leave'
      });
      events.push({
        id: 'leave-3', title: 'Alex - Casual Leave', date: new Date(year, month, 20), type: 'leave'
      });
      events.push({
        id: 'leave-4', title: 'Emma - Unpaid Leave', date: new Date(year, month, 25), endDate: new Date(year, month, 27), type: 'leave'
      });
      events.push({
        id: 'leave-5', title: 'Michael - Emergency Leave', date: new Date(year, month, 2), type: 'leave'
      });
    }
    
    if (activeLayers.includes('training')) {
      events.push({
        id: 'train-1', title: 'Security Compliance 101', date: new Date(year, month, 20), type: 'training'
      });
    }

    if (activeLayers.includes('birthdays')) {
      events.push({
        id: 'bday-1', title: 'David', date: new Date(year, month, 22), type: 'birthday'
      });
    }

    if (activeLayers.includes('meetings')) {
      events.push({
        id: 'meet-1', title: 'Daily Standup', date: new Date(year, month, 12), startTime: new Date(year, month, 12, 10, 30), type: 'meeting'
      });
      events.push({
        id: 'meet-2', title: 'Project Review', date: new Date(year, month, 12), startTime: new Date(year, month, 12, 14, 0), type: 'meeting'
      });
    }
    
    if (activeLayers.includes('attendance')) {
      // Mock some attendance dots for the past few days
      for(let i=1; i<=11; i++) {
        if(new Date(year, month, i).getDay() !== 0 && new Date(year, month, i).getDay() !== 6) { // skip weekends
          events.push({
            id: `att-${i}`, title: 'Present', date: new Date(year, month, i), type: 'attendance'
          });
        }
      }
    }

    return events;
  }
}
