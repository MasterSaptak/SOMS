export interface OrganizationCalendarSettings {
  workingDays: string[];
  weekStart: string;
  defaultTimezone: string;
  calendarCountry: 'India' | 'Bangladesh' | 'Austria' | 'Global';
  workHours: { start: string; end: string };
}

export class ConfigEngine {
  /**
   * Fetches organization settings.
   * Hardcoded defaults for now until integrated with the DB properly.
   */
  static getSettings(): OrganizationCalendarSettings {
    return {
      workingDays: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'], // Wednesday & Sunday off
      weekStart: 'Monday',
      defaultTimezone: 'Asia/Kolkata',
      calendarCountry: 'India',
      workHours: { start: '09:00', end: '18:00' }
    };
  }

  /**
   * Checks if a specific Date is a working day according to company rules
   */
  static isWorkingDay(date: Date, settings: OrganizationCalendarSettings): boolean {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = days[date.getDay()];
    return settings.workingDays.includes(dayName);
  }
}
