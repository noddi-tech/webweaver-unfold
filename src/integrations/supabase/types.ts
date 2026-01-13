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
      application_activity_log: {
        Row: {
          action: string
          actor_id: string | null
          application_id: string
          created_at: string | null
          id: string
          new_value: string | null
          old_value: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          application_id: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          application_id?: string
          created_at?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_activity_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_messages: {
        Row: {
          application_id: string
          body: string
          created_at: string
          id: string
          is_read: boolean
          sender_email: string
          sender_name: string
          sender_type: string
          subject: string | null
        }
        Insert: {
          application_id: string
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_email: string
          sender_name: string
          sender_type: string
          subject?: string | null
        }
        Update: {
          application_id?: string
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_email?: string
          sender_name?: string
          sender_type?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_messages_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      background_styles: {
        Row: {
          background_class: string
          created_at: string
          element_id: string
          id: string
          shadow_class: string | null
          text_color_class: string | null
          updated_at: string
        }
        Insert: {
          background_class: string
          created_at?: string
          element_id: string
          id?: string
          shadow_class?: string | null
          text_color_class?: string | null
          updated_at?: string
        }
        Update: {
          background_class?: string
          created_at?: string
          element_id?: string
          id?: string
          shadow_class?: string | null
          text_color_class?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          post_count: number | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          post_count?: number | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          post_count?: number | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          active: boolean
          author_avatar_url: string | null
          author_employee_id: string | null
          author_name: string | null
          author_title: string | null
          canonical_url: string | null
          category: string | null
          category_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image_url: string | null
          og_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          sort_order: number | null
          status: string | null
          tags: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          author_avatar_url?: string | null
          author_employee_id?: string | null
          author_name?: string | null
          author_title?: string | null
          canonical_url?: string | null
          category?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          sort_order?: number | null
          status?: string | null
          tags?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          author_avatar_url?: string | null
          author_employee_id?: string | null
          author_name?: string | null
          author_title?: string | null
          canonical_url?: string | null
          category?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image_url?: string | null
          og_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          sort_order?: number | null
          status?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_employee_id_fkey"
            columns: ["author_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_employee_id_fkey"
            columns: ["author_employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_employee_id_fkey"
            columns: ["author_employee_id"]
            isOneToOne: false
            referencedRelation: "public_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          post_count: number | null
          slug: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          post_count?: number | null
          slug: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          post_count?: number | null
          slug?: string
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
      candidate_evaluations: {
        Row: {
          application_id: string
          concerns: string | null
          created_at: string
          evaluator_id: string | null
          evaluator_name: string
          id: string
          notes: string | null
          overall_recommendation: string | null
          strengths: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          application_id: string
          concerns?: string | null
          created_at?: string
          evaluator_id?: string | null
          evaluator_name: string
          id?: string
          notes?: string | null
          overall_recommendation?: string | null
          strengths?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          application_id?: string
          concerns?: string | null
          created_at?: string
          evaluator_id?: string | null
          evaluator_name?: string
          id?: string
          notes?: string | null
          overall_recommendation?: string | null
          strengths?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_evaluations_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      card_style_presets: {
        Row: {
          background_class: string
          border_radius: string | null
          created_at: string | null
          description: string | null
          icon_color_token: string | null
          icon_size: string | null
          id: string
          is_system_preset: boolean | null
          name: string
          shadow_class: string | null
          text_color_class: string
          updated_at: string | null
        }
        Insert: {
          background_class: string
          border_radius?: string | null
          created_at?: string | null
          description?: string | null
          icon_color_token?: string | null
          icon_size?: string | null
          id?: string
          is_system_preset?: boolean | null
          name: string
          shadow_class?: string | null
          text_color_class?: string
          updated_at?: string | null
        }
        Update: {
          background_class?: string
          border_radius?: string | null
          created_at?: string | null
          description?: string | null
          icon_color_token?: string | null
          icon_size?: string | null
          id?: string
          is_system_preset?: boolean | null
          name?: string
          shadow_class?: string | null
          text_color_class?: string
          updated_at?: string | null
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
      customer_stories: {
        Row: {
          about_company: string | null
          active: boolean
          company_logo_url: string | null
          company_name: string
          created_at: string
          final_cta_button_text: string | null
          final_cta_button_url: string | null
          final_cta_description: string | null
          final_cta_heading: string | null
          hero_image_url: string | null
          id: string
          impact_statement: string | null
          product_screenshot_url: string | null
          quote_author: string | null
          quote_author_title: string | null
          quote_text: string | null
          results: Json | null
          slug: string
          sort_order: number | null
          title: string
          updated_at: string
          use_case: string | null
        }
        Insert: {
          about_company?: string | null
          active?: boolean
          company_logo_url?: string | null
          company_name: string
          created_at?: string
          final_cta_button_text?: string | null
          final_cta_button_url?: string | null
          final_cta_description?: string | null
          final_cta_heading?: string | null
          hero_image_url?: string | null
          id?: string
          impact_statement?: string | null
          product_screenshot_url?: string | null
          quote_author?: string | null
          quote_author_title?: string | null
          quote_text?: string | null
          results?: Json | null
          slug: string
          sort_order?: number | null
          title: string
          updated_at?: string
          use_case?: string | null
        }
        Update: {
          about_company?: string | null
          active?: boolean
          company_logo_url?: string | null
          company_name?: string
          created_at?: string
          final_cta_button_text?: string | null
          final_cta_button_url?: string | null
          final_cta_description?: string | null
          final_cta_heading?: string | null
          hero_image_url?: string | null
          id?: string
          impact_statement?: string | null
          product_screenshot_url?: string | null
          quote_author?: string | null
          quote_author_title?: string | null
          quote_text?: string | null
          results?: Json | null
          slug?: string
          sort_order?: number | null
          title?: string
          updated_at?: string
          use_case?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          button_text: string | null
          button_url: string | null
          created_at: string | null
          description: string | null
          emoji: string | null
          header_bg_end: string | null
          header_bg_start: string | null
          heading: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_key: string
          updated_at: string | null
        }
        Insert: {
          body_html: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          header_bg_end?: string | null
          header_bg_start?: string | null
          heading: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_key: string
          updated_at?: string | null
        }
        Update: {
          body_html?: string
          button_text?: string | null
          button_url?: string | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          header_bg_end?: string | null
          header_bg_start?: string | null
          heading?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_key?: string
          updated_at?: string | null
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
      evaluation_criteria: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          max_score: number | null
          name: string
          sort_order: number | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          name: string
          sort_order?: number | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          max_score?: number | null
          name?: string
          sort_order?: number | null
          updated_at?: string
          weight?: number | null
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
      evaluation_scores: {
        Row: {
          comment: string | null
          created_at: string
          criteria_id: string
          evaluation_id: string
          id: string
          score: number
        }
        Insert: {
          comment?: string | null
          created_at?: string
          criteria_id: string
          evaluation_id: string
          id?: string
          score: number
        }
        Update: {
          comment?: string | null
          created_at?: string
          criteria_id?: string
          evaluation_id?: string
          id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_scores_criteria_id_fkey"
            columns: ["criteria_id"]
            isOneToOne: false
            referencedRelation: "evaluation_criteria"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluation_scores_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "candidate_evaluations"
            referencedColumns: ["id"]
          },
        ]
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
          show_sign_in_button: boolean | null
          show_sign_up_button: boolean | null
          sign_in_text: string
          sign_in_url: string | null
          sign_up_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          get_started_text?: string
          id?: string
          navigation_links?: Json
          show_auth_buttons?: boolean
          show_global_usp_bar?: boolean
          show_sign_in_button?: boolean | null
          show_sign_up_button?: boolean | null
          sign_in_text?: string
          sign_in_url?: string | null
          sign_up_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          get_started_text?: string
          id?: string
          navigation_links?: Json
          show_auth_buttons?: boolean
          show_global_usp_bar?: boolean
          show_sign_in_button?: boolean | null
          show_sign_up_button?: boolean | null
          sign_in_text?: string
          sign_in_url?: string | null
          sign_up_url?: string | null
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
          object_position: string | null
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
          object_position?: string | null
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
          object_position?: string | null
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
      interview_reminders: {
        Row: {
          created_at: string | null
          id: string
          interview_id: string | null
          interviewer_email: string
          interviewer_id: string | null
          interviewer_name: string | null
          reminder_type: string
          scheduled_for: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          interview_id?: string | null
          interviewer_email: string
          interviewer_id?: string | null
          interviewer_name?: string | null
          reminder_type?: string
          scheduled_for: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          interview_id?: string | null
          interviewer_email?: string
          interviewer_id?: string | null
          interviewer_name?: string | null
          reminder_type?: string
          scheduled_for?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interview_reminders_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_slots: {
        Row: {
          booked_by_application_id: string | null
          booking_token: string | null
          booking_token_expires_at: string | null
          created_at: string
          duration_minutes: number
          end_time: string
          id: string
          interview_type: string
          interviewer_email: string | null
          interviewer_id: string | null
          interviewer_name: string
          is_available: boolean
          job_id: string | null
          location: string | null
          meeting_url: string | null
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          booked_by_application_id?: string | null
          booking_token?: string | null
          booking_token_expires_at?: string | null
          created_at?: string
          duration_minutes?: number
          end_time: string
          id?: string
          interview_type?: string
          interviewer_email?: string | null
          interviewer_id?: string | null
          interviewer_name: string
          is_available?: boolean
          job_id?: string | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          booked_by_application_id?: string | null
          booking_token?: string | null
          booking_token_expires_at?: string | null
          created_at?: string
          duration_minutes?: number
          end_time?: string
          id?: string
          interview_type?: string
          interviewer_email?: string | null
          interviewer_id?: string | null
          interviewer_name?: string
          is_available?: boolean
          job_id?: string | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_slots_booked_by_application_id_fkey"
            columns: ["booked_by_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_slots_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string
          calendar_event_id: string | null
          candidate_notified: boolean | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_type: string
          interviewer_ids: string[] | null
          interviewer_names: string[] | null
          location: string | null
          meeting_url: string | null
          notes: string | null
          reminder_sent: boolean | null
          scheduled_at: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_id: string
          calendar_event_id?: string | null
          candidate_notified?: boolean | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string
          interviewer_ids?: string[] | null
          interviewer_names?: string[] | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          reminder_sent?: boolean | null
          scheduled_at: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_id?: string
          calendar_event_id?: string | null
          candidate_notified?: boolean | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_type?: string
          interviewer_ids?: string[] | null
          interviewer_names?: string[] | null
          location?: string | null
          meeting_url?: string | null
          notes?: string | null
          reminder_sent?: boolean | null
          scheduled_at?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string | null
          cover_letter: string | null
          created_at: string | null
          id: string
          internal_notes: string | null
          job_id: string
          linkedin_url: string | null
          portfolio_url: string | null
          referrer_email: string | null
          resume_url: string | null
          source: string | null
          source_detail: string | null
          status: string | null
          status_updated_at: string | null
          updated_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_phone?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          job_id: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          referrer_email?: string | null
          resume_url?: string | null
          source?: string | null
          source_detail?: string | null
          status?: string | null
          status_updated_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string | null
          cover_letter?: string | null
          created_at?: string | null
          id?: string
          internal_notes?: string | null
          job_id?: string
          linkedin_url?: string | null
          portfolio_url?: string | null
          referrer_email?: string | null
          resume_url?: string | null
          source?: string | null
          source_detail?: string | null
          status?: string | null
          status_updated_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_listings: {
        Row: {
          active: boolean | null
          application_email: string | null
          application_url: string | null
          benefits: string | null
          company_intro: string | null
          created_at: string
          department: string | null
          description: string | null
          employment_type: string | null
          expires_at: string | null
          featured: boolean | null
          id: string
          location: string | null
          posted_at: string | null
          requirements: string | null
          salary_range: string | null
          slug: string
          sort_order: number | null
          tech_stack: Json | null
          title: string
          updated_at: string
          work_assignments: Json | null
        }
        Insert: {
          active?: boolean | null
          application_email?: string | null
          application_url?: string | null
          benefits?: string | null
          company_intro?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          expires_at?: string | null
          featured?: boolean | null
          id?: string
          location?: string | null
          posted_at?: string | null
          requirements?: string | null
          salary_range?: string | null
          slug: string
          sort_order?: number | null
          tech_stack?: Json | null
          title: string
          updated_at?: string
          work_assignments?: Json | null
        }
        Update: {
          active?: boolean | null
          application_email?: string | null
          application_url?: string | null
          benefits?: string | null
          company_intro?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          employment_type?: string | null
          expires_at?: string | null
          featured?: boolean | null
          id?: string
          location?: string | null
          posted_at?: string | null
          requirements?: string | null
          salary_range?: string | null
          slug?: string
          sort_order?: number | null
          tech_stack?: Json | null
          title?: string
          updated_at?: string
          work_assignments?: Json | null
        }
        Relationships: []
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
      lead_activities: {
        Row: {
          activity_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          lead_id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          lead_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          company_name: string
          contact_name: string | null
          created_at: string
          created_by: string | null
          email: string | null
          estimated_locations: number | null
          estimated_revenue: number | null
          id: string
          industry: string | null
          last_contacted_at: string | null
          next_follow_up_at: string | null
          notes: string | null
          phone: string | null
          source: string | null
          source_detail: string | null
          status: string
          updated_at: string
          website: string | null
        }
        Insert: {
          assigned_to?: string | null
          company_name: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          estimated_locations?: number | null
          estimated_revenue?: number | null
          id?: string
          industry?: string | null
          last_contacted_at?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          source_detail?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          assigned_to?: string | null
          company_name?: string
          contact_name?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          estimated_locations?: number | null
          estimated_revenue?: number | null
          id?: string
          industry?: string | null
          last_contacted_at?: string | null
          next_follow_up_at?: string | null
          notes?: string | null
          phone?: string | null
          source?: string | null
          source_detail?: string | null
          status?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed: boolean | null
          created_at: string
          email: string
          id: string
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          email: string
          id?: string
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          email?: string
          id?: string
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
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
      press_mentions: {
        Row: {
          active: boolean
          article_url: string
          category: string
          created_at: string
          excerpt: string | null
          featured: boolean
          id: string
          published_at: string | null
          sort_order: number | null
          source_logo_url: string | null
          source_name: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          article_url: string
          category?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          sort_order?: number | null
          source_logo_url?: string | null
          source_name: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          article_url?: string
          category?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          id?: string
          published_at?: string | null
          sort_order?: number | null
          source_logo_url?: string | null
          source_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pricing_offers: {
        Row: {
          annual_revenue: number | null
          created_at: string
          created_by: string | null
          currency: string | null
          customer_company: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          discount_percentage: number | null
          discount_reason: string | null
          expires_at: string | null
          fixed_monthly: number
          id: string
          internal_notes: string | null
          lead_id: string | null
          locations: number | null
          notes: string | null
          offer_token: string | null
          per_location_cost: number | null
          revenue_percentage: number
          sent_at: string | null
          status: string
          tier: string
          total_monthly_estimate: number | null
          total_yearly_estimate: number | null
          updated_at: string
          viewed_at: string | null
        }
        Insert: {
          annual_revenue?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_company?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          discount_percentage?: number | null
          discount_reason?: string | null
          expires_at?: string | null
          fixed_monthly: number
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          locations?: number | null
          notes?: string | null
          offer_token?: string | null
          per_location_cost?: number | null
          revenue_percentage: number
          sent_at?: string | null
          status?: string
          tier: string
          total_monthly_estimate?: number | null
          total_yearly_estimate?: number | null
          updated_at?: string
          viewed_at?: string | null
        }
        Update: {
          annual_revenue?: number | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          customer_company?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          discount_percentage?: number | null
          discount_reason?: string | null
          expires_at?: string | null
          fixed_monthly?: number
          id?: string
          internal_notes?: string | null
          lead_id?: string | null
          locations?: number | null
          notes?: string | null
          offer_token?: string | null
          per_location_cost?: number | null
          revenue_percentage?: number
          sent_at?: string | null
          status?: string
          tier?: string
          total_monthly_estimate?: number | null
          total_yearly_estimate?: number | null
          updated_at?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_offers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_scale_tiers: {
        Row: {
          created_at: string | null
          id: string
          rate_reduction: number | null
          revenue_multiplier: number | null
          revenue_threshold: number
          take_rate: number
          tier_number: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          rate_reduction?: number | null
          revenue_multiplier?: number | null
          revenue_threshold: number
          take_rate: number
          tier_number: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          rate_reduction?: number | null
          revenue_multiplier?: number | null
          revenue_threshold?: number
          take_rate?: number
          tier_number?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_tiers_config: {
        Row: {
          base_revenue_threshold: number | null
          created_at: string | null
          description: string | null
          fixed_monthly_cost: number
          id: string
          is_active: boolean | null
          name: string
          per_department_cost: number | null
          revenue_percentage: number
          tier_type: string
          updated_at: string | null
        }
        Insert: {
          base_revenue_threshold?: number | null
          created_at?: string | null
          description?: string | null
          fixed_monthly_cost?: number
          id?: string
          is_active?: boolean | null
          name: string
          per_department_cost?: number | null
          revenue_percentage?: number
          tier_type: string
          updated_at?: string | null
        }
        Update: {
          base_revenue_threshold?: number | null
          created_at?: string | null
          description?: string | null
          fixed_monthly_cost?: number
          id?: string
          is_active?: boolean | null
          name?: string
          per_department_cost?: number | null
          revenue_percentage?: number
          tier_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_sources: {
        Row: {
          active: boolean
          category: string
          created_at: string
          icon_name: string | null
          id: string
          name: string
          sort_order: number | null
          tracking_code: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category: string
          created_at?: string
          icon_name?: string | null
          id?: string
          name: string
          sort_order?: number | null
          tracking_code?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          icon_name?: string | null
          id?: string
          name?: string
          sort_order?: number | null
          tracking_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rotating_headline_terms: {
        Row: {
          active: boolean | null
          created_at: string | null
          descriptor_fallback: string
          descriptor_key: string
          icon_name: string | null
          id: string
          sort_order: number | null
          term_fallback: string
          term_key: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          descriptor_fallback: string
          descriptor_key: string
          icon_name?: string | null
          id?: string
          sort_order?: number | null
          term_fallback: string
          term_key: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          descriptor_fallback?: string
          descriptor_key?: string
          icon_name?: string | null
          id?: string
          sort_order?: number | null
          term_fallback?: string
          term_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string | null
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_listings"
            referencedColumns: ["id"]
          },
        ]
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
          footer_cta_bg_color: string | null
          footer_cta_icon: string | null
          footer_cta_text: string | null
          footer_cta_text_color: string | null
          footer_cta_url: string | null
          footer_heading: string | null
          footer_text: string | null
          hero_cta_bg_color: string | null
          hero_cta_icon: string | null
          hero_cta_text: string | null
          hero_cta_text_color: string | null
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
          footer_cta_bg_color?: string | null
          footer_cta_icon?: string | null
          footer_cta_text?: string | null
          footer_cta_text_color?: string | null
          footer_cta_url?: string | null
          footer_heading?: string | null
          footer_text?: string | null
          hero_cta_bg_color?: string | null
          hero_cta_icon?: string | null
          hero_cta_text?: string | null
          hero_cta_text_color?: string | null
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
          footer_cta_bg_color?: string | null
          footer_cta_icon?: string | null
          footer_cta_text?: string | null
          footer_cta_text_color?: string | null
          footer_cta_url?: string | null
          footer_heading?: string | null
          footer_text?: string | null
          hero_cta_bg_color?: string | null
          hero_cta_icon?: string | null
          hero_cta_text?: string | null
          hero_cta_text_color?: string | null
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
      tech_stack_items: {
        Row: {
          active: boolean | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      text_content: {
        Row: {
          active: boolean
          button_bg_color: string | null
          button_icon: string | null
          button_url: string | null
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
          button_bg_color?: string | null
          button_icon?: string | null
          button_url?: string | null
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
          button_bg_color?: string | null
          button_icon?: string | null
          button_url?: string | null
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
          color_token: string | null
          context: string | null
          created_at: string
          font_size: string | null
          font_size_desktop: string | null
          font_size_mobile: string | null
          font_size_tablet: string | null
          font_weight: string | null
          id: string
          is_intentionally_empty: boolean | null
          is_italic: boolean | null
          is_stale: boolean | null
          is_underline: boolean | null
          language_code: string
          page_location: string | null
          quality_metrics: Json | null
          quality_score: number | null
          review_status: string | null
          source_hash: string | null
          source_updated_at: string | null
          translated_text: string
          translation_key: string
          updated_at: string
        }
        Insert: {
          ai_reviewed_at?: string | null
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          color_token?: string | null
          context?: string | null
          created_at?: string
          font_size?: string | null
          font_size_desktop?: string | null
          font_size_mobile?: string | null
          font_size_tablet?: string | null
          font_weight?: string | null
          id?: string
          is_intentionally_empty?: boolean | null
          is_italic?: boolean | null
          is_stale?: boolean | null
          is_underline?: boolean | null
          language_code: string
          page_location?: string | null
          quality_metrics?: Json | null
          quality_score?: number | null
          review_status?: string | null
          source_hash?: string | null
          source_updated_at?: string | null
          translated_text: string
          translation_key: string
          updated_at?: string
        }
        Update: {
          ai_reviewed_at?: string | null
          approved?: boolean
          approved_at?: string | null
          approved_by?: string | null
          color_token?: string | null
          context?: string | null
          created_at?: string
          font_size?: string | null
          font_size_desktop?: string | null
          font_size_mobile?: string | null
          font_size_tablet?: string | null
          font_weight?: string | null
          id?: string
          is_intentionally_empty?: boolean | null
          is_italic?: boolean | null
          is_stale?: boolean | null
          is_underline?: boolean | null
          language_code?: string
          page_location?: string | null
          quality_metrics?: Json | null
          quality_score?: number | null
          review_status?: string | null
          source_hash?: string | null
          source_updated_at?: string | null
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
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
          user_id?: string
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
      evaluated_counts_by_language: {
        Row: {
          evaluated_count: number | null
          language_code: string | null
          total_count: number | null
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
      public_employees: {
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
      translation_stats: {
        Row: {
          actual_translations: number | null
          approval_percentage: number | null
          approved_translations: number | null
          avg_quality_score: number | null
          code: string | null
          enabled: boolean | null
          high_quality_count: number | null
          low_quality_count: number | null
          medium_quality_count: number | null
          missing_translations: number | null
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
      get_user_role: {
        Args: { check_user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      refresh_language_translation_stats: { Args: never; Returns: undefined }
      sync_language_visibility: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer"
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
    Enums: {
      app_role: ["admin", "editor", "viewer"],
    },
  },
} as const
