export type Role = 'super_admin' | 'org_owner' | 'hr_manager' | 'team_manager' | 'employee' | 'intern'

export type Resource = 
  | 'users' 
  | 'leaves' 
  | 'assets' 
  | 'tasks' 
  | 'meetings' 
  | 'announcements' 
  | 'analytics' 
  | 'settings'
  | 'audit'

export type Action = 'create' | 'read' | 'update' | 'delete' | 'manage'

type Permissions = {
  [key in Resource]?: Action[] | 'all'
}

type RolePermissions = {
  [key in Role]: Permissions
}

export const ROLE_PERMISSIONS: RolePermissions = {
  super_admin: {
    users: 'all',
    leaves: 'all',
    assets: 'all',
    tasks: 'all',
    meetings: 'all',
    announcements: 'all',
    analytics: 'all',
    settings: 'all',
    audit: 'all',
  },
  org_owner: {
    users: 'all',
    leaves: 'all',
    assets: 'all',
    tasks: 'all',
    meetings: 'all',
    announcements: 'all',
    analytics: 'all',
    settings: 'all',
    audit: 'all', // Can view audit logs for their org
  },
  hr_manager: {
    users: 'all',
    leaves: 'all',
    assets: ['create', 'read', 'update'],
    tasks: ['read'],
    meetings: ['create', 'read', 'update'],
    announcements: 'all',
    analytics: ['read'],
    settings: ['read'],
    audit: ['read'],
  },
  team_manager: {
    users: ['read'],
    leaves: ['read', 'update'], // Can approve/reject
    assets: ['read'],
    tasks: 'all',
    meetings: 'all',
    announcements: ['read'],
    analytics: ['read'],
    settings: ['read'],
  },
  employee: {
    users: ['read'],
    leaves: ['create', 'read'],
    assets: ['read'],
    tasks: ['create', 'read', 'update'], // Can update their own tasks
    meetings: ['create', 'read', 'update'],
    announcements: ['read'],
    analytics: ['read'], // Can view their own analytics
  },
  intern: {
    users: ['read'],
    leaves: ['create', 'read'],
    assets: ['read'],
    tasks: ['read', 'update'], // Can only update assigned tasks
    meetings: ['read'], // Can only attend/read meetings
    announcements: ['read'],
  }
}

export function hasPermission(role: Role, resource: Resource, action: Action): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  
  if (!permissions) return false
  
  const resourcePermissions = permissions[resource]
  
  if (!resourcePermissions) return false
  if (resourcePermissions === 'all') return true
  
  return resourcePermissions.includes(action) || resourcePermissions.includes('manage')
}
