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
      break_preferences: {
        Row: {
          break_time_minutes: string | null
          created_at: string
          id: number
          offline_time_1: string | null
          offline_time_2: string | null
          selected_activities: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          break_time_minutes?: string | null
          created_at?: string
          id?: number
          offline_time_1?: string | null
          offline_time_2?: string | null
          selected_activities?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          break_time_minutes?: string | null
          created_at?: string
          id?: number
          offline_time_1?: string | null
          offline_time_2?: string | null
          selected_activities?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      break_preferences_updated: {
        Row: {
          break_time: string | null
          created_at: string
          id: number
          number_of_breaks: string | null
          selected_activities: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          break_time?: string | null
          created_at?: string
          id?: number
          number_of_breaks?: string | null
          selected_activities?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          break_time?: string | null
          created_at?: string
          id?: number
          number_of_breaks?: string | null
          selected_activities?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      freeform_preferences: {
        Row: {
          created_at: string
          id: number
          preference_modifications: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          preference_modifications?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          preference_modifications?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      generated_schedules: {
        Row: {
          created_at: string
          generated_schedule: Json | null
          id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          generated_schedule?: Json | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          generated_schedule?: Json | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      scheduler_feedback: {
        Row: {
          created_at: string
          id: number
          optional_feedback: string | null
          thumbs_value: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          optional_feedback?: string | null
          thumbs_value?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          optional_feedback?: string | null
          thumbs_value?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      work_preferences: {
        Row: {
          created_at: string
          end_time: string | null
          id: number
          selected_days: string | null
          selected_times: string | null
          start_time: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          id?: number
          selected_days?: string | null
          selected_times?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_time?: string | null
          id?: number
          selected_days?: string | null
          selected_times?: string | null
          start_time?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      work_preferences_updated: {
        Row: {
          created_at: string
          days: Json | null
          id: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          days?: Json | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          days?: Json | null
          id?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
