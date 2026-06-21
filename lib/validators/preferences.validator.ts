import { z } from 'zod'

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  accent: z.enum(['violet', 'blue', 'emerald', 'amber', 'rose', 'orange']).optional(),
  language: z.enum(['en', 'ar', 'fr', 'es', 'de', 'ja', 'zh']).optional(),
  density: z.enum(['compact', 'comfortable', 'spacious']).optional(),
  timezone: z.string().optional(),
  currency: z.enum(['USD', 'EUR', 'GBP', 'PKR', 'INR', 'SAR', 'AED']).optional(),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']).optional(),
  sidebarCollapsed: z.boolean().optional(),
  dashboardLayout: z.array(z.string()).optional(),
  workingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
    end: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:mm)'),
    timezone: z.string(),
  }).optional(),
  calendarView: z.enum(['month', 'week', 'day', 'agenda']).optional(),
  animationsEnabled: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  fontSize: z.enum(['sm', 'md', 'lg']).optional(),
  emailNotifications: z.boolean().optional(),
  desktopNotifications: z.boolean().optional(),
  keyboardShortcutsEnabled: z.boolean().optional(),
})

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>
