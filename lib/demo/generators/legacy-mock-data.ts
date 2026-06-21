// ============================================================
// SOMS Enterprise — Centralized Mock Data
// ============================================================

import type {
  User, Employee, Department, Team, Designation, WorkLocation,
  EmploymentDetails, EmergencyContact, EmployeeSkill,
  Task, LeaveRequest, LeaveBalance,
  Announcement, MeetingRoom, RoomBooking, Asset, AssetAssignment,
  Payslip, AttendanceLog, Reward, Achievement, VisitorLog,
  ProductivityScore, AIInsight, Notification, SalaryStructure
} from './types'

// ============================================================
// ORGANIZATION
// ============================================================

export const MOCK_ORG_ID = 'org-1'

// --- Users ---
export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@soms.io',      role: 'super_admin',  isActive: true, lastLogin: '2026-06-17T08:00:00Z', createdAt: '2025-01-01' },
  { id: 'u2', email: 'hr@soms.io',         role: 'hr_manager',   isActive: true, lastLogin: '2026-06-17T08:30:00Z', createdAt: '2025-01-01' },
  { id: 'u3', email: 'john@soms.io',       role: 'employee',     isActive: true, lastLogin: '2026-06-17T09:00:00Z', createdAt: '2025-03-15' },
  { id: 'u4', email: 'sarah@soms.io',      role: 'team_lead',    isActive: true, lastLogin: '2026-06-17T08:45:00Z', createdAt: '2025-02-01' },
  { id: 'u5', email: 'mike@soms.io',       role: 'dept_manager', isActive: true, lastLogin: '2026-06-16T17:00:00Z', createdAt: '2025-01-10' },
  { id: 'u6', email: 'reception@soms.io',  role: 'receptionist', isActive: true, lastLogin: '2026-06-17T07:55:00Z', createdAt: '2025-04-01' },
  { id: 'u7', email: 'alice@soms.io',      role: 'employee',     isActive: true, lastLogin: '2026-06-17T09:15:00Z', createdAt: '2025-05-10' },
  { id: 'u8', email: 'bob@soms.io',        role: 'employee',     isActive: true, lastLogin: '2026-06-16T18:00:00Z', createdAt: '2025-06-01' },
  { id: 'u9', email: 'neha@soms.io',       role: 'employee',     isActive: true, lastLogin: '2026-06-17T09:30:00Z', createdAt: '2025-07-15' },
  { id: 'u10', email: 'arjun@soms.io',     role: 'team_lead',    isActive: true, lastLogin: '2026-06-17T08:20:00Z', createdAt: '2025-02-20' },
]

// ============================================================
// STRUCTURAL ENTITIES
// ============================================================

// --- Work Locations ---
export const MOCK_WORK_LOCATIONS: WorkLocation[] = [
  { id: 'wl1', organizationId: MOCK_ORG_ID, name: 'HQ — Mumbai',    address: 'BKC, Bandra Kurla Complex, Mumbai 400051', timezone: 'Asia/Kolkata', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'wl2', organizationId: MOCK_ORG_ID, name: 'Pune Office',    address: 'Hinjewadi Phase 1, Pune 411057',           timezone: 'Asia/Kolkata', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'wl3', organizationId: MOCK_ORG_ID, name: 'Remote',         address: null,                                       timezone: 'UTC',          createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

// --- Designations ---
export const MOCK_DESIGNATIONS: Designation[] = [
  { id: 'dg1',  organizationId: MOCK_ORG_ID, title: 'Chief Executive Officer',       level: 100, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg2',  organizationId: MOCK_ORG_ID, title: 'Chief Technology Officer',      level: 95,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg3',  organizationId: MOCK_ORG_ID, title: 'Engineering Manager',           level: 70,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg4',  organizationId: MOCK_ORG_ID, title: 'Design Lead',                  level: 70,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg5',  organizationId: MOCK_ORG_ID, title: 'HR Manager',                   level: 70,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg6',  organizationId: MOCK_ORG_ID, title: 'Senior Software Engineer',      level: 50,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg7',  organizationId: MOCK_ORG_ID, title: 'Software Engineer',             level: 40,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg8',  organizationId: MOCK_ORG_ID, title: 'Product Designer',              level: 40,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg9',  organizationId: MOCK_ORG_ID, title: 'Front Desk Officer',            level: 30,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg10', organizationId: MOCK_ORG_ID, title: 'System Administrator',          level: 95,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg11', organizationId: MOCK_ORG_ID, title: 'Marketing Specialist',          level: 40,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'dg12', organizationId: MOCK_ORG_ID, title: 'Backend Engineer',              level: 40,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

// --- Departments ---
export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', organizationId: MOCK_ORG_ID, name: 'Engineering',      headId: 'e5',  parentId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'd2', organizationId: MOCK_ORG_ID, name: 'Design',           headId: 'e4',  parentId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'd3', organizationId: MOCK_ORG_ID, name: 'Human Resources',  headId: 'e2',  parentId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'd4', organizationId: MOCK_ORG_ID, name: 'Marketing',        headId: 'e9',  parentId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'd5', organizationId: MOCK_ORG_ID, name: 'Operations',       headId: null,  parentId: null, createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

// --- Teams ---
export const MOCK_TEAMS: Team[] = [
  { id: 't1', departmentId: 'd1', name: 'Frontend',        leadId: 'e7',  createdAt: '2025-01-15', updatedAt: '2025-01-15' },
  { id: 't2', departmentId: 'd1', name: 'Backend',         leadId: 'e10', createdAt: '2025-01-15', updatedAt: '2025-01-15' },
  { id: 't3', departmentId: 'd2', name: 'Product Design',  leadId: 'e4',  createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: 't4', departmentId: 'd3', name: 'HR Operations',   leadId: 'e2',  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 't5', departmentId: 'd4', name: 'Growth & Brand',  leadId: 'e9',  createdAt: '2025-03-01', updatedAt: '2025-03-01' },
]

// ============================================================
// EMPLOYEES (Full relational data)
// ============================================================

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1', userId: 'u1', organizationId: MOCK_ORG_ID,
    departmentId: null, teamId: null, designationId: 'dg10', workLocationId: 'wl1', managerId: null,
    employeeCode: 'EMP001', firstName: 'Admin', lastName: 'User',
    phone: '+91 98200 00001', avatarUrl: '',
    joinDate: '2025-01-01', status: 'active', createdAt: '2025-01-01',
  },
  {
    id: 'e2', userId: 'u2', organizationId: MOCK_ORG_ID,
    departmentId: 'd3', teamId: 't4', designationId: 'dg5', workLocationId: 'wl1', managerId: 'e1',
    employeeCode: 'EMP002', firstName: 'Priya', lastName: 'Sharma',
    phone: '+91 98200 00002', avatarUrl: '',
    joinDate: '2025-01-01', status: 'active', createdAt: '2025-01-01',
  },
  {
    id: 'e3', userId: 'u3', organizationId: MOCK_ORG_ID,
    departmentId: 'd2', teamId: 't3', designationId: 'dg8', workLocationId: 'wl1', managerId: 'e4',
    employeeCode: 'EMP003', firstName: 'John', lastName: 'Doe',
    phone: '+91 98200 00003', avatarUrl: '',
    joinDate: '2025-03-15', status: 'active', createdAt: '2025-03-15',
  },
  {
    id: 'e4', userId: 'u4', organizationId: MOCK_ORG_ID,
    departmentId: 'd2', teamId: 't3', designationId: 'dg4', workLocationId: 'wl1', managerId: 'e1',
    employeeCode: 'EMP004', firstName: 'Sarah', lastName: 'Chen',
    phone: '+91 98200 00004', avatarUrl: '',
    joinDate: '2025-02-01', status: 'active', createdAt: '2025-02-01',
  },
  {
    id: 'e5', userId: 'u5', organizationId: MOCK_ORG_ID,
    departmentId: 'd1', teamId: null, designationId: 'dg3', workLocationId: 'wl1', managerId: 'e1',
    employeeCode: 'EMP005', firstName: 'Mike', lastName: 'Johnson',
    phone: '+91 98200 00005', avatarUrl: '',
    joinDate: '2025-01-10', status: 'active', createdAt: '2025-01-10',
  },
  {
    id: 'e6', userId: 'u6', organizationId: MOCK_ORG_ID,
    departmentId: 'd5', teamId: null, designationId: 'dg9', workLocationId: 'wl1', managerId: 'e2',
    employeeCode: 'EMP006', firstName: 'Lisa', lastName: 'Park',
    phone: '+91 98200 00006', avatarUrl: '',
    joinDate: '2025-04-01', status: 'active', createdAt: '2025-04-01',
  },
  {
    id: 'e7', userId: 'u7', organizationId: MOCK_ORG_ID,
    departmentId: 'd1', teamId: 't1', designationId: 'dg6', workLocationId: 'wl1', managerId: 'e5',
    employeeCode: 'EMP007', firstName: 'Alice', lastName: 'Wong',
    phone: '+91 98200 00007', avatarUrl: '',
    joinDate: '2025-05-10', status: 'active', createdAt: '2025-05-10',
  },
  {
    id: 'e8', userId: 'u8', organizationId: MOCK_ORG_ID,
    departmentId: 'd1', teamId: 't2', designationId: 'dg12', workLocationId: 'wl2', managerId: 'e10',
    employeeCode: 'EMP008', firstName: 'Bob', lastName: 'Martinez',
    phone: '+91 98200 00008', avatarUrl: '',
    joinDate: '2025-06-01', status: 'active', createdAt: '2025-06-01',
  },
  {
    id: 'e9', userId: 'u9', organizationId: MOCK_ORG_ID,
    departmentId: 'd4', teamId: 't5', designationId: 'dg11', workLocationId: 'wl3', managerId: 'e1',
    employeeCode: 'EMP009', firstName: 'Neha', lastName: 'Kulkarni',
    phone: '+91 98200 00009', avatarUrl: '',
    joinDate: '2025-07-15', status: 'active', createdAt: '2025-07-15',
  },
  {
    id: 'e10', userId: 'u10', organizationId: MOCK_ORG_ID,
    departmentId: 'd1', teamId: 't2', designationId: 'dg6', workLocationId: 'wl1', managerId: 'e5',
    employeeCode: 'EMP010', firstName: 'Arjun', lastName: 'Nair',
    phone: '+91 98200 00010', avatarUrl: '',
    joinDate: '2025-02-20', status: 'on_leave', createdAt: '2025-02-20',
  },
]

// ============================================================
// EMPLOYEE 360° DATA
// ============================================================

// --- Employment Details ---
export const MOCK_EMPLOYMENT_DETAILS: EmploymentDetails[] = [
  { id: 'ed1',  employeeId: 'e1',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 90,  workSchedule: 'standard', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'ed2',  employeeId: 'e2',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 60,  workSchedule: 'standard', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'ed3',  employeeId: 'e3',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 30,  workSchedule: 'standard', createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'ed4',  employeeId: 'e4',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 60,  workSchedule: 'standard', createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: 'ed5',  employeeId: 'e5',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 90,  workSchedule: 'standard', createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'ed6',  employeeId: 'e6',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 30,  workSchedule: 'standard', createdAt: '2025-04-01', updatedAt: '2025-04-01' },
  { id: 'ed7',  employeeId: 'e7',  employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 30,  workSchedule: 'standard', createdAt: '2025-05-10', updatedAt: '2025-05-10' },
  { id: 'ed8',  employeeId: 'e8',  employmentType: 'full_time', probationEndDate: '2026-12-01', noticePeriodDays: 30,  workSchedule: 'standard', createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  { id: 'ed9',  employeeId: 'e9',  employmentType: 'contract',  probationEndDate: null,         noticePeriodDays: 15,  workSchedule: 'flexible', createdAt: '2025-07-15', updatedAt: '2025-07-15' },
  { id: 'ed10', employeeId: 'e10', employmentType: 'full_time', probationEndDate: null,         noticePeriodDays: 30,  workSchedule: 'standard', createdAt: '2025-02-20', updatedAt: '2025-02-20' },
]

// --- Emergency Contacts ---
export const MOCK_EMERGENCY_CONTACTS: EmergencyContact[] = [
  { id: 'ec1',  employeeId: 'e3',  name: 'Mary Doe',         relationship: 'Mother',  phone: '+91 91234 10001', email: 'mary.doe@email.com',     isPrimary: true,  createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'ec2',  employeeId: 'e3',  name: 'James Doe',        relationship: 'Father',  phone: '+91 91234 10002', email: null,                      isPrimary: false, createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'ec3',  employeeId: 'e4',  name: 'David Chen',       relationship: 'Spouse',  phone: '+91 91234 10003', email: 'david.chen@email.com',    isPrimary: true,  createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: 'ec4',  employeeId: 'e5',  name: 'Linda Johnson',    relationship: 'Spouse',  phone: '+91 91234 10004', email: 'linda.j@email.com',       isPrimary: true,  createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'ec5',  employeeId: 'e7',  name: 'Wei Wong',         relationship: 'Sibling', phone: '+91 91234 10005', email: 'wei.wong@email.com',      isPrimary: true,  createdAt: '2025-05-10', updatedAt: '2025-05-10' },
  { id: 'ec6',  employeeId: 'e8',  name: 'Rosa Martinez',    relationship: 'Mother',  phone: '+91 91234 10006', email: 'rosa.m@email.com',        isPrimary: true,  createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  { id: 'ec7',  employeeId: 'e9',  name: 'Vikram Kulkarni',  relationship: 'Spouse',  phone: '+91 91234 10007', email: 'vikram.k@email.com',      isPrimary: true,  createdAt: '2025-07-15', updatedAt: '2025-07-15' },
  { id: 'ec8',  employeeId: 'e10', name: 'Sunita Nair',      relationship: 'Mother',  phone: '+91 91234 10008', email: null,                      isPrimary: true,  createdAt: '2025-02-20', updatedAt: '2025-02-20' },
  { id: 'ec9',  employeeId: 'e2',  name: 'Rahul Sharma',     relationship: 'Spouse',  phone: '+91 91234 10009', email: 'rahul.s@email.com',       isPrimary: true,  createdAt: '2025-01-01', updatedAt: '2025-01-01' },
]

// --- Employee Skills ---
export const MOCK_SKILLS: EmployeeSkill[] = [
  // e3 — John Doe (Product Designer)
  { id: 'sk1',  employeeId: 'e3', skillName: 'Figma',              proficiency: 'expert',       isVerified: true,  createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'sk2',  employeeId: 'e3', skillName: 'User Research',      proficiency: 'expert',       isVerified: true,  createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'sk3',  employeeId: 'e3', skillName: 'Prototyping',        proficiency: 'intermediate', isVerified: false, createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'sk4',  employeeId: 'e3', skillName: 'HTML / CSS',         proficiency: 'intermediate', isVerified: false, createdAt: '2025-03-15', updatedAt: '2025-03-15' },
  { id: 'sk5',  employeeId: 'e3', skillName: 'Motion Design',      proficiency: 'beginner',     isVerified: false, createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  // e4 — Sarah Chen (Design Lead)
  { id: 'sk6',  employeeId: 'e4', skillName: 'Figma',              proficiency: 'expert',       isVerified: true,  createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: 'sk7',  employeeId: 'e4', skillName: 'Design Systems',     proficiency: 'expert',       isVerified: true,  createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: 'sk8',  employeeId: 'e4', skillName: 'Brand Strategy',     proficiency: 'expert',       isVerified: true,  createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  { id: 'sk9',  employeeId: 'e4', skillName: 'Leadership',         proficiency: 'intermediate', isVerified: false, createdAt: '2025-02-01', updatedAt: '2025-02-01' },
  // e5 — Mike Johnson (Eng Manager)
  { id: 'sk10', employeeId: 'e5', skillName: 'System Architecture',proficiency: 'expert',       isVerified: true,  createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'sk11', employeeId: 'e5', skillName: 'Node.js',            proficiency: 'expert',       isVerified: true,  createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'sk12', employeeId: 'e5', skillName: 'PostgreSQL',         proficiency: 'expert',       isVerified: true,  createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  { id: 'sk13', employeeId: 'e5', skillName: 'Team Management',    proficiency: 'expert',       isVerified: false, createdAt: '2025-01-10', updatedAt: '2025-01-10' },
  // e7 — Alice Wong (Frontend Engineer)
  { id: 'sk14', employeeId: 'e7', skillName: 'React',              proficiency: 'expert',       isVerified: true,  createdAt: '2025-05-10', updatedAt: '2025-05-10' },
  { id: 'sk15', employeeId: 'e7', skillName: 'TypeScript',         proficiency: 'expert',       isVerified: true,  createdAt: '2025-05-10', updatedAt: '2025-05-10' },
  { id: 'sk16', employeeId: 'e7', skillName: 'Next.js',            proficiency: 'intermediate', isVerified: true,  createdAt: '2025-05-10', updatedAt: '2025-05-10' },
  { id: 'sk17', employeeId: 'e7', skillName: 'Testing (Vitest)',   proficiency: 'intermediate', isVerified: false, createdAt: '2025-05-10', updatedAt: '2025-05-10' },
  { id: 'sk18', employeeId: 'e7', skillName: 'GraphQL',            proficiency: 'beginner',     isVerified: false, createdAt: '2025-09-01', updatedAt: '2025-09-01' },
  // e8 — Bob Martinez (Backend Engineer)
  { id: 'sk19', employeeId: 'e8', skillName: 'Python',             proficiency: 'expert',       isVerified: true,  createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  { id: 'sk20', employeeId: 'e8', skillName: 'FastAPI',            proficiency: 'expert',       isVerified: true,  createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  { id: 'sk21', employeeId: 'e8', skillName: 'Docker',             proficiency: 'intermediate', isVerified: false, createdAt: '2025-06-01', updatedAt: '2025-06-01' },
  { id: 'sk22', employeeId: 'e8', skillName: 'Kubernetes',         proficiency: 'beginner',     isVerified: false, createdAt: '2025-10-01', updatedAt: '2025-10-01' },
  // e10 — Arjun Nair (Senior Engineer)
  { id: 'sk23', employeeId: 'e10',skillName: 'Go',                 proficiency: 'expert',       isVerified: true,  createdAt: '2025-02-20', updatedAt: '2025-02-20' },
  { id: 'sk24', employeeId: 'e10',skillName: 'Microservices',      proficiency: 'expert',       isVerified: true,  createdAt: '2025-02-20', updatedAt: '2025-02-20' },
  { id: 'sk25', employeeId: 'e10',skillName: 'Redis',              proficiency: 'intermediate', isVerified: false, createdAt: '2025-02-20', updatedAt: '2025-02-20' },
]

// ============================================================
// TASKS
// ============================================================

export const MOCK_TASKS: Task[] = [
  { id: 't1',  title: 'Design System Update',        description: 'Revamp the existing design tokens and component library to match the new brand guidelines. Include updated color palettes, typography scales, and spacing system.', status: 'in_progress', priority: 'high',     createdBy: 'e4', assignedTo: 'e3',  dueDate: '2026-06-20', completedAt: null,         tags: ['design', 'ui'],               createdAt: '2026-06-10', updatedAt: '2026-06-17' },
  { id: 't2',  title: 'User Research Synthesis',      description: 'Compile findings from the latest round of user interviews. Create a summary deck with key insights, pain points, and opportunity areas.',                          status: 'in_progress', priority: 'medium',   createdBy: 'e4', assignedTo: 'e3',  dueDate: '2026-06-22', completedAt: null,         tags: ['research'],                   createdAt: '2026-06-12', updatedAt: '2026-06-16' },
  { id: 't3',  title: 'Weekly Sync Prep',             description: 'Prepare the agenda and materials for the weekly design sync meeting with the engineering team.',                                                                   status: 'pending',     priority: 'low',      createdBy: 'e3', assignedTo: 'e3',  dueDate: '2026-06-18', completedAt: null,         tags: ['meeting'],                    createdAt: '2026-06-15', updatedAt: '2026-06-15' },
  { id: 't4',  title: 'API Integration Testing',      description: 'Write comprehensive integration tests for the new REST API endpoints. Cover all CRUD operations and edge cases.',                                                  status: 'in_progress', priority: 'critical', createdBy: 'e5', assignedTo: 'e7',  dueDate: '2026-06-19', completedAt: null,         tags: ['engineering', 'testing'],     createdAt: '2026-06-08', updatedAt: '2026-06-17' },
  { id: 't5',  title: 'Onboarding Flow Redesign',     description: 'Redesign the employee onboarding experience with a step-by-step wizard approach.',                                                                               status: 'pending',     priority: 'high',     createdBy: 'e2', assignedTo: 'e3',  dueDate: '2026-06-25', completedAt: null,         tags: ['design', 'hr'],               createdAt: '2026-06-14', updatedAt: '2026-06-14' },
  { id: 't6',  title: 'Database Migration Script',    description: 'Write migration scripts to move from the legacy schema to the new normalized design.',                                                                           status: 'blocked',     priority: 'critical', createdBy: 'e5', assignedTo: 'e8',  dueDate: '2026-06-18', completedAt: null,         tags: ['engineering', 'database'],    createdAt: '2026-06-05', updatedAt: '2026-06-16' },
  { id: 't7',  title: 'Q2 Performance Reviews',       description: 'Complete performance review forms for all direct reports in the design team.',                                                                                   status: 'completed',   priority: 'medium',   createdBy: 'e2', assignedTo: 'e4',  dueDate: '2026-06-15', completedAt: '2026-06-14T17:00:00Z', tags: ['hr'],                         createdAt: '2026-06-01', updatedAt: '2026-06-14' },
  { id: 't8',  title: 'Security Audit Report',        description: 'Review and document all security findings from the latest penetration test.',                                                                                    status: 'completed',   priority: 'high',     createdBy: 'e5', assignedTo: 'e7',  dueDate: '2026-06-12', completedAt: '2026-06-11T15:30:00Z', tags: ['security'],                   createdAt: '2026-06-01', updatedAt: '2026-06-11' },
  { id: 't9',  title: 'Marketing Landing Page',       description: 'Create a responsive landing page for the upcoming product launch campaign.',                                                                                     status: 'pending',     priority: 'medium',   createdBy: 'e5', assignedTo: 'e3',  dueDate: '2026-06-28', completedAt: null,         tags: ['design', 'marketing'],        createdAt: '2026-06-16', updatedAt: '2026-06-16' },
  { id: 't10', title: 'CI/CD Pipeline Setup',         description: 'Set up automated testing and deployment pipelines using GitHub Actions.',                                                                                       status: 'in_progress', priority: 'high',     createdBy: 'e5', assignedTo: 'e8',  dueDate: '2026-06-21', completedAt: null,         tags: ['engineering', 'devops'],      createdAt: '2026-06-10', updatedAt: '2026-06-17' },
  { id: 't11', title: 'Backend API Documentation',    description: 'Write comprehensive API documentation for all public endpoints using OpenAPI spec.',                                                                             status: 'pending',     priority: 'medium',   createdBy: 'e5', assignedTo: 'e10', dueDate: '2026-06-24', completedAt: null,         tags: ['engineering', 'documentation'],createdAt: '2026-06-14', updatedAt: '2026-06-14' },
  { id: 't12', title: 'Social Media Content Calendar',description: 'Plan and create the Q3 social media content calendar including posts, visuals, and campaigns.',                                                                  status: 'in_progress', priority: 'medium',   createdBy: 'e9', assignedTo: 'e9',  dueDate: '2026-06-23', completedAt: null,         tags: ['marketing'],                  createdAt: '2026-06-12', updatedAt: '2026-06-17' },
]

// ============================================================
// LEAVES
// ============================================================

export const MOCK_LEAVES: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e3',  leaveType: 'casual',    startDate: '2026-06-23', endDate: '2026-06-24', reason: 'Family function',                    status: 'pending',          managerId: 'e4', hrId: null, createdAt: '2026-06-15', updatedAt: '2026-06-15' },
  { id: 'l2', employeeId: 'e7',  leaveType: 'medical',   startDate: '2026-06-20', endDate: '2026-06-20', reason: 'Doctor appointment',                 status: 'manager_approved', managerId: 'e5', hrId: 'e2', createdAt: '2026-06-14', updatedAt: '2026-06-16' },
  { id: 'l3', employeeId: 'e8',  leaveType: 'wfh',       startDate: '2026-06-18', endDate: '2026-06-18', reason: 'Internet installation at home',      status: 'hr_approved',      managerId: 'e5', hrId: 'e2', createdAt: '2026-06-13', updatedAt: '2026-06-14' },
  { id: 'l4', employeeId: 'e3',  leaveType: 'casual',    startDate: '2026-06-05', endDate: '2026-06-06', reason: 'Personal errands',                   status: 'hr_approved',      managerId: 'e4', hrId: 'e2', createdAt: '2026-06-01', updatedAt: '2026-06-03' },
  { id: 'l5', employeeId: 'e4',  leaveType: 'emergency', startDate: '2026-06-10', endDate: '2026-06-10', reason: 'Family emergency',                   status: 'hr_approved',      managerId: 'e5', hrId: 'e2', createdAt: '2026-06-10', updatedAt: '2026-06-10' },
  { id: 'l6', employeeId: 'e10', leaveType: 'medical',   startDate: '2026-06-17', endDate: '2026-06-21', reason: 'Medical procedure and recovery',     status: 'hr_approved',      managerId: 'e5', hrId: 'e2', createdAt: '2026-06-12', updatedAt: '2026-06-13' },
  { id: 'l7', employeeId: 'e9',  leaveType: 'casual',    startDate: '2026-06-26', endDate: '2026-06-27', reason: 'Travel plans',                       status: 'pending',          managerId: 'e1', hrId: null, createdAt: '2026-06-17', updatedAt: '2026-06-17' },
]

export const MOCK_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  e3:  { casual: 10, medical: 6,  emergency: 3, wfh: 999 },
  e4:  { casual: 11, medical: 6,  emergency: 2, wfh: 999 },
  e7:  { casual: 12, medical: 5,  emergency: 3, wfh: 999 },
  e8:  { casual: 12, medical: 6,  emergency: 3, wfh: 999 },
  e9:  { casual: 13, medical: 6,  emergency: 3, wfh: 999 },
  e10: { casual: 8,  medical: 3,  emergency: 3, wfh: 999 },
}

// ============================================================
// ANNOUNCEMENTS
// ============================================================

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Q3 Company All-Hands Meeting',   content: 'Join us for our quarterly all-hands on July 1st at 10:00 AM in the main auditorium. We will review Q2 results and share our Q3 roadmap.', category: 'event',  priority: 'important', targetAudience: 'all', isPinned: true,  authorId: 'e1', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-17T08:00:00Z' },
  { id: 'a2', title: 'Updated Work From Home Policy',  content: 'Starting July 1st, all employees are entitled to up to 3 WFH days per week, subject to manager approval.',                                  category: 'policy', priority: 'normal',    targetAudience: 'all', isPinned: true,  authorId: 'e2', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-16T10:00:00Z' },
  { id: 'a3', title: 'Independence Day Holiday',        content: 'The office will remain closed on August 15th for Independence Day. Please plan your work accordingly.',                                       category: 'holiday',priority: 'normal',    targetAudience: 'all', isPinned: false, authorId: 'e2', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-15T09:00:00Z' },
  { id: 'a4', title: 'New Cafeteria Menu Launched',     content: 'We are excited to announce a revamped cafeteria menu with healthier options, including vegan and gluten-free meals.',                         category: 'news',   priority: 'normal',    targetAudience: 'all', isPinned: false, authorId: 'e6', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-14T12:00:00Z' },
  { id: 'a5', title: 'Annual Team Outing — Save Date', content: 'The annual team outing is planned for July 19-20 at Riverside Resort. More details and RSVP link coming soon.',                              category: 'event',  priority: 'normal',    targetAudience: 'all', isPinned: false, authorId: 'e2', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-13T11:00:00Z' },
]

// ============================================================
// ROOMS & BOOKINGS
// ============================================================

export const MOCK_ROOMS: MeetingRoom[] = [
  { id: 'r1', name: 'Apollo',  capacity: 10, floor: '3rd Floor', amenities: ['Projector', 'Whiteboard', 'Video Conf'],                    isActive: true },
  { id: 'r2', name: 'Gemini',  capacity: 6,  floor: '3rd Floor', amenities: ['TV Screen', 'Whiteboard'],                                  isActive: true },
  { id: 'r3', name: 'Orion',   capacity: 20, floor: '5th Floor', amenities: ['Projector', 'Sound System', 'Video Conf', 'Recording'],     isActive: true },
  { id: 'r4', name: 'Nova',    capacity: 4,  floor: '2nd Floor', amenities: ['TV Screen'],                                               isActive: true },
  { id: 'r5', name: 'Zenith',  capacity: 8,  floor: '4th Floor', amenities: ['Projector', 'Whiteboard', 'Video Conf'],                    isActive: false },
]

export const MOCK_BOOKINGS: RoomBooking[] = [
  { id: 'b1', roomId: 'r1', bookedBy: 'e3', title: 'Design Review',   startTime: '2026-06-17T10:00:00Z', endTime: '2026-06-17T11:00:00Z',   attendees: ['e3', 'e4'],       status: 'confirmed', createdAt: '2026-06-16' },
  { id: 'b2', roomId: 'r3', bookedBy: 'e5', title: 'Sprint Planning',  startTime: '2026-06-17T14:00:00Z', endTime: '2026-06-17T15:30:00Z', attendees: ['e5', 'e7', 'e8'], status: 'confirmed', createdAt: '2026-06-15' },
  { id: 'b3', roomId: 'r2', bookedBy: 'e2', title: 'HR Sync',          startTime: '2026-06-18T09:00:00Z', endTime: '2026-06-18T09:30:00Z', attendees: ['e2', 'e1'],       status: 'confirmed', createdAt: '2026-06-16' },
]

// ============================================================
// ASSETS
// ============================================================

export const MOCK_ASSETS: Asset[] = [
  { id: 'as1', name: 'MacBook Pro 16"',     category: 'laptop',    serialNumber: 'MBP-2025-001', purchaseDate: '2025-01-15', warrantyExpiry: '2027-01-15', condition: 'good', status: 'assigned'    },
  { id: 'as2', name: 'MacBook Pro 14"',     category: 'laptop',    serialNumber: 'MBP-2025-002', purchaseDate: '2025-03-10', warrantyExpiry: '2027-03-10', condition: 'good', status: 'assigned'    },
  { id: 'as3', name: 'Dell UltraSharp 27"', category: 'monitor',   serialNumber: 'DU27-001',     purchaseDate: '2025-02-01', warrantyExpiry: '2028-02-01', condition: 'good', status: 'assigned'    },
  { id: 'as4', name: 'iPhone 16 Pro',       category: 'phone',     serialNumber: 'IP16-001',     purchaseDate: '2025-09-20', warrantyExpiry: '2026-09-20', condition: 'new',  status: 'assigned'    },
  { id: 'as5', name: 'Sony WH-1000XM6',    category: 'accessory', serialNumber: 'SWH-001',      purchaseDate: '2025-06-01', warrantyExpiry: '2026-06-01', condition: 'good', status: 'assigned'    },
  { id: 'as6', name: 'Dell Optiplex 7090',  category: 'desktop',   serialNumber: 'DO-001',       purchaseDate: '2025-01-01', warrantyExpiry: '2028-01-01', condition: 'good', status: 'available'   },
  { id: 'as7', name: 'LG 34" Ultrawide',   category: 'monitor',   serialNumber: 'LG34-001',     purchaseDate: '2025-04-15', warrantyExpiry: '2028-04-15', condition: 'new',  status: 'available'   },
  { id: 'as8', name: 'MacBook Air M3',      category: 'laptop',    serialNumber: 'MBA-2025-001', purchaseDate: '2025-07-01', warrantyExpiry: '2027-07-01', condition: 'new',  status: 'assigned'    },
  { id: 'as9', name: 'Logitech MX Keys',   category: 'accessory', serialNumber: 'LMX-001',      purchaseDate: '2025-05-10', warrantyExpiry: '2027-05-10', condition: 'good', status: 'assigned'    },
]

export const MOCK_ASSET_ASSIGNMENTS: AssetAssignment[] = [
  { id: 'aa1', assetId: 'as1', employeeId: 'e3',  assignedDate: '2025-03-15', returnedDate: null, notes: 'Primary work machine' },
  { id: 'aa2', assetId: 'as2', employeeId: 'e7',  assignedDate: '2025-05-10', returnedDate: null, notes: '' },
  { id: 'aa3', assetId: 'as3', employeeId: 'e3',  assignedDate: '2025-03-15', returnedDate: null, notes: 'External display' },
  { id: 'aa4', assetId: 'as4', employeeId: 'e5',  assignedDate: '2025-09-25', returnedDate: null, notes: 'Company phone' },
  { id: 'aa5', assetId: 'as5', employeeId: 'e8',  assignedDate: '2025-06-05', returnedDate: null, notes: '' },
  { id: 'aa6', assetId: 'as8', employeeId: 'e9',  assignedDate: '2025-07-15', returnedDate: null, notes: 'Remote work setup' },
  { id: 'aa7', assetId: 'as9', employeeId: 'e10', assignedDate: '2025-02-20', returnedDate: null, notes: '' },
]

// ============================================================
// VISITORS
// ============================================================

export const MOCK_VISITORS: VisitorLog[] = [
  { id: 'v1', visitorName: 'Raj Patel',    company: 'Acme Corp',  phone: '+91 98765 43210', purpose: 'Client meeting with Engineering', hostId: 'e5', checkIn: '2026-06-17T09:30:00Z', checkOut: null,                    badgeNumber: 'V-001', status: 'checked_in'  },
  { id: 'v2', visitorName: 'Emma Wilson',  company: 'DesignHub',  phone: '+1 415 555 1234', purpose: 'Portfolio review',                hostId: 'e4', checkIn: '2026-06-17T10:00:00Z', checkOut: null,                    badgeNumber: 'V-002', status: 'checked_in'  },
  { id: 'v3', visitorName: 'Tom Harris',   company: 'Freelance',  phone: '+44 7700 123456', purpose: 'Job interview — Senior Engineer', hostId: 'e2', checkIn: '2026-06-16T14:00:00Z', checkOut: '2026-06-16T15:30:00Z', badgeNumber: 'V-003', status: 'checked_out' },
  { id: 'v4', visitorName: 'Aisha Khan',   company: 'TechVenture',phone: '+91 91234 56789', purpose: 'Investor meeting',                hostId: 'e1', checkIn: '2026-06-16T11:00:00Z', checkOut: '2026-06-16T12:00:00Z', badgeNumber: 'V-004', status: 'checked_out' },
]

// ============================================================
// PRODUCTIVITY & AI
// ============================================================

export const MOCK_PRODUCTIVITY: ProductivityScore[] = [
  { id: 'ps1', employeeId: 'e3',  date: '2026-06-17', score: 85, factors: { attendance: 95, taskCompletion: 80, focus: 82 } },
  { id: 'ps2', employeeId: 'e7',  date: '2026-06-17', score: 92, factors: { attendance: 100, taskCompletion: 90, focus: 88 } },
  { id: 'ps3', employeeId: 'e8',  date: '2026-06-17', score: 78, factors: { attendance: 85, taskCompletion: 75, focus: 72 } },
  { id: 'ps4', employeeId: 'e4',  date: '2026-06-17', score: 90, factors: { attendance: 98, taskCompletion: 88, focus: 85 } },
  { id: 'ps5', employeeId: 'e5',  date: '2026-06-17', score: 88, factors: { attendance: 100, taskCompletion: 85, focus: 80 } },
  { id: 'ps6', employeeId: 'e9',  date: '2026-06-17', score: 82, factors: { attendance: 90, taskCompletion: 80, focus: 76 } },
  { id: 'ps7', employeeId: 'e10', date: '2026-06-17', score: 0,  factors: { attendance: 0, taskCompletion: 0, focus: 0 } }, // on leave
]

export const MOCK_AI_INSIGHTS: AIInsight[] = [
  { id: 'ai1', employeeId: 'e3',  insightType: 'productivity_tip',  title: 'Morning Focus Zone',         content: 'You complete tasks 15% faster during morning sessions (9–11 AM). Consider scheduling deep work before 11:00 AM.',                                    severity: 'info',    isRead: false, createdAt: '2026-06-17T08:00:00Z' },
  { id: 'ai2', employeeId: 'e3',  insightType: 'pattern',            title: 'Break Optimization',         content: 'Your average break duration is 12 minutes shorter than peers. Regular 15-minute breaks can improve afternoon productivity by up to 20%.',          severity: 'info',    isRead: false, createdAt: '2026-06-16T08:00:00Z' },
  { id: 'ai3', employeeId: 'e8',  insightType: 'burnout_warning',    title: 'Burnout Risk Detected',      content: 'Bob Martinez has worked 9h+ for 5 consecutive days. Sustained overwork reduces long-term output significantly.',                                    severity: 'warning', isRead: false, createdAt: '2026-06-17T07:00:00Z' },
  { id: 'ai4', employeeId: 'e7',  insightType: 'improvement',        title: 'Task Completion Streak',     content: 'Alice Wong has completed 12 tasks this week — 40% above her average. Recognize this achievement.',                                                  severity: 'info',    isRead: true,  createdAt: '2026-06-16T17:00:00Z' },
  { id: 'ai5', employeeId: 'e10', insightType: 'pattern',            title: 'Extended Leave Coverage',    content: 'Arjun Nair is on medical leave until Jun 21. Consider redistributing 2 pending backend tasks to avoid sprint delay.',                              severity: 'warning', isRead: false, createdAt: '2026-06-17T09:00:00Z' },
  { id: 'ai6', employeeId: 'e5',  insightType: 'productivity_tip',   title: 'Team Velocity Declining',    content: 'Engineering team task completion rate dropped 18% this week. 2 tasks are blocked on database migration. Unblocking this is the highest priority.', severity: 'critical',isRead: false, createdAt: '2026-06-17T10:00:00Z' },
]

// ============================================================
// NOTIFICATIONS
// ============================================================

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u3', title: 'New Task Assigned',     message: 'Sarah assigned you "Onboarding Flow Redesign"',         type: 'task_assigned',      isRead: false, actionUrl: '/employee/tasks',         createdAt: '2026-06-17T09:00:00Z' },
  { id: 'n2', userId: 'u3', title: 'Leave Request Update',  message: 'Your casual leave for Jun 23–24 is pending approval',   type: 'leave_approved',     isRead: false, actionUrl: '/employee/leaves',        createdAt: '2026-06-16T14:00:00Z' },
  { id: 'n3', userId: 'u3', title: 'Meeting Reminder',      message: 'Design Review in Apollo Room at 10:00 AM',              type: 'meeting_reminder',   isRead: true,  actionUrl: '/employee/rooms',         createdAt: '2026-06-17T09:45:00Z' },
  { id: 'n4', userId: 'u3', title: 'Company Announcement',  message: 'Q3 All-Hands Meeting — July 1st',                       type: 'announcement',       isRead: true,  actionUrl: '/employee/announcements', createdAt: '2026-06-17T08:00:00Z' },
  { id: 'n5', userId: 'u7', title: 'Leave Approved',         message: 'Your medical leave for Jun 20 has been approved by HR', type: 'leave_approved',     isRead: false, actionUrl: '/employee/leaves',        createdAt: '2026-06-16T16:00:00Z' },
]

// ============================================================
// PAYROLL
// ============================================================

export const MOCK_SALARIES: SalaryStructure[] = [
  { id: 's1', employeeId: 'e3',  baseSalary: 60000, hra: 24000, da: 6000, specialAllowance: 10000, bonus: 5000, pf: 7200,  tax: 8500,  esi: 1050, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's2', employeeId: 'e7',  baseSalary: 55000, hra: 22000, da: 5500, specialAllowance: 8000,  bonus: 3000, pf: 6600,  tax: 7000,  esi: 900,  professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's3', employeeId: 'e8',  baseSalary: 58000, hra: 23200, da: 5800, specialAllowance: 9000,  bonus: 4000, pf: 6960,  tax: 7800,  esi: 950,  professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's4', employeeId: 'e4',  baseSalary: 80000, hra: 32000, da: 8000, specialAllowance: 15000, bonus: 8000, pf: 9600,  tax: 14000, esi: 1500, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's5', employeeId: 'e5',  baseSalary: 95000, hra: 38000, da: 9500, specialAllowance: 18000, bonus:10000, pf: 11400, tax: 18500, esi: 1800, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's6', employeeId: 'e10', baseSalary: 85000, hra: 34000, da: 8500, specialAllowance: 16000, bonus: 9000, pf: 10200, tax: 16000, esi: 1600, professionalTax: 200, effectiveFrom: '2025-04-01' },
]

export const MOCK_PAYSLIPS: Payslip[] = [
  { id: 'pay1', employeeId: 'e3', month: '2026-05', grossSalary: 105000, totalDeductions: 16950, netSalary: 88050, status: 'paid',      generatedAt: '2026-06-01' },
  { id: 'pay2', employeeId: 'e3', month: '2026-06', grossSalary: 105000, totalDeductions: 16950, netSalary: 88050, status: 'generated', generatedAt: '2026-06-15' },
]

// ============================================================
// ATTENDANCE
// ============================================================

export const MOCK_ATTENDANCE: AttendanceLog[] = [
  { id: 'at1', employeeId: 'e3', date: '2026-06-17', clockIn: '2026-06-17T09:02:00Z', clockOut: null,                    totalWorkSeconds: 15600, totalBreakSeconds: 2700, status: 'present'  },
  { id: 'at2', employeeId: 'e3', date: '2026-06-16', clockIn: '2026-06-16T08:55:00Z', clockOut: '2026-06-16T17:10:00Z', totalWorkSeconds: 27000, totalBreakSeconds: 2700, status: 'present'  },
  { id: 'at3', employeeId: 'e3', date: '2026-06-15', clockIn: '2026-06-15T09:10:00Z', clockOut: '2026-06-15T13:00:00Z', totalWorkSeconds: 12600, totalBreakSeconds: 1200, status: 'half_day' },
  { id: 'at4', employeeId: 'e3', date: '2026-06-14', clockIn: null,                    clockOut: null,                    totalWorkSeconds: 0,     totalBreakSeconds: 0,    status: 'absent'   },
  { id: 'at5', employeeId: 'e3', date: '2026-06-13', clockIn: '2026-06-13T08:45:00Z', clockOut: '2026-06-13T17:30:00Z', totalWorkSeconds: 28800, totalBreakSeconds: 3600, status: 'present'  },
  { id: 'at6', employeeId: 'e3', date: '2026-06-12', clockIn: '2026-06-12T09:00:00Z', clockOut: '2026-06-12T17:00:00Z', totalWorkSeconds: 28800, totalBreakSeconds: 2400, status: 'present'  },
  { id: 'at7', employeeId: 'e3', date: '2026-06-11', clockIn: '2026-06-11T09:05:00Z', clockOut: '2026-06-11T17:15:00Z', totalWorkSeconds: 28800, totalBreakSeconds: 3000, status: 'present'  },
]

// ============================================================
// REWARDS & ACHIEVEMENTS
// ============================================================

export const MOCK_REWARDS: Reward[] = [
  { id: 'rw1', employeeId: 'e3', amount: 500,  reason: 'Completed Q2 project ahead of schedule', type: 'earned', createdAt: '2026-06-10T10:00:00Z' },
  { id: 'rw2', employeeId: 'e3', amount: 150,  reason: 'Helpful code review for team member',    type: 'earned', createdAt: '2026-06-12T14:30:00Z' },
  { id: 'rw3', employeeId: 'e3', amount: -300, reason: 'Redeemed Team Lunch Voucher',             type: 'spent',  createdAt: '2026-06-15T12:00:00Z' },
  { id: 'rw4', employeeId: 'e4', amount: 1000, reason: 'Employee of the Month (May)',             type: 'earned', createdAt: '2026-06-01T09:00:00Z' },
  { id: 'rw5', employeeId: 'e7', amount: 300,  reason: 'Fixed critical production bug',           type: 'earned', createdAt: '2026-06-14T11:00:00Z' },
]

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ac1', employeeId: 'e3', achievementId: 'first_task',   title: 'First Blood',    description: 'Complete your first task',                            tier: 'bronze',   xp: 50,   currentProgress: 1,  targetProgress: 1,  unlockedAt: '2025-03-20T10:00:00Z' },
  { id: 'ac2', employeeId: 'e3', achievementId: 'streak_7',     title: 'On Fire',        description: 'Log in for 7 consecutive days',                       tier: 'silver',   xp: 150,  currentProgress: 7,  targetProgress: 7,  unlockedAt: '2026-06-17T09:00:00Z' },
  { id: 'ac3', employeeId: 'e3', achievementId: 'perfectionist',title: 'Perfectionist',  description: 'Complete 10 tasks without any bugs reported',         tier: 'gold',     xp: 500,  currentProgress: 8,  targetProgress: 10, unlockedAt: null },
  { id: 'ac4', employeeId: 'e3', achievementId: 'team_player',  title: 'Team Player',    description: 'Leave 50 helpful comments on team tasks',             tier: 'silver',   xp: 200,  currentProgress: 34, targetProgress: 50, unlockedAt: null },
  { id: 'ac5', employeeId: 'e3', achievementId: 'mentor',       title: 'Mentor',         description: 'Onboard a new team member',                           tier: 'platinum', xp: 1000, currentProgress: 0,  targetProgress: 1,  unlockedAt: null },
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getEmployeeById(id: string): Employee | undefined {
  return MOCK_EMPLOYEES.find(e => e.id === id)
}

export function getEmployeeByUserId(userId: string): Employee | undefined {
  return MOCK_EMPLOYEES.find(e => e.userId === userId)
}

export function getUserByEmail(email: string): User | undefined {
  return MOCK_USERS.find(u => u.email === email)
}

export function getDepartmentById(id: string | null | undefined): Department | undefined {
  if (!id) return undefined
  return MOCK_DEPARTMENTS.find(d => d.id === id)
}

export function getTeamById(id: string | null | undefined): Team | undefined {
  if (!id) return undefined
  return MOCK_TEAMS.find(t => t.id === id)
}

export function getDesignationById(id: string | null | undefined): Designation | undefined {
  if (!id) return undefined
  return MOCK_DESIGNATIONS.find(d => d.id === id)
}

export function getWorkLocationById(id: string | null | undefined): WorkLocation | undefined {
  if (!id) return undefined
  return MOCK_WORK_LOCATIONS.find(w => w.id === id)
}

export function getManagerById(id: string | null | undefined): Employee | undefined {
  if (!id) return undefined
  return MOCK_EMPLOYEES.find(e => e.id === id)
}

export function getEmployeeSkills(employeeId: string): EmployeeSkill[] {
  return MOCK_SKILLS.filter(s => s.employeeId === employeeId)
}

export function getEmployeeEmergencyContacts(employeeId: string): EmergencyContact[] {
  return MOCK_EMERGENCY_CONTACTS.filter(c => c.employeeId === employeeId)
}

export function getEmploymentDetails(employeeId: string): EmploymentDetails | undefined {
  return MOCK_EMPLOYMENT_DETAILS.find(d => d.employeeId === employeeId)
}

export function getEmployeeAssets(employeeId: string): { assignment: AssetAssignment; asset: Asset }[] {
  return MOCK_ASSET_ASSIGNMENTS
    .filter(a => a.employeeId === employeeId && !a.returnedDate)
    .map(assignment => {
      const asset = MOCK_ASSETS.find(a => a.id === assignment.assetId)!
      return { assignment, asset }
    })
    .filter(a => a.asset)
}

export function getEmployeeAttendanceSummary(employeeId: string): {
  present: number; absent: number; halfDay: number; wfh: number; total: number
} {
  const logs = MOCK_ATTENDANCE.filter(a => a.employeeId === employeeId)
  return {
    present:  logs.filter(l => l.status === 'present').length,
    absent:   logs.filter(l => l.status === 'absent').length,
    halfDay:  logs.filter(l => l.status === 'half_day').length,
    wfh:      logs.filter(l => l.status === 'wfh').length,
    total:    logs.length,
  }
}

export function getEmployeeLeaveBalance(employeeId: string): LeaveBalance {
  return MOCK_LEAVE_BALANCES[employeeId] ?? { casual: 12, medical: 6, emergency: 3, wfh: 999 }
}

export function getEmployeeActiveTasks(employeeId: string): Task[] {
  return MOCK_TASKS.filter(t => t.assignedTo === employeeId && t.status !== 'completed')
}

export function getEmployeeProductivityScore(employeeId: string): number {
  const score = MOCK_PRODUCTIVITY.find(p => p.employeeId === employeeId)
  return score?.score ?? 0
}

export function getFullName(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return `${employee.firstName} ${employee.lastName}`
}

export function getDepartmentEmployees(departmentId: string): Employee[] {
  return MOCK_EMPLOYEES.filter(e => e.departmentId === departmentId)
}

export function getTeamEmployees(teamId: string): Employee[] {
  return MOCK_EMPLOYEES.filter(e => e.teamId === teamId)
}

export function getOrgChartData() {
  return MOCK_DEPARTMENTS.map(dept => ({
    department: dept,
    head: dept.headId ? getEmployeeById(dept.headId) : null,
    teams: MOCK_TEAMS
      .filter(t => t.departmentId === dept.id)
      .map(team => ({
        team,
        lead: team.leadId ? getEmployeeById(team.leadId) : null,
        members: getTeamEmployees(team.id),
      })),
    directMembers: MOCK_EMPLOYEES.filter(e => e.departmentId === dept.id && !e.teamId),
  }))
}
