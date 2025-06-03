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
      contact_types: {
        Row: {
          created_at: string | null
          id: string
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          value?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          comments: string | null
          company: string
          created_at: string | null
          crew: string | null
          email: string
          id: string
          name: string
          phone: string
          shift: string | null
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          comments?: string | null
          company: string
          created_at?: string | null
          crew?: string | null
          email: string
          id?: string
          name: string
          phone: string
          shift?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          comments?: string | null
          company?: string
          created_at?: string | null
          crew?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          shift?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_items: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          location_id: string
          notes: string | null
          quantity: number
          red_tag_photo: string | null
          red_tag_reason: string | null
          status: string
          type_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id?: string | null
          location_id: string
          notes?: string | null
          quantity?: number
          red_tag_photo?: string | null
          red_tag_reason?: string | null
          status?: string
          type_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string | null
          location_id?: string
          notes?: string | null
          quantity?: number
          red_tag_photo?: string | null
          red_tag_reason?: string | null
          status?: string
          type_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_items_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_items_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_items_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_types: {
        Row: {
          category: string
          created_at: string
          default_id_prefix: string | null
          description: string | null
          id: string
          name: string
          requires_individual_tracking: boolean
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          default_id_prefix?: string | null
          description?: string | null
          id?: string
          name: string
          requires_individual_tracking?: boolean
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          default_id_prefix?: string | null
          description?: string | null
          id?: string
          name?: string
          requires_individual_tracking?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      individual_equipment: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          job_id: string | null
          location_id: string
          name: string
          notes: string | null
          purchase_date: string | null
          red_tag_photo: string | null
          red_tag_reason: string | null
          serial_number: string | null
          status: string
          type_id: string
          updated_at: string
          warranty_expiry: string | null
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          job_id?: string | null
          location_id: string
          name: string
          notes?: string | null
          purchase_date?: string | null
          red_tag_photo?: string | null
          red_tag_reason?: string | null
          serial_number?: string | null
          status?: string
          type_id: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          job_id?: string | null
          location_id?: string
          name?: string
          notes?: string | null
          purchase_date?: string | null
          red_tag_photo?: string | null
          red_tag_reason?: string | null
          serial_number?: string | null
          status?: string
          type_id?: string
          updated_at?: string
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "individual_equipment_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_equipment_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "storage_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "individual_equipment_type_id_fkey"
            columns: ["type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_computer_names: Json | null
          created_at: string
          edges: Json
          equipment_allocated: boolean | null
          equipment_assignment: Json | null
          has_wellside_gauge: boolean
          id: string
          main_box_name: string | null
          name: string
          nodes: Json
          satellite_name: string | null
          selected_cable_type: string | null
          updated_at: string
          well_count: number
          wellside_gauge_name: string | null
        }
        Insert: {
          company_computer_names?: Json | null
          created_at?: string
          edges?: Json
          equipment_allocated?: boolean | null
          equipment_assignment?: Json | null
          has_wellside_gauge?: boolean
          id?: string
          main_box_name?: string | null
          name: string
          nodes?: Json
          satellite_name?: string | null
          selected_cable_type?: string | null
          updated_at?: string
          well_count?: number
          wellside_gauge_name?: string | null
        }
        Update: {
          company_computer_names?: Json | null
          created_at?: string
          edges?: Json
          equipment_allocated?: boolean | null
          equipment_assignment?: Json | null
          has_wellside_gauge?: boolean
          id?: string
          main_box_name?: string | null
          name?: string
          nodes?: Json
          satellite_name?: string | null
          selected_cable_type?: string | null
          updated_at?: string
          well_count?: number
          wellside_gauge_name?: string | null
        }
        Relationships: []
      }
      json_storage: {
        Row: {
          content: Json
          created_at: string | null
          file_name: string
          id: string
          updated_at: string | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          file_name: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          file_name?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      storage_locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
