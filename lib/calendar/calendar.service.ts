import { HolidayEngine, Country } from './holiday.engine';
import { ConfigEngine } from './config.engine';

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  type: 'holiday' | 'attendance' | 'leave' | 'meeting' | 'project' | 'task' | 'birthday' | 'company_event';
  color: string;
  icon?: string;
  metadata?: any;
};

export class CalendarService {
  /**
   * Aggregates all events for a given month based on active layers
   */
  static async getMonthlyEvents(
    year: number,
    month: number,
    country: Country,
    activeLayers: string[]
  ): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = [];
    const settings = ConfigEngine.getSettings();
    
    // 1. Fetch Holidays
    if (activeLayers.includes('holidays')) {
      const holidays = HolidayEngine.getHolidays(country, year);
      holidays.forEach(h => {
        // Only include if it falls in this month
        const hDate = new Date(h.date);
        if (hDate.getMonth() === month && hDate.getFullYear() === year) {
          events.push({
            id: `holiday-${h.date}-${h.name}`,
            title: h.name,
            date: hDate,
            type: 'holiday',
            color: h.isGovernmentHoliday ? 'bg-purple-500/10 text-purple-600 border-purple-200' : 'bg-pink-500/10 text-pink-600 border-pink-200',
            metadata: h
          });
        }
      });
    }

    // 2. Fetch Company Events / Database Events (Mocked for now)
    if (activeLayers.includes('company_events')) {
      // Mock board meeting
      if (month === 5) { // June (0-indexed)
        events.push({
          id: 'company-event-1',
          title: 'Q2 Board Meeting',
          date: new Date(year, month, 15),
          type: 'company_event',
          color: 'bg-slate-800 text-white border-slate-700',
        });
      }
    }

    // 3. (Future) Fetch Attendance, Leaves, Meetings, Projects via Supabase
    // ...

    return events;
  }
}
