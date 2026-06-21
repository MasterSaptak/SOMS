// ============================================================
// SOMS Enterprise — User Preferences & Feature Flag Types
// ============================================================

export type AppTheme = 'light' | 'dark' | 'system'
export type AppAccent = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'orange'
export type AppLanguage = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'ja' | 'zh'
export type AppDensity = 'compact' | 'comfortable' | 'spacious'
export type CalendarView = 'month' | 'week' | 'day' | 'agenda'
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD'
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'PKR' | 'INR' | 'SAR' | 'AED'

export interface WorkingHours {
  start: string  // HH:mm
  end: string    // HH:mm
  timezone: string
}

export interface UserPreferences {
  // Appearance
  theme: AppTheme
  accent: AppAccent
  language: AppLanguage
  density: AppDensity
  // Regional
  timezone: string
  currency: CurrencyCode
  dateFormat: DateFormat
  // Layout
  sidebarCollapsed: boolean
  dashboardLayout: string[]  // ordered widget IDs
  // Work
  workingHours: WorkingHours
  calendarView: CalendarView
  // Accessibility
  animationsEnabled: boolean
  highContrast: boolean
  fontSize: 'sm' | 'md' | 'lg'
  // Notifications
  emailNotifications: boolean
  desktopNotifications: boolean
  // Keyboard shortcuts
  keyboardShortcutsEnabled: boolean
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'dark',
  accent: 'violet',
  language: 'en',
  density: 'comfortable',
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  sidebarCollapsed: false,
  dashboardLayout: ['stats', 'activity', 'tasks', 'calendar', 'announcements'],
  workingHours: { start: '09:00', end: '18:00', timezone: 'UTC' },
  calendarView: 'month',
  animationsEnabled: true,
  highContrast: false,
  fontSize: 'md',
  emailNotifications: true,
  desktopNotifications: true,
  keyboardShortcutsEnabled: true,
}

// ============================================================
// Feature Flag Types
// ============================================================

export type FeatureFlagKey =
  | 'ai_assistant'
  | 'payroll'
  | 'crm'
  | 'meetings'
  | 'assets'
  | 'reports'
  | 'knowledge_base'
  | 'surveys'
  | 'goals'
  | 'chat'
  | 'video_calls'
  | 'documents'
  | 'recruitment'
  | 'performance_review'
  | string // extensible

export interface FeatureFlag {
  id: string
  key: FeatureFlagKey
  name: string
  description: string | null
  isEnabled: boolean
  rolloutPercentage: number  // 0-100
  createdAt: string
  updatedAt: string
}

export interface OrganizationFeature {
  id: string
  organizationId: string
  featureKey: FeatureFlagKey
  isEnabled: boolean
  config: Record<string, unknown> | null
  enabledAt: string | null
  enabledBy: string | null
}
