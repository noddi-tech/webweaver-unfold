export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      brand_settings: {
        Row: {
          created_at: string
          gradient_token: string
          id: string
          logo_icon_name: string | null
          logo_icon_position: string
          logo_icon_size: string
          logo_image_height: number
          logo_image_url: string | null
          logo_text: string | null
          logo_variant: string
          text_token: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          gradient_token?: string
          id?: string
          logo_icon_name?: string | null
          logo_icon_position?: string
          logo_icon_size?: string
          logo_image_height?: number
          logo_image_url?: string | null
          logo_text?: string | null
          logo_variant?: string
          text_token?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          gradient_token?: string
          id?: string
          logo_icon_name?: string | null
          logo_icon_position?: string
          logo_icon_size?: string
          logo_image_height?: number
          logo_image_url?: string | null
          logo_text?: string | null
          logo_variant?: string
          text_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          close_time: string | null
          closed: boolean
          created_at: string
          day_name: string
          id: string
          open_time: string | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          close_time?: string | null
          closed?: boolean
          created_at?: string
          day_name: string
          id?: string
          open_time?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          close_time?: string | null
          closed?: boolean
          created_at?: string
          day_name?: string
          id?: string
          open_time?: string | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_items: {
        Row: {
          active: boolean
          created_at: string
          icon_name: string
          id: string
          link_url: string | null
          sort_order: number | null
          title: string
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          icon_name?: string
          id?: string
          link_url?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean
          created_at?: string
          icon_name?: string
          id?: string
          link_url?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      contact_settings: {
        Row: {
          business_hours_title: string
          created_at: string
          form_description: string | null
          form_title: string
          get_in_touch_title: string
          id: string
          show_business_hours_tab: boolean
          show_contact_methods_tab: boolean
          updated_at: string
        }
        Insert: {
          business_hours_title?: string
          created_at?: string
          form_description?: string | null
          form_title?: string
          get_in_touch_title?: string
          id?: string
          show_business_hours_tab?: boolean
          show_contact_methods_tab?: boolean
          updated_at?: string
        }
        Update: {
          business_hours_title?: string
          created_at?: string
          form_description?: string | null
          form_title?: string
          get_in_touch_title?: string
          id?: string
          show_business_hours_tab?: boolean
          show_contact_methods_tab?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          active: boolean
          created_at: string
          email: string | null
          id: string
          image_object_position: string
          image_url: string | null
          linkedin_url: string | null
          name: string
          phone: string | null
          section: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          image_object_position?: string
          image_url?: string | null
          linkedin_url?: string | null
          name: string
          phone?: string | null
          section?: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string | null
          id?: string
          image_object_position?: string
          image_url?: string | null
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          section?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      employees_sections: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employees_settings: {
        Row: {
          background_token: string
          border_token: string
          card_bg_token: string
          created_at: string
          id: string
          link_token: string
          name_token: string
          section_subtitle: string | null
          section_title: string
          title_token: string
          updated_at: string
        }
        Insert: {
          background_token?: string
          border_token?: string
          card_bg_token?: string
          created_at?: string
          id?: string
          link_token?: string
          name_token?: string
          section_subtitle?: string | null
          section_title?: string
          title_token?: string
          updated_at?: string
        }
        Update: {
          background_token?: string
          border_token?: string
          card_bg_token?: string
          created_at?: string
          id?: string
          link_token?: string
          name_token?: string
          section_subtitle?: string | null
          section_title?: string
          title_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      features: {
        Row: {
          created_at: string
          description: string | null
          icon_name: string
          id: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      features_settings: {
        Row: {
          background_token: string
          border_token: string
          card_bg_token: string
          created_at: string
          description_token: string
          icon_token: string
          id: string
          section_subtitle: string | null
          section_title: string
          title_token: string
          updated_at: string
        }
        Insert: {
          background_token?: string
          border_token?: string
          card_bg_token?: string
          created_at?: string
          description_token?: string
          icon_token?: string
          id?: string
          section_subtitle?: string | null
          section_title?: string
          title_token?: string
          updated_at?: string
        }
        Update: {
          background_token?: string
          border_token?: string
          card_bg_token?: string
          created_at?: string
          description_token?: string
          icon_token?: string
          id?: string
          section_subtitle?: string | null
          section_title?: string
          title_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      headings: {
        Row: {
          active: boolean
          content: string
          created_at: string
          element_type: string
          id: string
          page_location: string
          section: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          content: string
          created_at?: string
          element_type: string
          id?: string
          page_location: string
          section: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: string
          created_at?: string
          element_type?: string
          id?: string
          page_location?: string
          section?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      image_sections: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          active: boolean
          alt: string | null
          caption: string | null
          created_at: string
          file_name: string
          file_url: string
          id: string
          link_url: string | null
          section: string
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt?: string | null
          caption?: string | null
          created_at?: string
          file_name: string
          file_url: string
          id?: string
          link_url?: string | null
          section: string
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt?: string | null
          caption?: string | null
          created_at?: string
          file_name?: string
          file_url?: string
          id?: string
          link_url?: string | null
          section?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      usps: {
        Row: {
          active: boolean
          bg_token: string
          created_at: string
          format: string
          href: string | null
          icon_name: string
          id: string
          location: string
          metric_align: string
          metric_description: string | null
          metric_emphasis: string
          metric_show_icon: boolean
          metric_style: string
          metric_suffix: string | null
          metric_value: string | null
          metric_value_size: string
          sort_order: number | null
          text_token: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          bg_token?: string
          created_at?: string
          format?: string
          href?: string | null
          icon_name?: string
          id?: string
          location?: string
          metric_align?: string
          metric_description?: string | null
          metric_emphasis?: string
          metric_show_icon?: boolean
          metric_style?: string
          metric_suffix?: string | null
          metric_value?: string | null
          metric_value_size?: string
          sort_order?: number | null
          text_token?: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          bg_token?: string
          created_at?: string
          format?: string
          href?: string | null
          icon_name?: string
          id?: string
          location?: string
          metric_align?: string
          metric_description?: string | null
          metric_emphasis?: string
          metric_show_icon?: boolean
          metric_style?: string
          metric_suffix?: string | null
          metric_value?: string | null
          metric_value_size?: string
          sort_order?: number | null
          text_token?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      video_sections: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          created_at: string
          description: string | null
          file_name: string
          file_url: string
          id: string
          section: string
          sort_order: number | null
          thumbnail_shape: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name: string
          file_url: string
          id?: string
          section: string
          sort_order?: number | null
          thumbnail_shape?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string
          file_url?: string
          id?: string
          section?: string
          sort_order?: number | null
          thumbnail_shape?: string
          thumbnail_url?: string | null
          title?: string
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
