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
      location_photos: {
        Row: {
          created_at: string
          file_path: string
          id: string
          is_initial_inventory: boolean | null
          location: string
          sub_location: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          is_initial_inventory?: boolean | null
          location: string
          sub_location?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          is_initial_inventory?: boolean | null
          location?: string
          sub_location?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      manuals: {
        Row: {
          added_by: string | null
          created_at: string
          file_path: string
          id: string
          maintenance_schedule: Json | null
          make: string
          model: string
          summary: string | null
          updated_at: string
        }
        Insert: {
          added_by?: string | null
          created_at?: string
          file_path: string
          id?: string
          maintenance_schedule?: Json | null
          make: string
          model: string
          summary?: string | null
          updated_at?: string
        }
        Update: {
          added_by?: string | null
          created_at?: string
          file_path?: string
          id?: string
          maintenance_schedule?: Json | null
          make?: string
          model?: string
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          email_verified: boolean | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          email_verified?: boolean | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          email_verified?: boolean | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_materials: {
        Row: {
          cost: number
          created_at: string
          id: string
          name: string
          project_id: string | null
          quantity: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cost?: number
          created_at?: string
          id?: string
          name: string
          project_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cost?: number
          created_at?: string
          id?: string
          name?: string
          project_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_materials_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_photos: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          project_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          project_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          project_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_photos_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          materials_used: string[] | null
          project_id: string
          status: string
          title: string
          tools_used: string[] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          materials_used?: string[] | null
          project_id: string
          status?: string
          title: string
          tools_used?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          materials_used?: string[] | null
          project_id?: string
          status?: string
          title?: string
          tools_used?: string[] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tools: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          tool_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          tool_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          tool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_tools_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          status: string
          target_date: string | null
          total_cost: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          status: string
          target_date?: string | null
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          status?: string
          target_date?: string | null
          total_cost?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      temp_audio_files: {
        Row: {
          created_at: string | null
          expires_at: string
          file_path: string
          id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          file_path: string
          id?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          file_path?: string
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      temporary_annotations: {
        Row: {
          coordinates: Json
          created_at: string
          expires_at: string
          id: string
          location: string | null
          photo_id: string
          sub_location: string | null
          user_id: string | null
        }
        Insert: {
          coordinates: Json
          created_at?: string
          expires_at?: string
          id?: string
          location?: string | null
          photo_id: string
          sub_location?: string | null
          user_id?: string | null
        }
        Update: {
          coordinates?: Json
          created_at?: string
          expires_at?: string
          id?: string
          location?: string | null
          photo_id?: string
          sub_location?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "temporary_annotations_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "location_photos"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_annotations: {
        Row: {
          coordinates: Json
          created_at: string
          id: string
          moved: boolean | null
          photo_id: string
          tool_id: string | null
          tool_reference_id: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          coordinates: Json
          created_at?: string
          id?: string
          moved?: boolean | null
          photo_id: string
          tool_id?: string | null
          tool_reference_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          coordinates?: Json
          created_at?: string
          id?: string
          moved?: boolean | null
          photo_id?: string
          tool_id?: string | null
          tool_reference_id?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_annotations_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "location_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_annotations_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_annotations_tool_reference_id_fkey"
            columns: ["tool_reference_id"]
            isOneToOne: false
            referencedRelation: "tools_reference"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_maintenance_date: string | null
          loan_date: string | null
          loaned_to: string | null
          location: string
          maintenance_period_months: number | null
          manual_id: string | null
          name: string
          purchase_cost: number | null
          purchase_date: string | null
          status: string
          sub_location_a: string | null
          sub_location_b: string | null
          updated_at: string
          user_id: string | null
          warranty_file_path: string | null
          warranty_length: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_maintenance_date?: string | null
          loan_date?: string | null
          loaned_to?: string | null
          location: string
          maintenance_period_months?: number | null
          manual_id?: string | null
          name: string
          purchase_cost?: number | null
          purchase_date?: string | null
          status: string
          sub_location_a?: string | null
          sub_location_b?: string | null
          updated_at?: string
          user_id?: string | null
          warranty_file_path?: string | null
          warranty_length?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_maintenance_date?: string | null
          loan_date?: string | null
          loaned_to?: string | null
          location?: string
          maintenance_period_months?: number | null
          manual_id?: string | null
          name?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: string
          sub_location_a?: string | null
          sub_location_b?: string | null
          updated_at?: string
          user_id?: string | null
          warranty_file_path?: string | null
          warranty_length?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tools_manual_id_fkey"
            columns: ["manual_id"]
            isOneToOne: false
            referencedRelation: "manuals"
            referencedColumns: ["id"]
          },
        ]
      }
      tools_reference: {
        Row: {
          Category: string | null
          created_at: string
          id: number
          tool_name: string | null
        }
        Insert: {
          Category?: string | null
          created_at?: string
          id?: number
          tool_name?: string | null
        }
        Update: {
          Category?: string | null
          created_at?: string
          id?: number
          tool_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_audio_files: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_temporary_annotations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
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
