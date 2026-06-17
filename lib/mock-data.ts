// ============================================================
// SOMS Enterprise — Centralized Mock Data
// ============================================================

import type {
  User, Employee, Department, Task, LeaveRequest, LeaveBalance,
  Announcement, MeetingRoom, RoomBooking, Asset, AssetAssignment,
  Payslip, AttendanceLog, Reward, Achievement, VisitorLog, ProductivityScore, AIInsight, Notification, SalaryStructure
} from './types'

// --- Users ---
export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@soms.io', role: 'super_admin', isActive: true, lastLogin: '2026-06-17T08:00:00Z', createdAt: '2025-01-01' },
  { id: 'u2', email: 'hr@soms.io', role: 'hr_manager', isActive: true, lastLogin: '2026-06-17T08:30:00Z', createdAt: '2025-01-01' },
  { id: 'u3', email: 'john@soms.io', role: 'employee', isActive: true, lastLogin: '2026-06-17T09:00:00Z', createdAt: '2025-03-15' },
  { id: 'u4', email: 'sarah@soms.io', role: 'team_lead', isActive: true, lastLogin: '2026-06-17T08:45:00Z', createdAt: '2025-02-01' },
  { id: 'u5', email: 'mike@soms.io', role: 'dept_manager', isActive: true, lastLogin: '2026-06-16T17:00:00Z', createdAt: '2025-01-10' },
  { id: 'u6', email: 'reception@soms.io', role: 'receptionist', isActive: true, lastLogin: '2026-06-17T07:55:00Z', createdAt: '2025-04-01' },
  { id: 'u7', email: 'alice@soms.io', role: 'employee', isActive: true, lastLogin: '2026-06-17T09:15:00Z', createdAt: '2025-05-10' },
  { id: 'u8', email: 'bob@soms.io', role: 'employee', isActive: true, lastLogin: '2026-06-16T18:00:00Z', createdAt: '2025-06-01' },
]

// --- Departments ---
export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'd1', name: 'Engineering', headId: 'e5', createdAt: '2025-01-01' },
  { id: 'd2', name: 'Design', headId: 'e4', createdAt: '2025-01-01' },
  { id: 'd3', name: 'Human Resources', headId: 'e2', createdAt: '2025-01-01' },
  { id: 'd4', name: 'Marketing', headId: null, createdAt: '2025-01-01' },
  { id: 'd5', name: 'Operations', headId: null, createdAt: '2025-01-01' },
]

// --- Employees ---
export const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', userId: 'u1', departmentId: 'd1', employeeCode: 'EMP001', firstName: 'Admin', lastName: 'User', designation: 'System Administrator', phone: '+1234567890', avatarUrl: '', joinDate: '2025-01-01', status: 'active', createdAt: '2025-01-01' },
  { id: 'e2', userId: 'u2', departmentId: 'd3', employeeCode: 'EMP002', firstName: 'Priya', lastName: 'Sharma', designation: 'HR Manager', phone: '+1234567891', avatarUrl: '', joinDate: '2025-01-01', status: 'active', createdAt: '2025-01-01' },
  { id: 'e3', userId: 'u3', departmentId: 'd2', employeeCode: 'EMP003', firstName: 'John', lastName: 'Doe', designation: 'Product Designer', phone: '+1234567892', avatarUrl: '', joinDate: '2025-03-15', status: 'active', createdAt: '2025-03-15' },
  { id: 'e4', userId: 'u4', departmentId: 'd2', employeeCode: 'EMP004', firstName: 'Sarah', lastName: 'Chen', designation: 'Design Lead', phone: '+1234567893', avatarUrl: '', joinDate: '2025-02-01', status: 'active', createdAt: '2025-02-01' },
  { id: 'e5', userId: 'u5', departmentId: 'd1', employeeCode: 'EMP005', firstName: 'Mike', lastName: 'Johnson', designation: 'Engineering Manager', phone: '+1234567894', avatarUrl: '', joinDate: '2025-01-10', status: 'active', createdAt: '2025-01-10' },
  { id: 'e6', userId: 'u6', departmentId: 'd5', employeeCode: 'EMP006', firstName: 'Lisa', lastName: 'Park', designation: 'Front Desk Officer', phone: '+1234567895', avatarUrl: '', joinDate: '2025-04-01', status: 'active', createdAt: '2025-04-01' },
  { id: 'e7', userId: 'u7', departmentId: 'd1', employeeCode: 'EMP007', firstName: 'Alice', lastName: 'Wong', designation: 'Frontend Engineer', phone: '+1234567896', avatarUrl: '', joinDate: '2025-05-10', status: 'active', createdAt: '2025-05-10' },
  { id: 'e8', userId: 'u8', departmentId: 'd1', employeeCode: 'EMP008', firstName: 'Bob', lastName: 'Martinez', designation: 'Backend Engineer', phone: '+1234567897', avatarUrl: '', joinDate: '2025-06-01', status: 'active', createdAt: '2025-06-01' },
]

// --- Tasks ---
export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Design System Update', description: 'Revamp the existing design tokens and component library to match the new brand guidelines. Include updated color palettes, typography scales, and spacing system.', status: 'in_progress', priority: 'high', createdBy: 'e4', assignedTo: 'e3', dueDate: '2026-06-20', completedAt: null, tags: ['design', 'ui'], createdAt: '2026-06-10', updatedAt: '2026-06-17' },
  { id: 't2', title: 'User Research Synthesis', description: 'Compile findings from the latest round of user interviews. Create a summary deck with key insights, pain points, and opportunity areas.', status: 'in_progress', priority: 'medium', createdBy: 'e4', assignedTo: 'e3', dueDate: '2026-06-22', completedAt: null, tags: ['research'], createdAt: '2026-06-12', updatedAt: '2026-06-16' },
  { id: 't3', title: 'Weekly Sync Prep', description: 'Prepare the agenda and materials for the weekly design sync meeting with the engineering team.', status: 'pending', priority: 'low', createdBy: 'e3', assignedTo: 'e3', dueDate: '2026-06-18', completedAt: null, tags: ['meeting'], createdAt: '2026-06-15', updatedAt: '2026-06-15' },
  { id: 't4', title: 'API Integration Testing', description: 'Write comprehensive integration tests for the new REST API endpoints. Cover all CRUD operations and edge cases.', status: 'in_progress', priority: 'critical', createdBy: 'e5', assignedTo: 'e7', dueDate: '2026-06-19', completedAt: null, tags: ['engineering', 'testing'], createdAt: '2026-06-08', updatedAt: '2026-06-17' },
  { id: 't5', title: 'Onboarding Flow Redesign', description: 'Redesign the employee onboarding experience with a step-by-step wizard approach.', status: 'pending', priority: 'high', createdBy: 'e2', assignedTo: 'e3', dueDate: '2026-06-25', completedAt: null, tags: ['design', 'hr'], createdAt: '2026-06-14', updatedAt: '2026-06-14' },
  { id: 't6', title: 'Database Migration Script', description: 'Write migration scripts to move from the legacy schema to the new normalized design.', status: 'blocked', priority: 'critical', createdBy: 'e5', assignedTo: 'e8', dueDate: '2026-06-18', completedAt: null, tags: ['engineering', 'database'], createdAt: '2026-06-05', updatedAt: '2026-06-16' },
  { id: 't7', title: 'Q2 Performance Reviews', description: 'Complete performance review forms for all direct reports in the design team.', status: 'completed', priority: 'medium', createdBy: 'e2', assignedTo: 'e4', dueDate: '2026-06-15', completedAt: '2026-06-14', tags: ['hr'], createdAt: '2026-06-01', updatedAt: '2026-06-14' },
  { id: 't8', title: 'Security Audit Report', description: 'Review and document all security findings from the latest penetration test.', status: 'completed', priority: 'high', createdBy: 'e5', assignedTo: 'e7', dueDate: '2026-06-12', completedAt: '2026-06-11', tags: ['security'], createdAt: '2026-06-01', updatedAt: '2026-06-11' },
  { id: 't9', title: 'Marketing Landing Page', description: 'Create a responsive landing page for the upcoming product launch campaign.', status: 'pending', priority: 'medium', createdBy: 'e5', assignedTo: 'e3', dueDate: '2026-06-28', completedAt: null, tags: ['design', 'marketing'], createdAt: '2026-06-16', updatedAt: '2026-06-16' },
  { id: 't10', title: 'CI/CD Pipeline Setup', description: 'Set up automated testing and deployment pipelines using GitHub Actions.', status: 'in_progress', priority: 'high', createdBy: 'e5', assignedTo: 'e8', dueDate: '2026-06-21', completedAt: null, tags: ['engineering', 'devops'], createdAt: '2026-06-10', updatedAt: '2026-06-17' },
]

// --- Leave Requests ---
export const MOCK_LEAVES: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e3', leaveType: 'casual', startDate: '2026-06-23', endDate: '2026-06-24', reason: 'Family function', status: 'pending', managerId: 'e4', hrId: null, createdAt: '2026-06-15', updatedAt: '2026-06-15' },
  { id: 'l2', employeeId: 'e7', leaveType: 'medical', startDate: '2026-06-20', endDate: '2026-06-20', reason: 'Doctor appointment', status: 'manager_approved', managerId: 'e5', hrId: 'e2', createdAt: '2026-06-14', updatedAt: '2026-06-16' },
  { id: 'l3', employeeId: 'e8', leaveType: 'wfh', startDate: '2026-06-18', endDate: '2026-06-18', reason: 'Internet installation at home', status: 'hr_approved', managerId: 'e5', hrId: 'e2', createdAt: '2026-06-13', updatedAt: '2026-06-14' },
  { id: 'l4', employeeId: 'e3', leaveType: 'casual', startDate: '2026-06-05', endDate: '2026-06-06', reason: 'Personal errands', status: 'hr_approved', managerId: 'e4', hrId: 'e2', createdAt: '2026-06-01', updatedAt: '2026-06-03' },
  { id: 'l5', employeeId: 'e4', leaveType: 'emergency', startDate: '2026-06-10', endDate: '2026-06-10', reason: 'Family emergency', status: 'hr_approved', managerId: 'e5', hrId: 'e2', createdAt: '2026-06-10', updatedAt: '2026-06-10' },
]

// --- Leave Balances ---
export const MOCK_LEAVE_BALANCES: Record<string, LeaveBalance> = {
  'e3': { casual: 10, medical: 6, emergency: 3, wfh: 999 },
  'e4': { casual: 11, medical: 6, emergency: 2, wfh: 999 },
  'e7': { casual: 12, medical: 5, emergency: 3, wfh: 999 },
  'e8': { casual: 12, medical: 6, emergency: 3, wfh: 999 },
}

// --- Announcements ---
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Q3 Company All-Hands Meeting', content: 'Join us for our quarterly all-hands meeting on July 1st at 10:00 AM in the main auditorium. We will be reviewing Q2 results and sharing our Q3 roadmap. Remote participants can join via the calendar invite link.', category: 'event', priority: 'important', targetAudience: 'all', isPinned: true, authorId: 'e1', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-17T08:00:00Z' },
  { id: 'a2', title: 'Updated Work From Home Policy', content: 'Starting July 1st, all employees are entitled to up to 3 WFH days per week, subject to manager approval. Please review the updated policy document on the HR portal for full details.', category: 'policy', priority: 'normal', targetAudience: 'all', isPinned: true, authorId: 'e2', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-16T10:00:00Z' },
  { id: 'a3', title: 'Independence Day Holiday', content: 'The office will remain closed on August 15th for Independence Day. Please plan your work accordingly and ensure all critical tasks are handed off before the holiday.', category: 'holiday', priority: 'normal', targetAudience: 'all', isPinned: false, authorId: 'e2', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-15T09:00:00Z' },
  { id: 'a4', title: 'New Cafeteria Menu Launched', content: 'We are excited to announce a revamped cafeteria menu with healthier options, including vegan and gluten-free meals. Check the updated menu at the cafeteria entrance.', category: 'news', priority: 'normal', targetAudience: 'all', isPinned: false, authorId: 'e6', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-14T12:00:00Z' },
  { id: 'a5', title: 'Annual Team Outing — Save the Date', content: 'Mark your calendars! The annual team outing is planned for July 19-20 at Riverside Resort. More details and RSVP link coming soon.', category: 'event', priority: 'normal', targetAudience: 'all', isPinned: false, authorId: 'e2', attachmentUrl: null, imageUrl: null, createdAt: '2026-06-13T11:00:00Z' },
]

// --- Meeting Rooms ---
export const MOCK_ROOMS: MeetingRoom[] = [
  { id: 'r1', name: 'Apollo', capacity: 10, floor: '3rd Floor', amenities: ['Projector', 'Whiteboard', 'Video Conf'], isActive: true },
  { id: 'r2', name: 'Gemini', capacity: 6, floor: '3rd Floor', amenities: ['TV Screen', 'Whiteboard'], isActive: true },
  { id: 'r3', name: 'Orion', capacity: 20, floor: '5th Floor', amenities: ['Projector', 'Sound System', 'Video Conf', 'Recording'], isActive: true },
  { id: 'r4', name: 'Nova', capacity: 4, floor: '2nd Floor', amenities: ['TV Screen'], isActive: true },
  { id: 'r5', name: 'Zenith', capacity: 8, floor: '4th Floor', amenities: ['Projector', 'Whiteboard', 'Video Conf'], isActive: false },
]

export const MOCK_BOOKINGS: RoomBooking[] = [
  { id: 'b1', roomId: 'r1', bookedBy: 'e3', title: 'Design Review', startTime: '2026-06-17T10:00:00Z', endTime: '2026-06-17T11:00:00Z', attendees: ['e3', 'e4'], status: 'confirmed', createdAt: '2026-06-16' },
  { id: 'b2', roomId: 'r3', bookedBy: 'e5', title: 'Sprint Planning', startTime: '2026-06-17T14:00:00Z', endTime: '2026-06-17T15:30:00Z', attendees: ['e5', 'e7', 'e8'], status: 'confirmed', createdAt: '2026-06-15' },
  { id: 'b3', roomId: 'r2', bookedBy: 'e2', title: 'HR Sync', startTime: '2026-06-18T09:00:00Z', endTime: '2026-06-18T09:30:00Z', attendees: ['e2', 'e1'], status: 'confirmed', createdAt: '2026-06-16' },
]

// --- Assets ---
export const MOCK_ASSETS: Asset[] = [
  { id: 'as1', name: 'MacBook Pro 16"', category: 'laptop', serialNumber: 'MBP-2025-001', purchaseDate: '2025-01-15', warrantyExpiry: '2027-01-15', condition: 'good', status: 'assigned' },
  { id: 'as2', name: 'MacBook Pro 14"', category: 'laptop', serialNumber: 'MBP-2025-002', purchaseDate: '2025-03-10', warrantyExpiry: '2027-03-10', condition: 'good', status: 'assigned' },
  { id: 'as3', name: 'Dell UltraSharp 27"', category: 'monitor', serialNumber: 'DU27-001', purchaseDate: '2025-02-01', warrantyExpiry: '2028-02-01', condition: 'good', status: 'assigned' },
  { id: 'as4', name: 'iPhone 16 Pro', category: 'phone', serialNumber: 'IP16-001', purchaseDate: '2025-09-20', warrantyExpiry: '2026-09-20', condition: 'new', status: 'assigned' },
  { id: 'as5', name: 'Sony WH-1000XM6', category: 'accessory', serialNumber: 'SWH-001', purchaseDate: '2025-06-01', warrantyExpiry: '2026-06-01', condition: 'good', status: 'assigned' },
  { id: 'as6', name: 'Dell Optiplex 7090', category: 'desktop', serialNumber: 'DO-001', purchaseDate: '2025-01-01', warrantyExpiry: '2028-01-01', condition: 'good', status: 'available' },
  { id: 'as7', name: 'LG 34" Ultrawide', category: 'monitor', serialNumber: 'LG34-001', purchaseDate: '2025-04-15', warrantyExpiry: '2028-04-15', condition: 'new', status: 'available' },
]

export const MOCK_ASSET_ASSIGNMENTS: AssetAssignment[] = [
  { id: 'aa1', assetId: 'as1', employeeId: 'e3', assignedDate: '2025-03-15', returnedDate: null, notes: 'Primary work machine' },
  { id: 'aa2', assetId: 'as2', employeeId: 'e7', assignedDate: '2025-05-10', returnedDate: null, notes: '' },
  { id: 'aa3', assetId: 'as3', employeeId: 'e3', assignedDate: '2025-03-15', returnedDate: null, notes: 'External display' },
  { id: 'aa4', assetId: 'as4', employeeId: 'e5', assignedDate: '2025-09-25', returnedDate: null, notes: 'Company phone' },
  { id: 'aa5', assetId: 'as5', employeeId: 'e8', assignedDate: '2025-06-05', returnedDate: null, notes: '' },
]

// --- Visitors ---
export const MOCK_VISITORS: VisitorLog[] = [
  { id: 'v1', visitorName: 'Raj Patel', company: 'Acme Corp', phone: '+919876543210', purpose: 'Client meeting with Engineering', hostId: 'e5', checkIn: '2026-06-17T09:30:00Z', checkOut: null, badgeNumber: 'V-001', status: 'checked_in' },
  { id: 'v2', visitorName: 'Emma Wilson', company: 'DesignHub', phone: '+14155551234', purpose: 'Portfolio review', hostId: 'e4', checkIn: '2026-06-17T10:00:00Z', checkOut: null, badgeNumber: 'V-002', status: 'checked_in' },
  { id: 'v3', visitorName: 'Tom Harris', company: 'Freelance', phone: '+447700123456', purpose: 'Job interview — Senior Engineer', hostId: 'e2', checkIn: '2026-06-16T14:00:00Z', checkOut: '2026-06-16T15:30:00Z', badgeNumber: 'V-003', status: 'checked_out' },
]

// --- Productivity Scores ---
export const MOCK_PRODUCTIVITY: ProductivityScore[] = [
  { id: 'ps1', employeeId: 'e3', date: '2026-06-17', score: 85, factors: { attendance: 95, taskCompletion: 80, focus: 82 } },
  { id: 'ps2', employeeId: 'e7', date: '2026-06-17', score: 92, factors: { attendance: 100, taskCompletion: 90, focus: 88 } },
  { id: 'ps3', employeeId: 'e8', date: '2026-06-17', score: 78, factors: { attendance: 85, taskCompletion: 75, focus: 72 } },
  { id: 'ps4', employeeId: 'e4', date: '2026-06-17', score: 90, factors: { attendance: 98, taskCompletion: 88, focus: 85 } },
]

// --- AI Insights ---
export const MOCK_AI_INSIGHTS: AIInsight[] = [
  { id: 'ai1', employeeId: 'e3', insightType: 'productivity_tip', title: 'Morning Focus Zone', content: 'You complete tasks 15% faster during morning sessions (9-11 AM). Consider scheduling deep work before 11:00 AM for maximum efficiency.', severity: 'info', isRead: false, createdAt: '2026-06-17T08:00:00Z' },
  { id: 'ai2', employeeId: 'e3', insightType: 'pattern', title: 'Break Optimization', content: 'Your average break duration is 12 minutes shorter than peers. Taking regular 15-minute breaks can improve afternoon productivity by up to 20%.', severity: 'info', isRead: false, createdAt: '2026-06-16T08:00:00Z' },
  { id: 'ai3', employeeId: 'e8', insightType: 'burnout_warning', title: 'Burnout Risk Detected', content: 'You have worked more than 9 hours for 4 consecutive days. Consider taking a short break or half-day to recharge. Sustained overwork can reduce long-term output by 30%.', severity: 'warning', isRead: false, createdAt: '2026-06-17T07:00:00Z' },
  { id: 'ai4', employeeId: 'e7', insightType: 'improvement', title: 'Task Completion Streak', content: 'Great work! You have completed 12 tasks this week, 40% above your average. Keep up the momentum!', severity: 'info', isRead: true, createdAt: '2026-06-16T17:00:00Z' },
]

// --- Notifications ---
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', userId: 'u3', title: 'New Task Assigned', message: 'Sarah assigned you "Onboarding Flow Redesign"', type: 'task_assigned', isRead: false, actionUrl: '/employee/tasks', createdAt: '2026-06-17T09:00:00Z' },
  { id: 'n2', userId: 'u3', title: 'Leave Request Update', message: 'Your casual leave for Jun 23-24 is pending manager approval', type: 'leave_approved', isRead: false, actionUrl: '/employee/leaves', createdAt: '2026-06-16T14:00:00Z' },
  { id: 'n3', userId: 'u3', title: 'Meeting Reminder', message: 'Design Review in Apollo Room at 10:00 AM', type: 'meeting_reminder', isRead: true, actionUrl: '/employee/rooms', createdAt: '2026-06-17T09:45:00Z' },
  { id: 'n4', userId: 'u3', title: 'Company Announcement', message: 'Q3 All-Hands Meeting — July 1st', type: 'announcement', isRead: true, actionUrl: '/employee/announcements', createdAt: '2026-06-17T08:00:00Z' },
  { id: 'n5', userId: 'u7', title: 'Leave Approved', message: 'Your medical leave for Jun 20 has been approved by HR', type: 'leave_approved', isRead: false, actionUrl: '/employee/leaves', createdAt: '2026-06-16T16:00:00Z' },
]

// --- Salary Structures ---
export const MOCK_SALARIES: SalaryStructure[] = [
  { id: 's1', employeeId: 'e3', baseSalary: 60000, hra: 24000, da: 6000, specialAllowance: 10000, bonus: 5000, pf: 7200, tax: 8500, esi: 1050, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's2', employeeId: 'e7', baseSalary: 55000, hra: 22000, da: 5500, specialAllowance: 8000, bonus: 3000, pf: 6600, tax: 7000, esi: 900, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's3', employeeId: 'e8', baseSalary: 58000, hra: 23200, da: 5800, specialAllowance: 9000, bonus: 4000, pf: 6960, tax: 7800, esi: 950, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's4', employeeId: 'e4', baseSalary: 80000, hra: 32000, da: 8000, specialAllowance: 15000, bonus: 8000, pf: 9600, tax: 14000, esi: 1500, professionalTax: 200, effectiveFrom: '2025-04-01' },
  { id: 's5', employeeId: 'e5', baseSalary: 95000, hra: 38000, da: 9500, specialAllowance: 18000, bonus: 10000, pf: 11400, tax: 18500, esi: 1800, professionalTax: 200, effectiveFrom: '2025-04-01' },
]

export const MOCK_PAYSLIPS: Payslip[] = [
  { id: 'ps1', employeeId: 'e3', month: '2026-05', grossSalary: 105000, totalDeductions: 16950, netSalary: 88050, status: 'paid', generatedAt: '2026-06-01' },
  { id: 'ps2', employeeId: 'e3', month: '2026-06', grossSalary: 105000, totalDeductions: 16950, netSalary: 88050, status: 'generated', generatedAt: '2026-06-15' },
]

// --- Attendance Logs (last 7 days for current user) ---
export const MOCK_ATTENDANCE: AttendanceLog[] = [
  { id: 'at1', employeeId: 'e3', date: '2026-06-17', clockIn: '2026-06-17T09:02:00Z', clockOut: null, totalWorkSeconds: 15600, totalBreakSeconds: 2700, status: 'present' },
  { id: 'at2', employeeId: 'e3', date: '2026-06-16', clockIn: '2026-06-16T08:55:00Z', clockOut: '2026-06-16T17:10:00Z', totalWorkSeconds: 27000, totalBreakSeconds: 2700, status: 'present' },
  { id: 'at3', employeeId: 'e3', date: '2026-06-15', clockIn: '2026-06-15T09:10:00Z', clockOut: '2026-06-15T13:00:00Z', totalWorkSeconds: 12600, totalBreakSeconds: 1200, status: 'half_day' },
  { id: 'at4', employeeId: 'e3', date: '2026-06-14', clockIn: null, clockOut: null, totalWorkSeconds: 0, totalBreakSeconds: 0, status: 'absent' },
  { id: 'at5', employeeId: 'e3', date: '2026-06-13', clockIn: '2026-06-13T08:45:00Z', clockOut: '2026-06-13T17:30:00Z', totalWorkSeconds: 28800, totalBreakSeconds: 3600, status: 'present' },
  { id: 'at6', employeeId: 'e3', date: '2026-06-12', clockIn: '2026-06-12T09:00:00Z', clockOut: '2026-06-12T17:00:00Z', totalWorkSeconds: 28800, totalBreakSeconds: 2400, status: 'present' },
  { id: 'at7', employeeId: 'e3', date: '2026-06-11', clockIn: '2026-06-11T09:05:00Z', clockOut: '2026-06-11T17:15:00Z', totalWorkSeconds: 28800, totalBreakSeconds: 3000, status: 'present' },
]

// --- Rewards ---
export const MOCK_REWARDS: Reward[] = [
  { id: 'rw1', employeeId: 'e3', amount: 500, reason: 'Completed Q2 project ahead of schedule', type: 'earned', createdAt: '2026-06-10T10:00:00Z' },
  { id: 'rw2', employeeId: 'e3', amount: 150, reason: 'Helpful code review for team member', type: 'earned', createdAt: '2026-06-12T14:30:00Z' },
  { id: 'rw3', employeeId: 'e3', amount: -300, reason: 'Redeemed Team Lunch Voucher', type: 'spent', createdAt: '2026-06-15T12:00:00Z' },
  { id: 'rw4', employeeId: 'e4', amount: 1000, reason: 'Employee of the Month (May)', type: 'earned', createdAt: '2026-06-01T09:00:00Z' },
  { id: 'rw5', employeeId: 'e7', amount: 300, reason: 'Fixed critical production bug', type: 'earned', createdAt: '2026-06-14T11:00:00Z' },
]

// --- Achievements ---
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'ac1', employeeId: 'e3', achievementId: 'first_task', title: 'First Blood', description: 'Complete your first task', tier: 'bronze', xp: 50, currentProgress: 1, targetProgress: 1, unlockedAt: '2025-03-20T10:00:00Z' },
  { id: 'ac2', employeeId: 'e3', achievementId: 'streak_7', title: 'On Fire', description: 'Log in for 7 consecutive days', tier: 'silver', xp: 150, currentProgress: 7, targetProgress: 7, unlockedAt: '2026-06-17T09:00:00Z' },
  { id: 'ac3', employeeId: 'e3', achievementId: 'perfectionist', title: 'Perfectionist', description: 'Complete 10 tasks without any bugs reported', tier: 'gold', xp: 500, currentProgress: 8, targetProgress: 10, unlockedAt: null },
  { id: 'ac4', employeeId: 'e3', achievementId: 'team_player', title: 'Team Player', description: 'Leave 50 helpful comments on team tasks', tier: 'silver', xp: 200, currentProgress: 34, targetProgress: 50, unlockedAt: null },
  { id: 'ac5', employeeId: 'e3', achievementId: 'mentor', title: 'Mentor', description: 'Onboard a new team member', tier: 'platinum', xp: 1000, currentProgress: 0, targetProgress: 1, unlockedAt: null },
]

// --- Helper to get employee by id ---
export function getEmployeeById(id: string): Employee | undefined {
  return MOCK_EMPLOYEES.find(e => e.id === id)
}

export function getEmployeeByUserId(userId: string): Employee | undefined {
  return MOCK_EMPLOYEES.find(e => e.userId === userId)
}

export function getUserByEmail(email: string): User | undefined {
  return MOCK_USERS.find(u => u.email === email)
}

export function getDepartmentById(id: string): Department | undefined {
  return MOCK_DEPARTMENTS.find(d => d.id === id)
}

export function getFullName(employee: Employee): string {
  return `${employee.firstName} ${employee.lastName}`
}
