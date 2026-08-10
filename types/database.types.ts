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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          core_values: string[] | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          image_path: string | null
          is_published: boolean
          tenant_id: string
          title: string
        }
        Insert: {
          core_values?: string[] | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          tenant_id: string
          title: string
        }
        Update: {
          core_values?: string[] | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "about_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_name: string
          sender_phone: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_name: string
          sender_phone?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_name?: string
          sender_phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_sections: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          is_published: boolean
          phone: string | null
          tenant_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_published?: boolean
          phone?: string | null
          tenant_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_published?: boolean
          phone?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_published: boolean
          order_index: number
          question: string
          tenant_id: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_published?: boolean
          order_index?: number
          question: string
          tenant_id: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_published?: boolean
          order_index?: number
          question?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faqs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_sections: {
        Row: {
          background_image_path: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          id: string
          is_published: boolean
          secondary_cta_link: string | null
          secondary_cta_text: string | null
          subtitle: string | null
          tenant_id: string
          title: string
          variant: string
        }
        Insert: {
          background_image_path?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          is_published?: boolean
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          subtitle?: string | null
          tenant_id: string
          title: string
          variant?: string
        }
        Update: {
          background_image_path?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          id?: string
          is_published?: boolean
          secondary_cta_link?: string | null
          secondary_cta_text?: string | null
          subtitle?: string | null
          tenant_id?: string
          title?: string
          variant?: string
        }
        Relationships: [
          {
            foreignKeyName: "hero_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      page_sections: {
        Row: {
          created_at: string
          id: string
          is_visible: boolean
          order_index: number
          section_key: string
          tenant_id: string
          variant: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_visible?: boolean
          order_index?: number
          section_key: string
          tenant_id: string
          variant?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_visible?: boolean
          order_index?: number
          section_key?: string
          tenant_id?: string
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image_path: string | null
          is_published: boolean
          live_url: string | null
          location: string | null
          order_index: number
          tenant_id: string
          title: string
          year: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          live_url?: string | null
          location?: string | null
          order_index?: number
          tenant_id: string
          title: string
          year?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          live_url?: string | null
          location?: string | null
          order_index?: number
          tenant_id?: string
          title?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_path: string | null
          is_published: boolean
          order_index: number
          tenant_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          order_index?: number
          tenant_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          order_index?: number
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          cta_button_link: string | null
          cta_button_text: string | null
          cta_description: string | null
          cta_title: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          logo_path: string | null
          primary_color: string | null
          secondary_color: string | null
          seo_description: string | null
          seo_title: string | null
          tenant_id: string
          theme_preset: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_title?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          tenant_id: string
          theme_preset?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          cta_button_link?: string | null
          cta_button_text?: string | null
          cta_description?: string | null
          cta_title?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_path?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          seo_description?: string | null
          seo_title?: string | null
          tenant_id?: string
          theme_preset?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stats: {
        Row: {
          created_at: string
          id: string
          is_published: boolean
          label: string
          order_index: number
          suffix: string | null
          tenant_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_published?: boolean
          label: string
          order_index?: number
          suffix?: string | null
          tenant_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          is_published?: boolean
          label?: string
          order_index?: number
          suffix?: string | null
          tenant_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          full_name: string
          id: string
          is_published: boolean
          order_index: number
          photo_path: string | null
          role: string
          tenant_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          full_name: string
          id?: string
          is_published?: boolean
          order_index?: number
          photo_path?: string | null
          role: string
          tenant_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          is_published?: boolean
          order_index?: number
          photo_path?: string | null
          role?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          contact_recipient_email: string | null
          created_at: string
          domain: string
          id: string
          is_platform_owner: boolean
          is_published: boolean
          name: string
          theme_mode: string
        }
        Insert: {
          contact_recipient_email?: string | null
          created_at?: string
          domain: string
          id?: string
          is_platform_owner?: boolean
          is_published?: boolean
          name: string
          theme_mode?: string
        }
        Update: {
          contact_recipient_email?: string | null
          created_at?: string
          domain?: string
          id?: string
          is_platform_owner?: boolean
          is_published?: boolean
          name?: string
          theme_mode?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_title: string | null
          created_at: string
          id: string
          is_published: boolean
          logo_path: string | null
          order_index: number
          quote: string
          rating: number | null
          tenant_id: string
        }
        Insert: {
          author_name: string
          author_title?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          logo_path?: string | null
          order_index?: number
          quote: string
          rating?: number | null
          tenant_id: string
        }
        Update: {
          author_name?: string
          author_title?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          logo_path?: string | null
          order_index?: number
          quote?: string
          rating?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
