export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'admin' | 'employee'
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          role?: 'admin' | 'employee'
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          role?: 'admin' | 'employee'
          created_at?: string | null
          updated_at?: string | null
        }
      }
      employees: {
        Row: {
          id: string
          user_id: string
          employee_id_string: string | null
          full_name: string
          email: string
          phone: string | null
          department: string | null
          designation: string | null
          joining_date: string | null
          profile_photo: string | null
          address: string | null
          emergency_contact: string | null
          employment_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          employee_id_string?: string | null
          full_name: string
          email: string
          phone?: string | null
          department?: string | null
          designation?: string | null
          joining_date?: string | null
          profile_photo?: string | null
          address?: string | null
          emergency_contact?: string | null
          employment_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          employee_id_string?: string | null
          full_name?: string
          email?: string
          phone?: string | null
          department?: string | null
          designation?: string | null
          joining_date?: string | null
          profile_photo?: string | null
          address?: string | null
          emergency_contact?: string | null
          employment_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      attendance: {
        Row: {
          id: string
          employee_id: string
          date: string
          clock_in: string
          clock_out: string | null
          total_working_hours: number | null
          is_late: boolean | null
          is_early_leave: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          date?: string
          clock_in: string
          clock_out?: string | null
          total_working_hours?: number | null
          is_late?: boolean | null
          is_early_leave?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          date?: string
          clock_in?: string
          clock_out?: string | null
          total_working_hours?: number | null
          is_late?: boolean | null
          is_early_leave?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      breaks: {
        Row: {
          id: string
          attendance_id: string
          start_time: string
          end_time: string | null
          duration_minutes: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          attendance_id: string
          start_time: string
          end_time?: string | null
          duration_minutes?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          attendance_id?: string
          start_time?: string
          end_time?: string | null
          duration_minutes?: number | null
          created_at?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string | null
          priority: string | null
          assigned_to: string | null
          created_by: string | null
          deadline: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string | null
          priority?: string | null
          assigned_to?: string | null
          created_by?: string | null
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string | null
          priority?: string | null
          assigned_to?: string | null
          created_by?: string | null
          deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      task_updates: {
        Row: {
          id: string
          task_id: string
          updated_by: string | null
          content: string
          previous_status: string | null
          new_status: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          updated_by?: string | null
          content: string
          previous_status?: string | null
          new_status?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          updated_by?: string | null
          content?: string
          previous_status?: string | null
          new_status?: string | null
          created_at?: string | null
        }
      }
      leaves: {
        Row: {
          id: string
          employee_id: string
          leave_type: string
          status: string | null
          start_date: string
          end_date: string
          reason: string | null
          approved_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          leave_type: string
          status?: string | null
          start_date: string
          end_date: string
          reason?: string | null
          approved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          leave_type?: string
          status?: string | null
          start_date?: string
          end_date?: string
          reason?: string | null
          approved_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          employee_id: string
          title: string
          message: string
          type: string
          reference_id: string | null
          is_read: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          employee_id: string
          title: string
          message: string
          type: string
          reference_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          employee_id?: string
          title?: string
          message?: string
          type?: string
          reference_id?: string | null
          is_read?: boolean | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      user_role: 'admin' | 'employee'
    }
  }
}
