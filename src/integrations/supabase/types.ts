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
      approval_requests: {
        Row: {
          approved_at: string | null
          approver_id: string | null
          comments: string | null
          created_at: string
          expense_id: string
          id: string
          rejected_at: string | null
          status: string
          submitted_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string
          expense_id: string
          id?: string
          rejected_at?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approver_id?: string | null
          comments?: string | null
          created_at?: string
          expense_id?: string
          id?: string
          rejected_at?: string | null
          status?: string
          submitted_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      equipment_history: {
        Row: {
          action: string
          created_at: string | null
          equipment_item_id: string | null
          from_location_id: string | null
          from_location_type: string | null
          id: string
          individual_equipment_id: string | null
          notes: string | null
          quantity: number | null
          to_location_id: string | null
          to_location_type: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          equipment_item_id?: string | null
          from_location_id?: string | null
          from_location_type?: string | null
          id?: string
          individual_equipment_id?: string | null
          notes?: string | null
          quantity?: number | null
          to_location_id?: string | null
          to_location_type?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          equipment_item_id?: string | null
          from_location_id?: string | null
          from_location_type?: string | null
          id?: string
          individual_equipment_id?: string | null
          notes?: string | null
          quantity?: number | null
          to_location_id?: string | null
          to_location_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_history_equipment_item_id_fkey"
            columns: ["equipment_item_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_history_individual_equipment_id_fkey"
            columns: ["individual_equipment_id"]
            isOneToOne: false
            referencedRelation: "individual_equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_items: {
        Row: {
          created_at: string
          id: string
          job_id: string | null
          location_id: string
          location_type: string | null
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
          location_type?: string | null
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
          location_type?: string | null
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
      equipment_transfers: {
        Row: {
          created_at: string | null
          equipment_type_id: string | null
          from_location_id: string
          from_location_type: string
          id: string
          individual_equipment_id: string | null
          quantity: number | null
          to_location_id: string
          to_location_type: string
          transfer_reason: string | null
          transferred_by: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_type_id?: string | null
          from_location_id: string
          from_location_type: string
          id?: string
          individual_equipment_id?: string | null
          quantity?: number | null
          to_location_id: string
          to_location_type: string
          transfer_reason?: string | null
          transferred_by?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_type_id?: string | null
          from_location_id?: string
          from_location_type?: string
          id?: string
          individual_equipment_id?: string | null
          quantity?: number | null
          to_location_id?: string
          to_location_type?: string
          transfer_reason?: string | null
          transferred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_transfers_equipment_type_id_fkey"
            columns: ["equipment_type_id"]
            isOneToOne: false
            referencedRelation: "equipment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_transfers_individual_equipment_id_fkey"
            columns: ["individual_equipment_id"]
            isOneToOne: false
            referencedRelation: "individual_equipment"
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
      expense_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          category: string
          confidence: Json | null
          created_at: string
          date: string
          description: string | null
          expense_type: string
          id: string
          is_manual: boolean | null
          merchant: string
          month_lock_type: string | null
          receipt_file_name: string | null
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          confidence?: Json | null
          created_at?: string
          date: string
          description?: string | null
          expense_type?: string
          id?: string
          is_manual?: boolean | null
          merchant: string
          month_lock_type?: string | null
          receipt_file_name?: string | null
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          confidence?: Json | null
          created_at?: string
          date?: string
          description?: string | null
          expense_type?: string
          id?: string
          is_manual?: boolean | null
          merchant?: string
          month_lock_type?: string | null
          receipt_file_name?: string | null
          total?: number
          updated_at?: string
          user_id?: string
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
          location_type: string | null
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
          location_type?: string | null
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
          location_type?: string | null
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
      job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          job_id: string
          photo_url: string
          section_label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id: string
          photo_url: string
          section_label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          job_id?: string
          photo_url?: string
          section_label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_computer_names: Json | null
          created_at: string
          edges: Json
          enhanced_config: Json | null
          equipment_allocated: boolean | null
          equipment_assignment: Json | null
          frac_baud_rate: string | null
          frac_com_port: string | null
          gauge_baud_rate: string | null
          gauge_com_port: string | null
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
          enhanced_config?: Json | null
          equipment_allocated?: boolean | null
          equipment_assignment?: Json | null
          frac_baud_rate?: string | null
          frac_com_port?: string | null
          gauge_baud_rate?: string | null
          gauge_com_port?: string | null
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
          enhanced_config?: Json | null
          equipment_allocated?: boolean | null
          equipment_assignment?: Json | null
          frac_baud_rate?: string | null
          frac_com_port?: string | null
          gauge_baud_rate?: string | null
          gauge_com_port?: string | null
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
      merchant_templates: {
        Row: {
          created_at: string
          default_category: string
          frequency: number
          id: string
          last_used: string
          location_patterns: string[] | null
          merchant_name: string
          typical_amounts: number[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_category: string
          frequency?: number
          id?: string
          last_used?: string
          location_patterns?: string[] | null
          merchant_name: string
          typical_amounts?: number[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_category?: string
          frequency?: number
          id?: string
          last_used?: string
          location_patterns?: string[] | null
          merchant_name?: string
          typical_amounts?: number[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mileage_entries: {
        Row: {
          created_at: string
          date: string
          end_location: string
          id: string
          miles: number
          notes: string | null
          purpose: string | null
          rate_per_mile: number
          start_location: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_location: string
          id?: string
          miles: number
          notes?: string | null
          purpose?: string | null
          rate_per_mile?: number
          start_location: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_location?: string
          id?: string
          miles?: number
          notes?: string | null
          purpose?: string | null
          rate_per_mile?: number
          start_location?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
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
      receipts: {
        Row: {
          created_at: string
          expense_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          storage_path: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          expense_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          expense_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receipts_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      red_tag_photos: {
        Row: {
          created_at: string | null
          description: string | null
          equipment_item_id: string | null
          id: string
          individual_equipment_id: string | null
          photo_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          equipment_item_id?: string | null
          id?: string
          individual_equipment_id?: string | null
          photo_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          equipment_item_id?: string | null
          id?: string
          individual_equipment_id?: string | null
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "red_tag_photos_equipment_item_id_fkey"
            columns: ["equipment_item_id"]
            isOneToOne: false
            referencedRelation: "equipment_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "red_tag_photos_individual_equipment_id_fkey"
            columns: ["individual_equipment_id"]
            isOneToOne: false
            referencedRelation: "individual_equipment"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          id: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
