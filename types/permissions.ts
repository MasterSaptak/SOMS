// ============================================================
// SOMS Enterprise — Permission & RBAC Domain Types
// ============================================================

// String-based permission keys (resource.action format)
// This replaces the old enum-based approach
export type PermissionKey =
  // Attendance
  | 'attendance.read'
  | 'attendance.update'
  | 'attendance.delete'
  // Employees / HR (Master Record Permissions)
  | 'employee.create'
  | 'employee.read'
  | 'employee.update'
  | 'employee.delete'
  | 'employee.profile.view'
  | 'employee.profile.edit'
  | 'employee.skills.view'
  | 'employee.skills.edit'
  | 'employee.contacts.view'
  | 'employee.contacts.edit'
  | 'employee.employment.edit'
  | 'employee.summary.view'
  | 'employee.documents.view'
  | 'employee.documents.edit'
  | 'employee.certifications.view'
  | 'employee.certifications.edit'
  | 'employee.education.view'
  | 'employee.education.edit'
  | 'employee.experience.view'
  | 'employee.experience.edit'
  // Leaves
  | 'leave.create'
  | 'leave.read'
  | 'leave.update'
  | 'leave.approve'
  | 'leave.reject'
  // Tasks
  | 'task.create'
  | 'task.read'
  | 'task.update'
  | 'task.delete'
  | 'task.assign'
  // Assets
  | 'asset.create'
  | 'asset.read'
  | 'asset.update'
  | 'asset.delete'
  | 'asset.assign'
  // Meetings & Rooms
  | 'meeting.create'
  | 'meeting.read'
  | 'meeting.update'
  | 'meeting.delete'
  | 'meeting.manage'
  | 'room.create'
  | 'room.read'
  | 'room.book'
  | 'room.manage'
  // Documents
  | 'document.create'
  | 'document.read'
  | 'document.update'
  | 'document.delete'
  | 'document.approve'
  // Analytics & Reports
  | 'analytics.read'
  | 'analytics.export'
  | 'report.generate'
  // Payroll
  | 'payroll.read'
  | 'payroll.manage'
  // Projects
  | 'project.create'
  | 'project.read'
  | 'project.update'
  | 'project.delete'
  | 'project.edit'
  // Announcements
  | 'announcement.create'
  | 'announcement.read'
  | 'announcement.update'
  | 'announcement.delete'
  // Organizations & Settings
  | 'organization.read'
  | 'organization.update'
  | 'organization.manage'
  // Admin
  | 'audit.read'
  | 'feature.manage'
  | 'role.manage'
  | 'permission.manage'
  | 'user.invite'
  | 'user.remove'
  | 'settings.read'
  | 'settings.manage'

// Any string permission for extensibility
export type Permission = PermissionKey | string

export interface PermissionRecord {
  id: string
  key: Permission
  name: string
  description: string | null
  category: string
  createdAt: string
}

export interface Role {
  id: string
  name: string
  displayName: string
  organizationId: string | null // null = system role
  isSystem: boolean
  permissions: Permission[]
  createdAt: string
}

export interface UserRole {
  id: string
  userId: string
  organizationId: string
  roleId: string
  assignedAt: string
  assignedBy: string | null
  // Eager-loaded
  role?: Role
}

export interface RolePermission {
  id: string
  roleId: string
  permissionKey: Permission
  createdAt: string
}

// Resolved effective permissions for a user in an org
export interface EffectivePermissions {
  userId: string
  organizationId: string
  roles: string[]
  permissions: Set<Permission>
  resolvedAt: string
}

// For the UI permission checks
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
}
