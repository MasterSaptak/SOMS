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
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: { id: string; role?: string; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; role?: string; created_at?: string | null; updated_at?: string | null }
        Relationships: []
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
        Insert: { id?: string; user_id: string; employee_id_string?: string | null; full_name: string; email: string; phone?: string | null; department?: string | null; designation?: string | null; joining_date?: string | null; profile_photo?: string | null; address?: string | null; emergency_contact?: string | null; employment_status?: string | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; user_id?: string; employee_id_string?: string | null; full_name?: string; email?: string; phone?: string | null; department?: string | null; designation?: string | null; joining_date?: string | null; profile_photo?: string | null; address?: string | null; emergency_contact?: string | null; employment_status?: string | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
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
        Insert: { id?: string; employee_id: string; date?: string; clock_in: string; clock_out?: string | null; total_working_hours?: number | null; is_late?: boolean | null; is_early_leave?: boolean | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; employee_id?: string; date?: string; clock_in?: string; clock_out?: string | null; total_working_hours?: number | null; is_late?: boolean | null; is_early_leave?: boolean | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
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
        Insert: { id?: string; attendance_id: string; start_time: string; end_time?: string | null; duration_minutes?: number | null; created_at?: string | null }
        Update: { id?: string; attendance_id?: string; start_time?: string; end_time?: string | null; duration_minutes?: number | null; created_at?: string | null }
        Relationships: [
          {
            foreignKeyName: "breaks_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          }
        ]
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
        Insert: { id?: string; title: string; description?: string | null; status?: string | null; priority?: string | null; assigned_to?: string | null; created_by?: string | null; deadline?: string | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; title?: string; description?: string | null; status?: string | null; priority?: string | null; assigned_to?: string | null; created_by?: string | null; deadline?: string | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
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
        Insert: { id?: string; task_id: string; updated_by?: string | null; content: string; previous_status?: string | null; new_status?: string | null; created_at?: string | null }
        Update: { id?: string; task_id?: string; updated_by?: string | null; content?: string; previous_status?: string | null; new_status?: string | null; created_at?: string | null }
        Relationships: []
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
        Insert: { id?: string; employee_id: string; leave_type: string; status?: string | null; start_date: string; end_date: string; reason?: string | null; approved_by?: string | null; created_at?: string | null; updated_at?: string | null }
        Update: { id?: string; employee_id?: string; leave_type?: string; status?: string | null; start_date?: string; end_date?: string; reason?: string | null; approved_by?: string | null; created_at?: string | null; updated_at?: string | null }
        Relationships: []
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
        Insert: { id?: string; employee_id: string; title: string; message: string; type: string; reference_id?: string | null; is_read?: boolean | null; created_at?: string | null }
        Update: { id?: string; employee_id?: string; title?: string; message?: string; type?: string; reference_id?: string | null; is_read?: boolean | null; created_at?: string | null }
        Relationships: []
      }
      audit_logs: {
        Row: { id: string; user_id: string | null; action: string; resource: string; details: Json | null; ip_address: string | null; user_agent: string | null; created_at: string | null; }
        Insert: { id?: string; user_id?: string | null; action: string; resource: string; details?: Json | null; ip_address?: string | null; user_agent?: string | null; created_at?: string | null; }
        Update: { id?: string; user_id?: string | null; action?: string; resource?: string; details?: Json | null; ip_address?: string | null; user_agent?: string | null; created_at?: string | null; }
        Relationships: []
      }
      workflows: {
        Row: { id: string; name: string; description: string | null; trigger_event: string; status: string; created_by: string; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; name: string; description?: string | null; trigger_event: string; status?: string; created_by: string; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; name?: string; description?: string | null; trigger_event?: string; status?: string; created_by?: string; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      features: {
        Row: { id: string; name: string; key: string; description: string | null; is_enabled: boolean; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; name: string; key: string; description?: string | null; is_enabled?: boolean; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; name?: string; key?: string; description?: string | null; is_enabled?: boolean; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      organizations: {
        Row: { id: string; name: string; slug: string; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; name: string; slug: string; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; name?: string; slug?: string; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      timeline_events: {
        Row: { id: string; employee_id: string; event_type: string; title: string; description: string; date: string; metadata: Json | null; created_at: string | null; }
        Insert: { id?: string; employee_id: string; event_type: string; title: string; description: string; date: string; metadata?: Json | null; created_at?: string | null; }
        Update: { id?: string; employee_id?: string; event_type?: string; title?: string; description?: string; date?: string; metadata?: Json | null; created_at?: string | null; }
        Relationships: []
      }
      document_categories: {
        Row: { id: string; name: string; slug: string; description: string | null; created_at: string | null; }
        Insert: { id?: string; name: string; slug: string; description?: string | null; created_at?: string | null; }
        Update: { id?: string; name?: string; slug?: string; description?: string | null; created_at?: string | null; }
        Relationships: []
      }
      documents: {
        Row: { id: string; category_id: string; employee_id: string | null; uploader_id: string; title: string; file_path: string; file_type: string; file_size: number; status: string; expires_at: string | null; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; category_id: string; employee_id?: string | null; uploader_id: string; title: string; file_path: string; file_type: string; file_size: number; status?: string; expires_at?: string | null; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; category_id?: string; employee_id?: string | null; uploader_id?: string; title?: string; file_path?: string; file_type?: string; file_size?: number; status?: string; expires_at?: string | null; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      document_versions: {
        Row: { id: string; document_id: string; version_number: number; file_path: string; file_size: number; uploaded_by: string; created_at: string | null; }
        Insert: { id?: string; document_id: string; version_number: number; file_path: string; file_size: number; uploaded_by: string; created_at?: string | null; }
        Update: { id?: string; document_id?: string; version_number?: number; file_path?: string; file_size?: number; uploaded_by?: string; created_at?: string | null; }
        Relationships: []
      }
      document_permissions: {
        Row: { id: string; document_id: string; role: string | null; employee_id: string | null; can_view: boolean; can_edit: boolean; can_download: boolean; created_at: string | null; }
        Insert: { id?: string; document_id: string; role?: string | null; employee_id?: string | null; can_view?: boolean; can_edit?: boolean; can_download?: boolean; created_at?: string | null; }
        Update: { id?: string; document_id?: string; role?: string | null; employee_id?: string | null; can_view?: boolean; can_edit?: boolean; can_download?: boolean; created_at?: string | null; }
        Relationships: []
      }
      role_permissions: {
        Row: { id: string; role: string; resource: string; actions: string[]; conditions: Json | null; created_at: string | null; }
        Insert: { id?: string; role: string; resource: string; actions: string[]; conditions?: Json | null; created_at?: string | null; }
        Update: { id?: string; role?: string; resource?: string; actions?: string[]; conditions?: Json | null; created_at?: string | null; }
        Relationships: []
      }
      user_permissions: {
        Row: { id: string; employee_id: string; resource: string; actions: string[]; expires_at: string | null; created_at: string | null; }
        Insert: { id?: string; employee_id: string; resource: string; actions: string[]; expires_at?: string | null; created_at?: string | null; }
        Update: { id?: string; employee_id?: string; resource?: string; actions?: string[]; expires_at?: string | null; created_at?: string | null; }
        Relationships: []
      }
      organization_activity: {
        Row: { id: string; organization_id: string | null; employee_id: string | null; activity_type: string; message: string; metadata: Json | null; created_at: string | null; }
        Insert: { id?: string; organization_id?: string | null; employee_id?: string | null; activity_type: string; message: string; metadata?: Json | null; created_at?: string | null; }
        Update: { id?: string; organization_id?: string | null; employee_id?: string | null; activity_type?: string; message?: string; metadata?: Json | null; created_at?: string | null; }
        Relationships: []
      }
      user_preferences: {
        Row: { id: string; employee_id: string; theme: string | null; widget_order: Json | null; quick_actions: Json | null; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; employee_id: string; theme?: string | null; widget_order?: Json | null; quick_actions?: Json | null; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; employee_id?: string; theme?: string | null; widget_order?: Json | null; quick_actions?: Json | null; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      departments: {
        Row: { id: string; organization_id: string; name: string; head_id: string | null; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; organization_id: string; name: string; head_id?: string | null; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; organization_id?: string; name?: string; head_id?: string | null; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      teams: {
        Row: { id: string; department_id: string; name: string; lead_id: string | null; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; department_id: string; name: string; lead_id?: string | null; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; department_id?: string; name?: string; lead_id?: string | null; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      branches: {
        Row: { id: string; organization_id: string; name: string; location_id: string | null; created_at: string | null; }
        Insert: { id?: string; organization_id: string; name: string; location_id?: string | null; created_at?: string | null; }
        Update: { id?: string; organization_id?: string; name?: string; location_id?: string | null; created_at?: string | null; }
        Relationships: []
      }
      locations: {
        Row: { id: string; name: string; address: string; city: string; country: string; created_at: string | null; }
        Insert: { id?: string; name: string; address: string; city: string; country: string; created_at?: string | null; }
        Update: { id?: string; name?: string; address?: string; city?: string; country?: string; created_at?: string | null; }
        Relationships: []
      }
      roles: {
        Row: { id: string; name: string; description: string | null; created_at: string | null; }
        Insert: { id?: string; name: string; description?: string | null; created_at?: string | null; }
        Update: { id?: string; name?: string; description?: string | null; created_at?: string | null; }
        Relationships: []
      }
      permissions: {
        Row: { id: string; name: string; resource: string; action: string; created_at: string | null; }
        Insert: { id?: string; name: string; resource: string; action: string; created_at?: string | null; }
        Update: { id?: string; name?: string; resource?: string; action?: string; created_at?: string | null; }
        Relationships: []
      }
      meetings: {
        Row: { id: string; title: string; description: string | null; start_time: string; end_time: string; organizer_id: string; room_id: string | null; created_at: string | null; }
        Insert: { id?: string; title: string; description?: string | null; start_time: string; end_time: string; organizer_id: string; room_id?: string | null; created_at?: string | null; }
        Update: { id?: string; title?: string; description?: string | null; start_time?: string; end_time?: string; organizer_id?: string; room_id?: string | null; created_at?: string | null; }
        Relationships: []
      }
      projects: {
        Row: { id: string; name: string; description: string | null; status: string; start_date: string | null; end_date: string | null; created_at: string | null; }
        Insert: { id?: string; name: string; description?: string | null; status?: string; start_date?: string | null; end_date?: string | null; created_at?: string | null; }
        Update: { id?: string; name?: string; description?: string | null; status?: string; start_date?: string | null; end_date?: string | null; created_at?: string | null; }
        Relationships: []
      }
      project_members: {
        Row: { id: string; project_id: string; employee_id: string; role: string; joined_at: string | null; }
        Insert: { id?: string; project_id: string; employee_id: string; role: string; joined_at?: string | null; }
        Update: { id?: string; project_id?: string; employee_id?: string; role?: string; joined_at?: string | null; }
        Relationships: []
      }
      comments: {
        Row: { id: string; entity_type: string; entity_id: string; author_id: string; content: string; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; entity_type: string; entity_id: string; author_id: string; content: string; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; entity_type?: string; entity_id?: string; author_id?: string; content?: string; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
      }
      attachments: {
        Row: { id: string; entity_type: string; entity_id: string; file_path: string; file_name: string; file_size: number; uploaded_by: string; created_at: string | null; }
        Insert: { id?: string; entity_type: string; entity_id: string; file_path: string; file_name: string; file_size: number; uploaded_by: string; created_at?: string | null; }
        Update: { id?: string; entity_type?: string; entity_id?: string; file_path?: string; file_name?: string; file_size?: number; uploaded_by?: string; created_at?: string | null; }
        Relationships: []
      }
      assets: {
        Row: { id: string; name: string; type: string; serial_number: string | null; status: string; purchase_date: string | null; created_at: string | null; }
        Insert: { id?: string; name: string; type: string; serial_number?: string | null; status?: string; purchase_date?: string | null; created_at?: string | null; }
        Update: { id?: string; name?: string; type?: string; serial_number?: string | null; status?: string; purchase_date?: string | null; created_at?: string | null; }
        Relationships: []
      }
      asset_assignments: {
        Row: { id: string; asset_id: string; employee_id: string; assigned_at: string | null; returned_at: string | null; condition_notes: string | null; }
        Insert: { id?: string; asset_id: string; employee_id: string; assigned_at?: string | null; returned_at?: string | null; condition_notes?: string | null; }
        Update: { id?: string; asset_id?: string; employee_id?: string; assigned_at?: string | null; returned_at?: string | null; condition_notes?: string | null; }
        Relationships: []
      }
      work_sessions: {
        Row: { id: string; employee_id: string; start_time: string; end_time: string | null; focus_score: number | null; created_at: string | null; }
        Insert: { id?: string; employee_id: string; start_time: string; end_time?: string | null; focus_score?: number | null; created_at?: string | null; }
        Update: { id?: string; employee_id?: string; start_time?: string; end_time?: string | null; focus_score?: number | null; created_at?: string | null; }
        Relationships: []
      }
      organization_settings: {
        Row: { id: string; organization_id: string; key: string; value: Json; updated_by: string; updated_at: string | null; }
        Insert: { id?: string; organization_id: string; key: string; value: Json; updated_by: string; updated_at?: string | null; }
        Update: { id?: string; organization_id?: string; key?: string; value?: Json; updated_by?: string; updated_at?: string | null; }
        Relationships: []
      }
      api_keys: {
        Row: { id: string; organization_id: string; name: string; key_hash: string; scopes: string[]; expires_at: string | null; created_at: string | null; }
        Insert: { id?: string; organization_id: string; name: string; key_hash: string; scopes: string[]; expires_at?: string | null; created_at?: string | null; }
        Update: { id?: string; organization_id?: string; name?: string; key_hash?: string; scopes?: string[]; expires_at?: string | null; created_at?: string | null; }
        Relationships: []
      }
      webhooks: {
        Row: { id: string; organization_id: string; url: string; events: string[]; secret: string | null; is_active: boolean; created_at: string | null; }
        Insert: { id?: string; organization_id: string; url: string; events: string[]; secret?: string | null; is_active?: boolean; created_at?: string | null; }
        Update: { id?: string; organization_id?: string; url?: string; events?: string[]; secret?: string | null; is_active?: boolean; created_at?: string | null; }
        Relationships: []
      }
      integrations: {
        Row: { id: string; organization_id: string; provider: string; credentials: Json; status: string; created_at: string | null; updated_at: string | null; }
        Insert: { id?: string; organization_id: string; provider: string; credentials: Json; status?: string; created_at?: string | null; updated_at?: string | null; }
        Update: { id?: string; organization_id?: string; provider?: string; credentials?: Json; status?: string; created_at?: string | null; updated_at?: string | null; }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Sprint A Supplemental Table Types ────────────────────────────────────────
// These types extend the Database definition for Sprint A tables.
// They are used by repositories/stores that reference these tables directly
// via typed Supabase client. Declared separately to avoid breaking
// auto-generated Database type structure.

export interface SprintATables {
  organization_members: {
    Row: {
      id: string
      organization_id: string
      user_id: string
      role: string
      status: string
      joined_at: string
    }
    Insert: {
      id?: string
      organization_id: string
      user_id: string
      role?: string
      status?: string
      joined_at?: string
    }
    Update: {
      id?: string
      organization_id?: string
      user_id?: string
      role?: string
      status?: string
      joined_at?: string
    }
  }
  organization_invitations: {
    Row: {
      id: string
      organization_id: string
      invited_by_user_id: string
      email: string
      role: string
      token: string
      status: string
      expires_at: string
      created_at: string
    }
    Insert: {
      id?: string
      organization_id: string
      invited_by_user_id: string
      email: string
      role?: string
      token: string
      status?: string
      expires_at: string
      created_at?: string
    }
    Update: {
      id?: string
      organization_id?: string
      invited_by_user_id?: string
      email?: string
      role?: string
      token?: string
      status?: string
      expires_at?: string
      created_at?: string
    }
  }
  organization_settings: {
    Row: {
      id: string
      organization_id: string
      key: string
      value: import('./types').Json
      updated_by: string | null
      updated_at: string
    }
    Insert: {
      id?: string
      organization_id: string
      key: string
      value?: import('./types').Json
      updated_by?: string | null
      updated_at?: string
    }
    Update: {
      id?: string
      organization_id?: string
      key?: string
      value?: import('./types').Json
      updated_by?: string | null
      updated_at?: string
    }
  }
  roles: {
    Row: {
      id: string
      name: string
      display_name: string
      organization_id: string | null
      is_system: boolean
      created_at: string
    }
    Insert: {
      id?: string
      name: string
      display_name: string
      organization_id?: string | null
      is_system?: boolean
      created_at?: string
    }
    Update: {
      id?: string
      name?: string
      display_name?: string
      organization_id?: string | null
      is_system?: boolean
      created_at?: string
    }
  }
  role_permissions: {
    Row: {
      id: string
      role_id: string
      permission_key: string
      created_at: string
    }
    Insert: {
      id?: string
      role_id: string
      permission_key: string
      created_at?: string
    }
    Update: {
      id?: string
      role_id?: string
      permission_key?: string
      created_at?: string
    }
  }
  user_roles: {
    Row: {
      id: string
      user_id: string
      organization_id: string
      role_id: string
      assigned_by: string | null
      assigned_at: string
    }
    Insert: {
      id?: string
      user_id: string
      organization_id: string
      role_id: string
      assigned_by?: string | null
      assigned_at?: string
    }
    Update: {
      id?: string
      user_id?: string
      organization_id?: string
      role_id?: string
      assigned_by?: string | null
      assigned_at?: string
    }
  }
  organization_features: {
    Row: {
      id: string
      organization_id: string
      feature_key: string
      is_enabled: boolean
      config: import('./types').Json | null
      enabled_at: string | null
      enabled_by: string | null
    }
    Insert: {
      id?: string
      organization_id: string
      feature_key: string
      is_enabled?: boolean
      config?: import('./types').Json | null
      enabled_at?: string | null
      enabled_by?: string | null
    }
    Update: {
      id?: string
      organization_id?: string
      feature_key?: string
      is_enabled?: boolean
      config?: import('./types').Json | null
      enabled_at?: string | null
      enabled_by?: string | null
    }
  }
  user_permissions: {
    Row: {
      id: string
      employee_id: string
      resource: string
      actions: string[]
      expires_at: string | null
      created_at: string
    }
    Insert: {
      id?: string
      employee_id: string
      resource: string
      actions: string[]
      expires_at?: string | null
      created_at?: string
    }
    Update: {
      id?: string
      employee_id?: string
      resource?: string
      actions?: string[]
      expires_at?: string | null
      created_at?: string
    }
  }
}
