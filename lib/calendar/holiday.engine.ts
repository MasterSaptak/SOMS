export type Country = 'India' | 'Bangladesh' | 'Austria' | 'Global';

export interface Holiday {
  name: string;
  date: string; // ISO YYYY-MM-DD or MM-DD for recurring
  description: string;
  isGovernmentHoliday: boolean;
  isWorkingHoliday: boolean;
  states?: string[]; // Specific states/regions, empty if national
  type: 'national' | 'regional' | 'global' | 'religious';
  religion?: string;
  wikipediaUrl?: string;
}

const HOLIDAY_DATABASE: Record<Country, Holiday[]> = {
  India: [
    { name: 'Republic Day', date: '01-26', description: 'Honors the date on which the Constitution of India came into effect.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national', wikipediaUrl: 'https://en.wikipedia.org/wiki/Republic_Day_(India)' },
    { name: 'Independence Day', date: '08-15', description: 'Commemorates the nation\'s independence from the United Kingdom.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national', wikipediaUrl: 'https://en.wikipedia.org/wiki/Independence_Day_(India)' },
    { name: 'Gandhi Jayanti', date: '10-02', description: 'Marks the birth anniversary of Mahatma Gandhi.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national', wikipediaUrl: 'https://en.wikipedia.org/wiki/Gandhi_Jayanti' },
    { name: 'Holi', date: '2026-03-03', description: 'Festival of colors.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'religious', religion: 'Hindu' },
    { name: 'Diwali', date: '2026-11-08', description: 'Festival of lights.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'religious', religion: 'Hindu' },
    { name: 'Durga Puja', date: '2026-10-19', description: 'Annual Hindu festival originating in the Indian subcontinent.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'regional', states: ['West Bengal', 'Assam', 'Odisha', 'Tripura'], religion: 'Hindu' },
    { name: 'Poila Boishakh', date: '04-15', description: 'Bengali New Year.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'regional', states: ['West Bengal', 'Tripura'] }
  ],
  Bangladesh: [
    { name: 'Language Martyrs Day', date: '02-21', description: 'Commemorates the 1952 Bengali language movement.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national' },
    { name: 'Independence Day', date: '03-26', description: 'Commemorates the country\'s declaration of independence.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national' },
    { name: 'Victory Day', date: '12-16', description: 'Commemorates the defeat of the Pakistan Armed Forces.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national' },
    { name: 'Pohela Boishakh', date: '04-14', description: 'Bengali New Year.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national' },
    { name: 'Eid-ul-Fitr', date: '2026-03-20', description: 'Marks the end of Ramadan.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'religious', religion: 'Islam' }
  ],
  Austria: [
    { name: 'New Year\'s Day', date: '01-01', description: 'First day of the year.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national' },
    { name: 'Epiphany', date: '01-06', description: 'Christian feast day.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'religious', religion: 'Christian' },
    { name: 'National Day', date: '10-26', description: 'Commemorates the Declaration of Neutrality.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'national' },
    { name: 'Christmas', date: '12-25', description: 'Celebrates the birth of Jesus.', isGovernmentHoliday: true, isWorkingHoliday: false, type: 'religious', religion: 'Christian' }
  ],
  Global: [
    { name: 'World Environment Day', date: '06-05', description: 'Encouraging worldwide awareness and action for the environment.', isGovernmentHoliday: false, isWorkingHoliday: true, type: 'global' },
    { name: 'Earth Day', date: '04-22', description: 'Support for environmental protection.', isGovernmentHoliday: false, isWorkingHoliday: true, type: 'global' },
    { name: 'International Women\'s Day', date: '03-08', description: 'Celebrates the cultural, political, and socioeconomic achievements of women.', isGovernmentHoliday: false, isWorkingHoliday: true, type: 'global' }
  ]
};

export class HolidayEngine {
  /**
   * Fetch holidays based on country, state, and year.
   */
  static getHolidays(country: Country, year: number, state?: string): Holiday[] {
    const holidays = HOLIDAY_DATABASE[country] || [];
    const globalHolidays = HOLIDAY_DATABASE['Global'] || [];
    
    // Merge country + global
    let combined = [...holidays, ...globalHolidays];

    // Filter by state if provided
    if (state) {
      combined = combined.filter(h => !h.states || h.states.length === 0 || h.states.includes(state));
    }

    // Resolve recurring dates (MM-DD) to full YYYY-MM-DD
    combined = combined.map(h => {
      let resolvedDate = h.date;
      if (h.date.length === 5) { // MM-DD
        resolvedDate = `${year}-${h.date}`;
      }
      return { ...h, date: resolvedDate };
    });

    return combined;
  }
}
