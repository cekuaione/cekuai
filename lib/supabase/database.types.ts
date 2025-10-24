export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string | null
          days_per_week: number
          duration_per_day: number
          equipment: string[]
          goal: string
          id: string
          is_active: boolean | null
          level: string
          notes: string | null
          plan_data: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
          cycle_id: string | null
          week_number: number | null
        }
        Insert: {
          created_at?: string | null
          days_per_week: number
          duration_per_day: number
          equipment: string[]
          goal: string
          id?: string
          is_active?: boolean | null
          level: string
          notes?: string | null
          plan_data?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          cycle_id?: string | null
          week_number?: number | null
        }
        Update: {
          created_at?: string | null
          days_per_week?: number
          duration_per_day?: number
          equipment?: string[]
          goal?: string
          id?: string
          is_active?: boolean | null
          level?: string
          notes?: string | null
          plan_data?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          cycle_id?: string | null
          week_number?: number | null
        }
        Relationships: []
      }
      crypto_assessments: {
        Row: {
          id: string
          user_id: string
          crypto_symbol: string
          investment_amount: number
          risk_tolerance: string
          time_horizon: string
          notes: string | null
          assessment_data: Json | null
          status: string
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crypto_symbol: string
          investment_amount: number
          risk_tolerance: string
          time_horizon: string
          notes?: string | null
          assessment_data?: Json | null
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crypto_symbol?: string
          investment_amount?: number
          risk_tolerance?: string
          time_horizon?: string
          notes?: string | null
          assessment_data?: Json | null
          status?: string
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_media_projects: {
        Row: {
          created_at: string | null
          error_message: string | null
          file_path: string | null
          id: string
          input_image_url: string
          operation_type: string
          output_image_url: string | null
          project_name: string | null
          project_type: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          input_image_url: string
          operation_type: string
          output_image_url?: string | null
          project_name?: string | null
          project_type: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          input_image_url?: string
          operation_type?: string
          output_image_url?: string | null
          project_name?: string | null
          project_type?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exercises: {
        Row: {
          exercise_id: string
          name: string
          gif_url: string
          target_muscles: string[]
          body_parts: string[]
          equipments: string[]
          secondary_muscles: string[]
          instructions: string[]
        }
        Insert: {
          exercise_id: string
          name: string
          gif_url: string
          target_muscles: string[]
          body_parts: string[]
          equipments: string[]
          secondary_muscles: string[]
          instructions: string[]
        }
        Update: {
          exercise_id?: string
          name?: string
          gif_url?: string
          target_muscles?: string[]
          body_parts?: string[]
          equipments?: string[]
          secondary_muscles?: string[]
          instructions?: string[]
        }
        Relationships: []
      }
      training_cycles: {
        Row: {
          id: string
          user_id: string
          cycle_number: number
          status: string
          start_date: string
          target_weeks: number
          preferences_snapshot: Json
          total_plans: number
          completed_plans: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          cycle_number: number
          status: string
          start_date: string
          target_weeks: number
          preferences_snapshot: Json
          total_plans?: number
          completed_plans?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          cycle_number?: number
          status?: string
          start_date?: string
          target_weeks?: number
          preferences_snapshot?: Json
          total_plans?: number
          completed_plans?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_training_preferences: {
        Row: {
          user_id: string
          age_range: string
          goal: string
          level: string
          injuries: string[]
          equipment: string[]
          days_per_week: number
          duration_per_day: number
          training_time: string
          compound_movements: string[]
          notes: string | null
          muscle_goal_details: Json | null
          weight_loss_details: Json | null
          endurance_details: Json | null
          general_fitness_details: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          age_range: string
          goal: string
          level: string
          injuries: string[]
          equipment: string[]
          days_per_week: number
          duration_per_day: number
          training_time: string
          compound_movements: string[]
          notes?: string | null
          muscle_goal_details?: Json | null
          weight_loss_details?: Json | null
          endurance_details?: Json | null
          general_fitness_details?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          age_range?: string
          goal?: string
          level?: string
          injuries?: string[]
          equipment?: string[]
          days_per_week?: number
          duration_per_day?: number
          training_time?: string
          compound_movements?: string[]
          notes?: string | null
          muscle_goal_details?: Json | null
          weight_loss_details?: Json | null
          endurance_details?: Json | null
          general_fitness_details?: Json | null
          created_at?: string
          updated_at?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
