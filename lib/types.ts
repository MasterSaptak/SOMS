// ============================================================
// SOMS Enterprise — Core TypeScript Types
// ============================================================

// --- Identity & Auth ---
export type UserRole = 'super_admin' | 'hr_manager' | 'dept_manager' | 'team_lead' | 'employee' | 'receptionist'

export interface User {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

export interface Employee {
  id: string
  userId: string
  departmentId: string
  employeeCode: string
  firstName: string
  lastName: string
  designation: string
  phone: string
  avatarUrl: string
  joinDate: string
  status: 'active' | 'on_leave' | 'terminated'
  createdAt: string
}

export interface Department {
  id: string
  name: string
  headId: string | null
  createdAt: string
}

export interface Role {
  id: string
  name: UserRole
  displayName: string
}

export interface Permission {
  id: string
  action: PermissionAction
  resource: PermissionResource
}

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'assign'
export type PermissionResource = 'dashboard' | 'tasks' | 'leaves' | 'hr' | 'payroll' | 'assets' | 'visitors' | 'rooms' | 'analytics' | 'announcements' | 'settings'

// --- Attendance & Sessions ---
export type WorkSessionState = 'idle' | 'working' | 'break'
export type BreakType = 'lunch' | 'food' | 'personal' | 'emergency'
export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'wfh'

export interface AttendanceLog {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  totalWorkSeconds: number
  totalBreakSeconds: number
  status: AttendanceStatus
}

export interface WorkSession {
  id: string
  employeeId: string
  attendanceId: string
  startTime: string
  endTime: string | null
  durationSeconds: number
  sessionType: 'regular' | 'overtime' | 'recovery'
}

export interface BreakLog {
  id: string
  sessionId: string
  breakType: BreakType
  startTime: string
  endTime: string | null
  durationSeconds: number
}

// --- Tasks ---
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'overdue'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdBy: string
  assignedTo: string
  dueDate: string | null
  completedAt: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface TaskComment {
  id: string
  taskId: string
  authorId: string
  content: string
  createdAt: string
}

export interface TaskAttachment {
  id: string
  taskId: string
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedBy: string
  createdAt: string
}

// --- Leaves ---
export type LeaveType = 'casual' | 'medical' | 'emergency' | 'wfh'
export type LeaveStatus = 'pending' | 'manager_approved' | 'hr_approved' | 'rejected' | 'cancelled'

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: LeaveStatus
  managerId: string | null
  hrId: string | null
  createdAt: string
  updatedAt: string
}

export interface LeaveBalance {
  casual: number
  medical: number
  emergency: number
  wfh: number
}

// --- Announcements ---
export type AnnouncementCategory = 'news' | 'event' | 'policy' | 'holiday'
export type AnnouncementPriority = 'normal' | 'important' | 'urgent'

export interface Announcement {
  id: string
  title: string
  content: string
  category: AnnouncementCategory
  priority: AnnouncementPriority
  targetAudience: string[] | 'all'
  isPinned: boolean
  authorId: string
  attachmentUrl: string | null
  imageUrl: string | null
  createdAt: string
}

// --- Meeting Rooms ---
export interface MeetingRoom {
  id: string
  name: string
  capacity: number
  floor: string
  amenities: string[]
  isActive: boolean
}

export interface RoomBooking {
  id: string
  roomId: string
  bookedBy: string
  title: string
  startTime: string
  endTime: string
  attendees: string[]
  status: 'confirmed' | 'cancelled'
  createdAt: string
}

// --- Assets ---
export type AssetCategory = 'laptop' | 'desktop' | 'monitor' | 'phone' | 'accessory'
export type AssetCondition = 'new' | 'good' | 'fair' | 'poor' | 'retired'
export type AssetStatus = 'available' | 'assigned' | 'maintenance' | 'retired'

export interface Asset {
  id: string
  name: string
  category: AssetCategory
  serialNumber: string
  purchaseDate: string
  warrantyExpiry: string
  condition: AssetCondition
  status: AssetStatus
}

export interface AssetAssignment {
  id: string
  assetId: string
  employeeId: string
  assignedDate: string
  returnedDate: string | null
  notes: string
}

// --- Visitors ---
export interface VisitorLog {
  id: string
  visitorName: string
  company: string
  phone: string
  purpose: string
  hostId: string
  checkIn: string
  checkOut: string | null
  badgeNumber: string
  status: 'checked_in' | 'checked_out'
}

// --- AI & Productivity ---
export type InsightSeverity = 'info' | 'warning' | 'critical'

export interface ProductivityScore {
  id: string
  employeeId: string
  date: string
  score: number
  factors: Record<string, number>
}

export interface AIInsight {
  id: string
  employeeId: string
  insightType: 'burnout_warning' | 'productivity_tip' | 'pattern' | 'improvement'
  title: string
  content: string
  severity: InsightSeverity
  isRead: boolean
  createdAt: string
}

// --- Notifications ---
export type NotificationType = 'task_assigned' | 'leave_approved' | 'leave_rejected' | 'meeting_reminder' | 'attendance_alert' | 'announcement' | 'system'

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  actionUrl: string | null
  createdAt: string
}

// --- Rewards & Achievements ---
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum'

export interface Reward {
  id: string
  employeeId: string
  amount: number
  reason: string
  type: 'earned' | 'spent'
  createdAt: string
}

export interface Achievement {
  id: string
  employeeId: string
  achievementId: string
  title: string
  description: string
  tier: AchievementTier
  xp: number
  currentProgress: number
  targetProgress: number
  unlockedAt: string | null
}

// --- Payroll ---
export interface SalaryStructure {
  id: string
  employeeId: string
  baseSalary: number
  hra: number
  da: number
  specialAllowance: number
  bonus: number
  pf: number
  tax: number
  esi: number
  professionalTax: number
  effectiveFrom: string
}

export interface Payslip {
  id: string
  employeeId: string
  month: string // YYYY-MM
  grossSalary: number
  totalDeductions: number
  netSalary: number
  status: 'draft' | 'generated' | 'paid'
  generatedAt: string
}

// --- Audit ---
export interface AuditLog {
  id: string
  userId: string
  action: 'create' | 'update' | 'delete' | 'login' | 'logout'
  resource: string
  resourceId: string
  oldValue: Record<string, unknown> | null
  newValue: Record<string, unknown> | null
  createdAt: string
}
