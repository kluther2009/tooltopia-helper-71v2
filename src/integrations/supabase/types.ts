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
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          status: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tool_annotations: {
        Row: {
          coordinates: Json
          created_at: string
          id: string
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
          location: string
          name: string
          purchase_cost: number | null
          purchase_date: string | null
          receipt_file_path: string | null
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
          location: string
          name: string
          purchase_cost?: number | null
          purchase_date?: string | null
          receipt_file_path?: string | null
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
          location?: string
          name?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          receipt_file_path?: string | null
          status?: string
          sub_location_a?: string | null
          sub_location_b?: string | null
          updated_at?: string
          user_id?: string | null
          warranty_file_path?: string | null
          warranty_length?: number | null
        }
        Relationships: []
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
