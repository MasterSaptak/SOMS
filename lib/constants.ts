// ============================================================
// SOMS Enterprise — Constants & Configuration
// ============================================================

import type { UserRole, PermissionAction, PermissionResource, TaskStatus, TaskPriority, LeaveType, LeaveStatus, BreakType, AssetCategory, AssetCondition, AnnouncementCategory, NotificationType } from './types'

// --- Roles ---
export const ROLES: Record<UserRole, { label: string; color: string }> = {
  super_admin: { label: 'Super Admin', color: 'bg-red-500' },
  hr_manager: { label: 'HR Manager', color: 'bg-purple-500' },
  dept_manager: { label: 'Dept Manager', color: 'bg-blue-500' },
  team_lead: { label: 'Team Lead', color: 'bg-cyan-500' },
  employee: { label: 'Employee', color: 'bg-emerald-500' },
  receptionist: { label: 'Receptionist', color: 'bg-amber-500' },
}

// --- Permission Matrix ---
export const ROLE_PERMISSIONS: Record<UserRole, { resource: PermissionResource; actions: PermissionAction[] }[]> = {
  super_admin: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'tasks', actions: ['view', 'create', 'update', 'delete', 'assign'] },
    { resource: 'leaves', actions: ['view', 'create', 'update', 'approve', 'reject'] },
    { resource: 'hr', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'payroll', actions: ['view', 'create', 'update'] },
    { resource: 'assets', actions: ['view', 'create', 'update', 'delete', 'assign'] },
    { resource: 'visitors', actions: ['view', 'create', 'update'] },
    { resource: 'rooms', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'analytics', actions: ['view'] },
    { resource: 'announcements', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'settings', actions: ['view', 'update'] },
    { resource: 'timeline', actions: ['view'] },
    { resource: 'calendar', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'chat', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'meetings', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'documents', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'goals', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'knowledge', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'surveys', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'workflows', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'features', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'audit', actions: ['view'] },
  ],
  hr_manager: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'tasks', actions: ['view', 'create', 'update', 'delete', 'assign'] },
    { resource: 'leaves', actions: ['view', 'create', 'update', 'approve', 'reject'] },
    { resource: 'hr', actions: ['view', 'create', 'update'] },
    { resource: 'payroll', actions: ['view', 'create', 'update'] },
    { resource: 'assets', actions: ['view', 'create', 'update', 'assign'] },
    { resource: 'rooms', actions: ['view', 'create'] },
    { resource: 'analytics', actions: ['view'] },
    { resource: 'announcements', actions: ['view', 'create', 'update'] },
    { resource: 'timeline', actions: ['view'] },
    { resource: 'calendar', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'chat', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'meetings', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'documents', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'goals', actions: ['view', 'create', 'update'] },
    { resource: 'knowledge', actions: ['view', 'create', 'update'] },
    { resource: 'surveys', actions: ['view', 'create', 'update'] },
    { resource: 'workflows', actions: ['view', 'create', 'update'] },
    { resource: 'audit', actions: ['view'] },
  ],
  dept_manager: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'tasks', actions: ['view', 'create', 'update', 'delete', 'assign'] },
    { resource: 'leaves', actions: ['view', 'create', 'approve', 'reject'] },
    { resource: 'rooms', actions: ['view', 'create'] },
    { resource: 'analytics', actions: ['view'] },
    { resource: 'announcements', actions: ['view', 'create'] },
    { resource: 'timeline', actions: ['view'] },
    { resource: 'calendar', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'chat', actions: ['view', 'create'] },
    { resource: 'meetings', actions: ['view', 'create', 'update', 'delete'] },
    { resource: 'documents', actions: ['view', 'create'] },
    { resource: 'goals', actions: ['view', 'create', 'update'] },
    { resource: 'knowledge', actions: ['view', 'create'] },
    { resource: 'surveys', actions: ['view', 'create'] },
  ],
  team_lead: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'tasks', actions: ['view', 'create', 'update', 'assign'] },
    { resource: 'leaves', actions: ['view', 'create', 'approve'] },
    { resource: 'rooms', actions: ['view', 'create'] },
    { resource: 'announcements', actions: ['view'] },
    { resource: 'timeline', actions: ['view'] },
    { resource: 'calendar', actions: ['view', 'create', 'update'] },
    { resource: 'chat', actions: ['view', 'create'] },
    { resource: 'meetings', actions: ['view', 'create', 'update'] },
    { resource: 'documents', actions: ['view', 'create'] },
    { resource: 'goals', actions: ['view', 'create', 'update'] },
    { resource: 'knowledge', actions: ['view'] },
    { resource: 'surveys', actions: ['view'] },
  ],
  employee: [
    { resource: 'dashboard', actions: ['view'] },
    { resource: 'tasks', actions: ['view', 'create', 'update'] },
    { resource: 'leaves', actions: ['view', 'create'] },
    { resource: 'assets', actions: ['view'] },
    { resource: 'rooms', actions: ['view', 'create'] },
    { resource: 'announcements', actions: ['view'] },
    { resource: 'payroll', actions: ['view'] },
    { resource: 'timeline', actions: ['view'] },
    { resource: 'calendar', actions: ['view', 'create', 'update'] },
    { resource: 'chat', actions: ['view', 'create'] },
    { resource: 'meetings', actions: ['view', 'create'] },
    { resource: 'documents', actions: ['view', 'create', 'update'] },
    { resource: 'goals', actions: ['view', 'create', 'update'] },
    { resource: 'knowledge', actions: ['view'] },
    { resource: 'surveys', actions: ['view', 'update'] },
  ],
  receptionist: [
    { resource: 'leaves', actions: ['view', 'create'] },
    { resource: 'visitors', actions: ['view', 'create', 'update'] },
    { resource: 'announcements', actions: ['view'] },
    { resource: 'calendar', actions: ['view'] },
    { resource: 'chat', actions: ['view'] },
    { resource: 'knowledge', actions: ['view'] },
  ],
}

// --- Task Statuses ---
export const TASK_STATUSES: Record<TaskStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-slate-600 dark:text-slate-400', bgColor: 'bg-slate-500/10' },
  in_progress: { label: 'In Progress', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10' },
  blocked: { label: 'Blocked', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500/10' },
  completed: { label: 'Completed', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/10' },
  overdue: { label: 'Overdue', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10' },
}

export const TASK_PRIORITIES: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
  medium: { label: 'Medium', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  high: { label: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  critical: { label: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500/10' },
}

export const KANBAN_COLUMNS: TaskStatus[] = ['pending', 'in_progress', 'blocked', 'completed']

// --- Leave Types ---
export const LEAVE_TYPES: Record<LeaveType, { label: string; color: string; icon: string; maxDays: number }> = {
  casual: { label: 'Casual Leave', color: 'text-blue-500', icon: '🏖️', maxDays: 2 },
  medical: { label: 'Medical Leave', color: 'text-red-500', icon: '🏥', maxDays: 2 },
  emergency: { label: 'Emergency Leave', color: 'text-amber-500', icon: '🚨', maxDays: 999 },
  custom: { label: 'Custom Leave', color: 'text-purple-500', icon: '⚙️', maxDays: 999 },
}

export const LEAVE_STATUSES: Record<LeaveStatus, { label: string; color: string; bgColor: string }> = {
  submitted: { label: 'Submitted', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  hr_verification: { label: 'HR Verification', color: 'text-orange-600', bgColor: 'bg-orange-500/10' },
  manager_approval: { label: 'Manager Approval', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  payroll_processing: { label: 'Payroll Processing', color: 'text-indigo-600', bgColor: 'bg-indigo-500/10' },
  completed: { label: 'Completed', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  pending: { label: 'Pending', color: 'text-amber-600', bgColor: 'bg-amber-500/10' },
  manager_approved: { label: 'Manager Approved', color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
  hr_approved: { label: 'Approved', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-500/10' },
  cancelled: { label: 'Cancelled', color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
}

// --- Break Types ---
export const BREAK_TYPES: Record<BreakType, { label: string; color: string; maxMinutes: number }> = {
  lunch: { label: 'Lunch Break', color: 'bg-orange-500', maxMinutes: 60 },
  food: { label: 'Snack / Coffee', color: 'bg-amber-600', maxMinutes: 15 },
  personal: { label: 'Personal', color: 'bg-blue-500', maxMinutes: 15 },
  emergency: { label: 'Emergency', color: 'bg-red-500', maxMinutes: 30 },
  paused: { label: 'Paused', color: 'bg-slate-500', maxMinutes: 999 },
}

// --- Asset Categories ---
export const ASSET_CATEGORIES: Record<AssetCategory, { label: string; icon: string }> = {
  laptop: { label: 'Laptop', icon: '💻' },
  desktop: { label: 'Desktop', icon: '🖥️' },
  monitor: { label: 'Monitor', icon: '📺' },
  phone: { label: 'Phone', icon: '📱' },
  accessory: { label: 'Accessory', icon: '🎧' },
}

export const ASSET_CONDITIONS: Record<AssetCondition, { label: string; color: string }> = {
  new: { label: 'New', color: 'text-emerald-500' },
  good: { label: 'Good', color: 'text-blue-500' },
  fair: { label: 'Fair', color: 'text-amber-500' },
  poor: { label: 'Poor', color: 'text-orange-500' },
  retired: { label: 'Retired', color: 'text-slate-500' },
}

// --- Announcement Categories ---
export const ANNOUNCEMENT_CATEGORIES: Record<AnnouncementCategory, { label: string; color: string; icon: string }> = {
  news: { label: 'Company News', color: 'text-blue-500', icon: '📰' },
  event: { label: 'Event', color: 'text-purple-500', icon: '🎉' },
  policy: { label: 'Policy Update', color: 'text-amber-500', icon: '📋' },
  holiday: { label: 'Holiday Notice', color: 'text-emerald-500', icon: '🎊' },
}

// --- Notification Types ---
export const NOTIFICATION_TYPES: Record<NotificationType, { label: string; icon: string }> = {
  task_assigned: { label: 'Task Assigned', icon: '📋' },
  leave_approved: { label: 'Leave Approved', icon: '✅' },
  leave_rejected: { label: 'Leave Rejected', icon: '❌' },
  meeting_reminder: { label: 'Meeting Reminder', icon: '📅' },
  attendance_alert: { label: 'Attendance Alert', icon: '⏰' },
  announcement: { label: 'Announcement', icon: '📢' },
  system: { label: 'System', icon: '⚙️' },
}

// --- Navigation ---
export const NAV_ITEMS = {
  employee: [
    { label: 'Dashboard', href: '/employee', icon: 'LayoutDashboard' },
    { label: 'Timeline', href: '/employee/timeline', icon: 'History' },
    { label: 'Work Session', href: '/employee/session', icon: 'Clock' },
    { label: 'Calendar', href: '/employee/calendar', icon: 'Calendar' },
    { label: 'Tasks', href: '/employee/tasks', icon: 'CheckSquare' },
    { label: 'Chat', href: '/employee/chat', icon: 'MessageSquare' },
    { label: 'Meetings', href: '/employee/meetings', icon: 'Video' },
    { label: 'Leaves', href: '/employee/leaves', icon: 'CalendarRange' },
    { label: 'Documents', href: '/employee/documents', icon: 'FileText' },
    { label: 'Goals', href: '/employee/goals', icon: 'Target' },
    { label: 'Knowledge Base', href: '/employee/knowledge', icon: 'BookOpen' },
    { label: 'Surveys', href: '/employee/surveys', icon: 'ClipboardList' },
    { label: 'Assets', href: '/employee/assets', icon: 'Monitor' },
    { label: 'Meeting Rooms', href: '/employee/rooms', icon: 'DoorOpen' },
    { label: 'Announcements', href: '/employee/announcements', icon: 'Megaphone' },
    { label: 'Debt Recovery', href: '/employee/recovery', icon: 'Activity' },
    { label: 'Rewards', href: '/employee/rewards', icon: 'Wallet' },
    { label: 'Achievements', href: '/employee/achievements', icon: 'Trophy' },
  ],
  admin: [
    { label: 'Analytics', href: '/admin/analytics', icon: 'BarChart4' },
    { label: 'HR Management', href: '/admin/hr', icon: 'Users' },
    { label: 'Leave Management', href: '/admin/leaves', icon: 'CalendarRange' },
    { label: 'Payroll', href: '/admin/payroll', icon: 'Banknote' },
    { label: 'Audit & Compliance', href: '/admin/audit', icon: 'ShieldAlert' },
    { label: 'Workflows', href: '/admin/workflows', icon: 'Workflow' },
    { label: 'Feature Flags', href: '/admin/features', icon: 'ToggleLeft' },
  ],
  reception: [
    { label: 'Visitors', href: '/reception', icon: 'UserPlus' },
  ],
} as const

// --- App Config ---
export const APP_CONFIG = {
  dailyTargetHours: 8,
  dailyTargetSeconds: 8 * 60 * 60,
  maxDebtRecoveryMinutesPerDay: 30,
  debtRecoveryDeadlineDays: 8,
  idleTimeoutMinutes: 5,
  sessionPersistKey: 'soms-session',
} as const
