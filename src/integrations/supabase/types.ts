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
      background_styles: {
        Row: {
          background_class: string
          created_at: string
          element_id: string
          id: string
          text_color_class: string | null
          updated_at: string
        }
        Insert: {
          background_class: string
          created_at?: string
          element_id: string
          id?: string
          text_color_class?: string | null
          updated_at?: string
        }
        Update: {
          background_class?: string
          created_at?: string
          element_id?: string
          id?: string
          text_color_class?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      carousel_configs: {
        Row: {
          autoplay: boolean
          autoplay_delay: number
          created_at: string
          description: string | null
          id: string
          images: Json
          name: string
          show_dots: boolean
          show_navigation: boolean
          updated_at: string
        }
        Insert: {
          autoplay?: boolean
          autoplay_delay?: number
          created_at?: string
          description?: string | null
          id?: string
          images?: Json
          name: string
          show_dots?: boolean
          show_navigation?: boolean
          updated_at?: string
        }
        Update: {
          autoplay?: boolean
          autoplay_delay?: number
          created_at?: string
          description?: string | null
          id?: string
          images?: Json
          name?: string
          show_dots?: boolean
          show_navigation?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      color_tokens: {
        Row: {
          active: boolean | null
          category: string | null
          color_type: string | null
          created_at: string
          css_var: string
          description: string | null
          id: string
          label: string | null
          optimal_text_color: string | null
          preview_class: string | null
          sort_order: number | null
          updated_at: string
          value: string
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          color_type?: string | null
          created_at?: string
          css_var: string
          description?: string | null
          id?: string
          label?: string | null
          optimal_text_color?: string | null
          preview_class?: string | null
          sort_order?: number | null
          updated_at?: string
          value: string
        }
        Update: {
          active?: boolean | null
          category?: string | null
          color_type?: string | null
          created_at?: string
          css_var?: string
          description?: string | null
          id?: string
          label?: string | null
          optimal_text_color?: string | null
          preview_class?: string | null
          sort_order?: number | null
          updated_at?: string
          value?: string
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
      content_hierarchies: {
        Row: {
          active: boolean
          content_id: string
          content_type: string
          created_at: string
          id: string
          page_id: string
          section_id: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          content_id: string
          content_type: string
          created_at?: string
          id?: string
          page_id: string
          section_id: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
          page_id?: string
          section_id?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_hierarchies_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_hierarchies_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
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
          section_id: string | null
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
          section_id?: string | null
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
          section_id?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
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
      evaluation_batches: {
        Row: {
          batch_number: number
          batch_size: number
          completed_at: string | null
          evaluated_count: number
          failed_count: number
          id: string
          language_code: string
          started_at: string
        }
        Insert: {
          batch_number: number
          batch_size?: number
          completed_at?: string | null
          evaluated_count?: number
          failed_count?: number
          id?: string
          language_code: string
          started_at?: string
        }
        Update: {
          batch_number?: number
          batch_size?: number
          completed_at?: string | null
          evaluated_count?: number
          failed_count?: number
          id?: string
          language_code?: string
          started_at?: string
        }
        Relationships: []
      }
      evaluation_progress: {
        Row: {
          batch_size: number | null
          completed_at: string | null
          current_batch: number | null
          error_count: number | null
          error_message: string | null
          evaluated_keys: number
          id: string
          language_code: string
          last_error: string | null
          last_evaluated_key: string | null
          started_at: string
          status: string
          total_keys: number
          updated_at: string
        }
        Insert: {
          batch_size?: number | null
          completed_at?: string | null
          current_batch?: number | null
          error_count?: number | null
          error_message?: string | null
          evaluated_keys?: number
          id?: string
          language_code: string
          last_error?: string | null
          last_evaluated_key?: string | null
          started_at?: string
          status?: string
          total_keys?: number
          updated_at?: string
        }
        Update: {
          batch_size?: number | null
          completed_at?: string | null
          current_batch?: number | null
          error_count?: number | null
          error_message?: string | null
          evaluated_keys?: number
          id?: string
          language_code?: string
          last_error?: string | null
          last_evaluated_key?: string | null
          started_at?: string
          status?: string
          total_keys?: number
          updated_at?: string
        }
        Relationships: []
      }
      faqs: {
        Row: {
          active: boolean
          answer: string
          created_at: string
          id: string
          question: string
          sort_order: number | null
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          answer: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          answer?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number | null
          type?: string
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
          section_id: string | null
          sort_order: number | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          section_id?: string | null
          sort_order?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon_name?: string
          id?: string
          section_id?: string | null
          sort_order?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "features_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
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
      footer_settings: {
        Row: {
          company_description: string | null
          company_name: string
          contact_info: Json
          copyright_text: string | null
          created_at: string
          id: string
          legal_links: Json
          quick_links: Json
          updated_at: string
        }
        Insert: {
          company_description?: string | null
          company_name?: string
          contact_info?: Json
          copyright_text?: string | null
          created_at?: string
          id?: string
          legal_links?: Json
          quick_links?: Json
          updated_at?: string
        }
        Update: {
          company_description?: string | null
          company_name?: string
          contact_info?: Json
          copyright_text?: string | null
          created_at?: string
          id?: string
          legal_links?: Json
          quick_links?: Json
          updated_at?: string
        }
        Relationships: []
      }
      header_settings: {
        Row: {
          created_at: string
          get_started_text: string
          id: string
          navigation_links: Json
          show_auth_buttons: boolean
          show_global_usp_bar: boolean
          sign_in_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          get_started_text?: string
          id?: string
          navigation_links?: Json
          show_auth_buttons?: boolean
          show_global_usp_bar?: boolean
          sign_in_text?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          get_started_text?: string
          id?: string
          navigation_links?: Json
          show_auth_buttons?: boolean
          show_global_usp_bar?: boolean
          sign_in_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      icon_styles: {
        Row: {
          background_token: string
          created_at: string | null
          element_id: string
          icon_color_token: string | null
          icon_name: string | null
          id: string
          shape: string | null
          size: string | null
          updated_at: string | null
        }
        Insert: {
          background_token?: string
          created_at?: string | null
          element_id: string
          icon_color_token?: string | null
          icon_name?: string | null
          id?: string
          shape?: string | null
          size?: string | null
          updated_at?: string | null
        }
        Update: {
          background_token?: string
          created_at?: string | null
          element_id?: string
          icon_color_token?: string | null
          icon_name?: string | null
          id?: string
          shape?: string | null
          size?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      image_carousel_settings: {
        Row: {
          aspect_ratio: string | null
          card_border_radius: string | null
          card_gap: string | null
          card_height: string | null
          card_width: string | null
          carousel_config_id: string | null
          created_at: string
          display_type: string
          fit_mode: string | null
          id: string
          image_alt: string | null
          image_url: string | null
          location_id: string
          saved_carousel_config_id: string | null
          saved_image_alt: string | null
          saved_image_url: string | null
          updated_at: string
        }
        Insert: {
          aspect_ratio?: string | null
          card_border_radius?: string | null
          card_gap?: string | null
          card_height?: string | null
          card_width?: string | null
          carousel_config_id?: string | null
          created_at?: string
          display_type?: string
          fit_mode?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          location_id: string
          saved_carousel_config_id?: string | null
          saved_image_alt?: string | null
          saved_image_url?: string | null
          updated_at?: string
        }
        Update: {
          aspect_ratio?: string | null
          card_border_radius?: string | null
          card_gap?: string | null
          card_height?: string | null
          card_width?: string | null
          carousel_config_id?: string | null
          created_at?: string
          display_type?: string
          fit_mode?: string | null
          id?: string
          image_alt?: string | null
          image_url?: string | null
          location_id?: string
          saved_carousel_config_id?: string | null
          saved_image_alt?: string | null
          saved_image_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_carousel_settings_carousel_config_id_fkey"
            columns: ["carousel_config_id"]
            isOneToOne: false
            referencedRelation: "carousel_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_carousel_settings_saved_carousel_config_id_fkey"
            columns: ["saved_carousel_config_id"]
            isOneToOne: false
            referencedRelation: "carousel_configs"
            referencedColumns: ["id"]
          },
        ]
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
          caption_color_token: string | null
          caption_position: string
          created_at: string
          file_name: string
          file_url: string
          id: string
          link_url: string | null
          section: string | null
          section_id: string | null
          sort_order: number | null
          title: string
          title_color_token: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          alt?: string | null
          caption?: string | null
          caption_color_token?: string | null
          caption_position?: string
          created_at?: string
          file_name: string
          file_url: string
          id?: string
          link_url?: string | null
          section?: string | null
          section_id?: string | null
          sort_order?: number | null
          title: string
          title_color_token?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          alt?: string | null
          caption?: string | null
          caption_color_token?: string | null
          caption_position?: string
          created_at?: string
          file_name?: string
          file_url?: string
          id?: string
          link_url?: string | null
          section?: string | null
          section_id?: string | null
          sort_order?: number | null
          title?: string
          title_color_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "images_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      language_settings: {
        Row: {
          created_at: string
          default_language_code: string
          enable_browser_detection: boolean
          fallback_language_code: string
          id: string
          show_language_switcher_footer: boolean
          show_language_switcher_header: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_language_code?: string
          enable_browser_detection?: boolean
          fallback_language_code?: string
          id?: string
          show_language_switcher_footer?: boolean
          show_language_switcher_header?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_language_code?: string
          enable_browser_detection?: boolean
          fallback_language_code?: string
          id?: string
          show_language_switcher_footer?: boolean
          show_language_switcher_header?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "language_settings_default_language_code_fkey"
            columns: ["default_language_code"]
            isOneToOne: false
            referencedRelation: "language_translation_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_default_language_code_fkey"
            columns: ["default_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_default_language_code_fkey"
            columns: ["default_language_code"]
            isOneToOne: false
            referencedRelation: "page_meta_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_default_language_code_fkey"
            columns: ["default_language_code"]
            isOneToOne: false
            referencedRelation: "translation_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_fallback_language_code_fkey"
            columns: ["fallback_language_code"]
            isOneToOne: false
            referencedRelation: "language_translation_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_fallback_language_code_fkey"
            columns: ["fallback_language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_fallback_language_code_fkey"
            columns: ["fallback_language_code"]
            isOneToOne: false
            referencedRelation: "page_meta_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "language_settings_fallback_language_code_fkey"
            columns: ["fallback_language_code"]
            isOneToOne: false
            referencedRelation: "translation_stats"
            referencedColumns: ["code"]
          },
        ]
      }
      languages: {
        Row: {
          code: string
          created_at: string
          enabled: boolean
          flag_code: string
          id: string
          is_default: boolean
          name: string
          native_name: string
          rtl: boolean
          show_in_switcher: boolean
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          enabled?: boolean
          flag_code: string
          id?: string
          is_default?: boolean
          name: string
          native_name: string
          rtl?: boolean
          show_in_switcher?: boolean
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          enabled?: boolean
          flag_code?: string
          id?: string
          is_default?: boolean
          name?: string
          native_name?: string
          rtl?: boolean
          show_in_switcher?: boolean
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      page_meta_translations: {
        Row: {
          canonical_url: string | null
          created_at: string
          id: string
          language_code: string
          meta_description: string | null
          meta_keywords: string | null
          meta_title: string
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          page_slug: string
          quality_score: number | null
          review_status: string | null
          twitter_description: string | null
          twitter_image_url: string | null
          twitter_title: string | null
          updated_at: string
        }
        Insert: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          language_code: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug: string
          quality_score?: number | null
          review_status?: string | null
          twitter_description?: string | null
          twitter_image_url?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Update: {
          canonical_url?: string | null
          created_at?: string
          id?: string
          language_code?: string
          meta_description?: string | null
          meta_keywords?: string | null
          meta_title?: string
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          page_slug?: string
          quality_score?: number | null
          review_status?: string | null
          twitter_description?: string | null
          twitter_image_url?: string | null
          twitter_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          active: boolean
          brand_id: string | null
          container_width: string
          created_at: string
          default_background_token: string
          default_margin_token: string
          default_max_width_token: string
          default_padding_token: string
          default_text_token: string
          footer_id: string | null
          header_id: string | null
          id: string
          layout_type: string
          meta_description: string | null
          meta_keywords: string | null
          name: string
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          brand_id?: string | null
          container_width?: string
          created_at?: string
          default_background_token?: string
          default_margin_token?: string
          default_max_width_token?: string
          default_padding_token?: string
          default_text_token?: string
          footer_id?: string | null
          header_id?: string | null
          id?: string
          layout_type?: string
          meta_description?: string | null
          meta_keywords?: string | null
          name: string
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          brand_id?: string | null
          container_width?: string
          created_at?: string
          default_background_token?: string
          default_margin_token?: string
          default_max_width_token?: string
          default_padding_token?: string
          default_text_token?: string
          footer_id?: string | null
          header_id?: string | null
          id?: string
          layout_type?: string
          meta_description?: string | null
          meta_keywords?: string | null
          name?: string
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          active: boolean
          created_at: string
          cta_text: string
          cta_url: string | null
          description: string | null
          features: Json
          id: string
          name: string
          period: string | null
          popular: boolean
          price: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          features?: Json
          id?: string
          name: string
          period?: string | null
          popular?: boolean
          price: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          cta_text?: string
          cta_url?: string | null
          description?: string | null
          features?: Json
          id?: string
          name?: string
          period?: string | null
          popular?: boolean
          price?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      sections: {
        Row: {
          active: boolean
          background_token: string
          background_token_override: string | null
          created_at: string
          display_name: string
          id: string
          inherit_page_defaults: boolean
          margin_token: string
          margin_token_override: string | null
          max_width_token: string
          max_width_token_override: string | null
          name: string
          padding_token: string
          padding_token_override: string | null
          page_id: string | null
          page_location: string
          position_after: string | null
          position_before: string | null
          sort_order: number | null
          text_token: string
          text_token_override: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          background_token?: string
          background_token_override?: string | null
          created_at?: string
          display_name: string
          id?: string
          inherit_page_defaults?: boolean
          margin_token?: string
          margin_token_override?: string | null
          max_width_token?: string
          max_width_token_override?: string | null
          name: string
          padding_token?: string
          padding_token_override?: string | null
          page_id?: string | null
          page_location?: string
          position_after?: string | null
          position_before?: string | null
          sort_order?: number | null
          text_token?: string
          text_token_override?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          background_token?: string
          background_token_override?: string | null
          created_at?: string
          display_name?: string
          id?: string
          inherit_page_defaults?: boolean
          margin_token?: string
          margin_token_override?: string | null
          max_width_token?: string
          max_width_token_override?: string | null
          name?: string
          padding_token?: string
          padding_token_override?: string | null
          page_id?: string | null
          page_location?: string
          position_after?: string | null
          position_before?: string | null
          sort_order?: number | null
          text_token?: string
          text_token_override?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      solutions: {
        Row: {
          active: boolean
          benefits: Json | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          description: string | null
          description_heading: string | null
          description_text: string | null
          footer_cta_text: string | null
          footer_cta_url: string | null
          footer_heading: string | null
          footer_text: string | null
          hero_cta_text: string | null
          hero_cta_url: string | null
          hero_description: string | null
          hero_image_url: string | null
          hero_subtitle: string | null
          hero_title: string | null
          icon_name: string
          id: string
          image_url: string | null
          key_benefits: Json | null
          slug: string
          sort_order: number | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefits?: Json | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          description_heading?: string | null
          description_text?: string | null
          footer_cta_text?: string | null
          footer_cta_url?: string | null
          footer_heading?: string | null
          footer_text?: string | null
          hero_cta_text?: string | null
          hero_cta_url?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          icon_name?: string
          id?: string
          image_url?: string | null
          key_benefits?: Json | null
          slug: string
          sort_order?: number | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefits?: Json | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          description_heading?: string | null
          description_text?: string | null
          footer_cta_text?: string | null
          footer_cta_url?: string | null
          footer_heading?: string | null
          footer_text?: string | null
          hero_cta_text?: string | null
          hero_cta_url?: string | null
          hero_description?: string | null
          hero_image_url?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          icon_name?: string
          id?: string
          image_url?: string | null
          key_benefits?: Json | null
          slug?: string
          sort_order?: number | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      solutions_settings: {
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
          subtitle_token: string
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
          subtitle_token?: string
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
          subtitle_token?: string
          title_token?: string
          updated_at?: string
        }
        Relationships: []
      }
      static_files: {
        Row: {
          content: string
          created_at: string
          description: string | null
          file_path: string
          id: string
          mime_type: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          mime_type?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          mime_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      text_content: {
        Row: {
          active: boolean
          color_token: string | null
          content: string
          content_type: string | null
          created_at: string
          element_id: string | null
          element_type: string
          id: string
          page_location: string
          section: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          color_token?: string | null
          content: string
          content_type?: string | null
          created_at?: string
          element_id?: string | null
          element_type: string
          id?: string
          page_location: string
          section: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          color_token?: string | null
          content?: string
          content_type?: string | null
          created_at?: string
          element_id?: string | null
          element_type?: string
          id?: string
          page_location?: string
          section?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      translations: {
        Row: {
          ai_reviewed_at: string | null
          approved: boolean
          approved_at: string | null
          approved_by: string | null
          context: string | null
          created_at: string
          id: string
          language_code: string
          page_location: string | null
          quality_metrics: Json | null
          quality_score: number | null
          review_status: string | null
          translated_text: string
          translation_key: string
          updated_at: string
        }
        Insert: {
          ai_reviewed_at?: string | null
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          context?: string | null
          created_at?: string
          id?: string
          language_code: string
          page_location?: string | null
          quality_metrics?: Json | null
          quality_score?: number | null
          review_status?: string | null
          translated_text: string
          translation_key: string
          updated_at?: string
        }
        Update: {
          ai_reviewed_at?: string | null
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          context?: string | null
          created_at?: string
          id?: string
          language_code?: string
          page_location?: string | null
          quality_metrics?: Json | null
          quality_score?: number | null
          review_status?: string | null
          translated_text?: string
          translation_key?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "language_translation_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "languages"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "page_meta_stats"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "translations_language_code_fkey"
            columns: ["language_code"]
            isOneToOne: false
            referencedRelation: "translation_stats"
            referencedColumns: ["code"]
          },
        ]
      }
      typography_settings: {
        Row: {
          created_at: string | null
          fallback_fonts: string[] | null
          font_family_name: string
          font_files: Json | null
          font_google_url: string | null
          font_source: string
          id: string
          is_active: boolean | null
          mono_fallback_fonts: string[] | null
          mono_font_family_name: string | null
          mono_font_files: Json | null
          mono_font_google_url: string | null
          mono_font_source: string | null
          typography_scale: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          fallback_fonts?: string[] | null
          font_family_name?: string
          font_files?: Json | null
          font_google_url?: string | null
          font_source?: string
          id?: string
          is_active?: boolean | null
          mono_fallback_fonts?: string[] | null
          mono_font_family_name?: string | null
          mono_font_files?: Json | null
          mono_font_google_url?: string | null
          mono_font_source?: string | null
          typography_scale?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          fallback_fonts?: string[] | null
          font_family_name?: string
          font_files?: Json | null
          font_google_url?: string | null
          font_source?: string
          id?: string
          is_active?: boolean | null
          mono_fallback_fonts?: string[] | null
          mono_font_family_name?: string | null
          mono_font_files?: Json | null
          mono_font_google_url?: string | null
          mono_font_source?: string | null
          typography_scale?: Json | null
          updated_at?: string | null
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
          section_id: string | null
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
          section_id?: string | null
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
          section_id?: string | null
          sort_order?: number | null
          text_token?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usps_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
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
      employees_public: {
        Row: {
          active: boolean | null
          created_at: string | null
          id: string | null
          image_object_position: string | null
          image_url: string | null
          name: string | null
          section: string | null
          section_id: string | null
          sort_order: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          id?: string | null
          image_object_position?: string | null
          image_url?: string | null
          name?: string | null
          section?: string | null
          section_id?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          id?: string | null
          image_object_position?: string | null
          image_url?: string | null
          name?: string | null
          section?: string | null
          section_id?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      language_translation_stats: {
        Row: {
          approval_percentage: number | null
          approved_translations: number | null
          avg_quality_score: number | null
          code: string | null
          enabled: boolean | null
          high_quality_count: number | null
          low_quality_count: number | null
          medium_quality_count: number | null
          name: string | null
          needs_review_count: number | null
          sort_order: number | null
          total_translations: number | null
        }
        Relationships: []
      }
      page_meta_stats: {
        Row: {
          approved_count: number | null
          avg_quality_score: number | null
          code: string | null
          completed_entries: number | null
          enabled: boolean | null
          missing_entries: number | null
          name: string | null
          needs_review_count: number | null
          sort_order: number | null
          total_pages: number | null
        }
        Relationships: []
      }
      translation_stats: {
        Row: {
          approval_percentage: number | null
          approved_translations: number | null
          avg_quality_score: number | null
          code: string | null
          enabled: boolean | null
          high_quality_count: number | null
          low_quality_count: number | null
          medium_quality_count: number | null
          name: string | null
          needs_review_count: number | null
          sort_order: number | null
          total_translations: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_slug: { Args: { text_input: string }; Returns: string }
      refresh_language_translation_stats: { Args: never; Returns: undefined }
      sync_language_visibility: { Args: never; Returns: undefined }
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
