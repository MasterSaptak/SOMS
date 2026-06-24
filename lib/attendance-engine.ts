import { SmartAttendanceStatus, LatenessStatus } from './types'

export interface AttendanceRecord {
  clock_in?: string | null
  clock_out?: string | null
  total_working_hours?: number | null
  is_early_leave?: boolean | null
  is_remote?: boolean | null
  notes?: string | null
  status?: string | null
}

export interface LeaveRecord {
  startDate: string
  endDate: string
  status: string
  leaveType: string
}

export interface EngineConfig {
  officeStartHour: number
  officeStartMinute: number
  lateThresholdMinutes: number
  normalWorkHours: number
}

const DEFAULT_CONFIG: EngineConfig = {
  officeStartHour: 9,
  officeStartMinute: 0,
  lateThresholdMinutes: 15,
  normalWorkHours: 4,
}

export class SmartAttendanceEngine {
  
  /**
   * Evaluates the SmartAttendanceStatus for a given employee on a specific date.
   * Priority: Holiday -> Weekend -> Approved Leave -> Work Session -> Override -> Absent
   */
  static computeDailyStatus(
    dateStr: string, // YYYY-MM-DD
    attendanceRecord?: AttendanceRecord | null,
    leaveRecord?: LeaveRecord | null,
    isHoliday: boolean = false,
    config: EngineConfig = DEFAULT_CONFIG
  ): SmartAttendanceStatus {
    
    // 1. Holiday Check
    if (isHoliday) {
      return 'holiday'
    }

    // 2. Weekend Check
    const dateObj = new Date(dateStr + 'T00:00:00')
    const dayOfWeek = dateObj.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'weekend'
    }

    // 3. Approved Leave Check
    if (leaveRecord && (leaveRecord.status === 'completed' || leaveRecord.status === 'manager_approved' || leaveRecord.status === 'hr_approved')) {
      return 'approved_leave'
    }

    // 4. Manual Admin Override Check
    // If the database has an explicit manual override, it supersedes normal session logic
    if (attendanceRecord?.notes?.includes('ADMIN_OVERRIDE')) {
      return 'admin_override'
    }

    // 5. Work Session Evaluation
    if (attendanceRecord) {
      if (attendanceRecord.is_remote) {
        return 'remote'
      }

      if (!attendanceRecord.clock_in) {
        return 'no_activity' // Row exists but never clocked in (e.g., pre-created by system)
      }

      const workedHours = attendanceRecord.total_working_hours || 0

      if (attendanceRecord.clock_out) {
        if (attendanceRecord.is_early_leave || workedHours < config.normalWorkHours) {
          return 'partial_day'
        }
        if (workedHours > config.normalWorkHours) {
          return 'present_compensation'
        }
        return 'present'
      } else {
        // Session is still active (no clock out yet)
        // If they've already worked past the normal limit without closing it
        if (workedHours > config.normalWorkHours) {
          return 'present_compensation'
        }
        return 'present' // Or could be a distinct "working" status, but "present" is standard for active sessions
      }
    }

    // 6. Absent Check
    // If we are looking at a past date and no record exists, they are absent.
    const todayStr = new Date().toISOString().split('T')[0]
    if (dateStr < todayStr) {
      return 'absent'
    } else {
      // If it's today and they haven't checked in yet, 'no_activity' is more accurate until day ends.
      return 'no_activity'
    }
  }

  /**
   * Determines if a given clock-in time is considered late based on office hours.
   */
  static getLatenessStatus(
    clockInIso: string | null,
    config: EngineConfig = DEFAULT_CONFIG
  ): LatenessStatus {
    if (!clockInIso) return 'on_time'

    const clockIn = new Date(clockInIso)
    const expectedStart = new Date(clockInIso)
    expectedStart.setHours(config.officeStartHour, config.officeStartMinute, 0, 0)

    const diffMinutes = (clockIn.getTime() - expectedStart.getTime()) / (1000 * 60)

    if (diffMinutes <= 0) return 'on_time'
    if (diffMinutes <= config.lateThresholdMinutes) return 'slightly_late'
    return 'late'
  }

  /**
   * Calculates a holistic Attendance Score (0-100) based on historical records.
   */
  static calculateScore(records: AttendanceRecord[], config: EngineConfig = DEFAULT_CONFIG): number {
    if (!records || records.length === 0) return 100 // Default perfect score

    let score = 100
    const totalRecords = records.length
    
    // Penalties
    const LATE_PENALTY = 2
    const SLIGHTLY_LATE_PENALTY = 0.5
    const EARLY_EXIT_PENALTY = 2
    const ABSENT_PENALTY = 5

    // Bonuses
    const COMPENSATION_BONUS = 1

    records.forEach(r => {
      // Late Check
      if (r.clock_in) {
        const lateness = this.getLatenessStatus(r.clock_in, config)
        if (lateness === 'late') score -= LATE_PENALTY
        else if (lateness === 'slightly_late') score -= SLIGHTLY_LATE_PENALTY
      } else {
        // No clock in -> absent penalty
        score -= ABSENT_PENALTY
      }

      // Early Exit / Partial Day
      if (r.is_early_leave || (r.total_working_hours || 0) < config.normalWorkHours) {
        score -= EARLY_EXIT_PENALTY
      }

      // Compensation Bonus
      if ((r.total_working_hours || 0) > config.normalWorkHours) {
        score += COMPENSATION_BONUS
      }
    })

    // Ensure score stays bounded
    return Math.max(0, Math.min(Math.round(score), 100))
  }
}
