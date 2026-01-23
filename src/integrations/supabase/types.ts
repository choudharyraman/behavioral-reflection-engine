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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      deviation_events: {
        Row: {
          acknowledged: boolean | null
          acknowledged_response: string | null
          baseline_amount: number
          category: string
          cooldown_until: string | null
          created_at: string
          current_amount: number
          deviation_percentage: number
          id: string
          narrative: string | null
          occurrence_count: number
          time_period: string
          user_id: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_response?: string | null
          baseline_amount: number
          category: string
          cooldown_until?: string | null
          created_at?: string
          current_amount: number
          deviation_percentage: number
          id?: string
          narrative?: string | null
          occurrence_count: number
          time_period: string
          user_id: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_response?: string | null
          baseline_amount?: number
          category?: string
          cooldown_until?: string | null
          created_at?: string
          current_amount?: number
          deviation_percentage?: number
          id?: string
          narrative?: string | null
          occurrence_count?: number
          time_period?: string
          user_id?: string
        }
        Relationships: []
      }
      emotion_tags: {
        Row: {
          created_at: string
          custom_note: string | null
          id: string
          tag: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_note?: string | null
          id?: string
          tag: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          custom_note?: string | null
          id?: string
          tag?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotion_tags_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          pattern_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          pattern_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          pattern_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "spending_patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      moment_stories: {
        Row: {
          created_at: string
          dismissed: boolean | null
          heatmap_data: Json | null
          id: string
          narrative: string
          pattern_type: string
          related_transactions: string[] | null
          title: string
          user_feedback: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          dismissed?: boolean | null
          heatmap_data?: Json | null
          id?: string
          narrative: string
          pattern_type: string
          related_transactions?: string[] | null
          title: string
          user_feedback?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          dismissed?: boolean | null
          heatmap_data?: Json | null
          id?: string
          narrative?: string
          pattern_type?: string
          related_transactions?: string[] | null
          title?: string
          user_feedback?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          dismissed: boolean | null
          id: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          dismissed?: boolean | null
          id?: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          dismissed?: boolean | null
          id?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          notification_preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      spending_baselines: {
        Row: {
          baseline_amount: number
          baseline_count: number
          calculated_at: string
          category: string
          id: string
          time_period: string
          user_id: string
        }
        Insert: {
          baseline_amount: number
          baseline_count?: number
          calculated_at?: string
          category: string
          id?: string
          time_period: string
          user_id: string
        }
        Update: {
          baseline_amount?: number
          baseline_count?: number
          calculated_at?: string
          category?: string
          id?: string
          time_period?: string
          user_id?: string
        }
        Relationships: []
      }
      spending_patterns: {
        Row: {
          average_amount: number | null
          category: string
          confidence: string
          description: string
          first_detected: string
          id: string
          last_updated: string
          occurrences: number
          time_range: string | null
          title: string
          trend: string | null
          user_id: string
        }
        Insert: {
          average_amount?: number | null
          category: string
          confidence?: string
          description: string
          first_detected?: string
          id?: string
          last_updated?: string
          occurrences?: number
          time_range?: string | null
          title: string
          trend?: string | null
          user_id: string
        }
        Update: {
          average_amount?: number | null
          category?: string
          confidence?: string
          description?: string
          first_detected?: string
          id?: string
          last_updated?: string
          occurrences?: number
          time_range?: string | null
          title?: string
          trend?: string | null
          user_id?: string
        }
        Relationships: []
      }
      spending_seasons: {
        Row: {
          category_changes: Json | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          label: string
          start_date: string
          user_id: string
        }
        Insert: {
          category_changes?: Json | null
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          label: string
          start_date: string
          user_id: string
        }
        Update: {
          category_changes?: Json | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          label?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          day_of_week: string
          id: string
          is_recurring: boolean | null
          merchant: string
          time_of_day: string
          timestamp: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          day_of_week: string
          id?: string
          is_recurring?: boolean | null
          merchant: string
          time_of_day: string
          timestamp?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          day_of_week?: string
          id?: string
          is_recurring?: boolean | null
          merchant?: string
          time_of_day?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_checkins: {
        Row: {
          category_changes: Json | null
          created_at: string
          id: string
          summary: string
          user_id: string
          user_note: string | null
          user_response: string | null
          week_start: string
        }
        Insert: {
          category_changes?: Json | null
          created_at?: string
          id?: string
          summary: string
          user_id: string
          user_note?: string | null
          user_response?: string | null
          week_start: string
        }
        Update: {
          category_changes?: Json | null
          created_at?: string
          id?: string
          summary?: string
          user_id?: string
          user_note?: string | null
          user_response?: string | null
          week_start?: string
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
