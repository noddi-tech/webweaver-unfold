import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BackgroundStyle {
  background_class: string;
  text_color_class: string | null;
}

interface IconStyle {
  background_token: string;
  icon_name?: string;
  icon_color_token: string;
  size: string;
  shape: string;
}

interface TextStyle {
  color_token: string | null;
  button_bg_color: string | null;
  button_url: string | null;
  content: string;
}

interface ColorToken {
  id: string;
  css_var: string;
  value: string;
  label: string | null;
  description: string | null;
  color_type: string | null;
  category: string | null;
  optimal_text_color: string | null;
  preview_class: string | null;
  sort_order: number | null;
  active: boolean | null;
}

interface SiteStylesContextValue {
  backgroundStyles: Record<string, BackgroundStyle>;
  iconStyles: Record<string, IconStyle>;
  textStyles: Record<string, TextStyle>;
  colorTokens: ColorToken[];
  isLoaded: boolean;
}

const SiteStylesContext = createContext<SiteStylesContextValue>({
  backgroundStyles: {},
  iconStyles: {},
  textStyles: {},
  colorTokens: [],
  isLoaded: false,
});

export function useSiteStyles() {
  const context = useContext(SiteStylesContext);
  if (!context) {
    throw new Error('useSiteStyles must be used within SiteStylesProvider');
  }
  return context;
}

export function SiteStylesProvider({ children }: { children: React.ReactNode }) {
  const [styles, setStyles] = useState<SiteStylesContextValue>({
    backgroundStyles: {},
    iconStyles: {},
    textStyles: {},
    colorTokens: [],
    isLoaded: false,
  });

  useEffect(() => {
    const loadAllStyles = async () => {
      try {
        // Load all styling tables in parallel
        const [bgResult, iconResult, textResult, colorResult] = await Promise.all([
          supabase.from('background_styles').select('element_id, background_class, text_color_class'),
          supabase.from('icon_styles').select('element_id, background_token, icon_name, icon_color_token, size, shape'),
          supabase.from('text_content').select('element_id, color_token, button_bg_color, button_url, content'),
          supabase.from('color_tokens').select('*').eq('active', true).order('sort_order', { ascending: true }),
        ]);

        // Convert arrays to lookup maps by element_id
        const backgroundMap: Record<string, BackgroundStyle> = {};
        bgResult.data?.forEach(item => {
          if (item.element_id) {
            backgroundMap[item.element_id] = {
              background_class: item.background_class,
              text_color_class: item.text_color_class,
            };
          }
        });

        const iconMap: Record<string, IconStyle> = {};
        iconResult.data?.forEach(item => {
          if (item.element_id) {
            iconMap[item.element_id] = {
              background_token: item.background_token,
              icon_name: item.icon_name || undefined,
              icon_color_token: item.icon_color_token,
              size: item.size,
              shape: item.shape,
            };
          }
        });

        const textMap: Record<string, TextStyle> = {};
        textResult.data?.forEach(item => {
          if (item.element_id) {
            textMap[item.element_id] = {
              color_token: item.color_token,
              button_bg_color: item.button_bg_color,
              button_url: item.button_url,
              content: item.content,
            };
          }
        });

        setStyles({
          backgroundStyles: backgroundMap,
          iconStyles: iconMap,
          textStyles: textMap,
          colorTokens: colorResult.data || [],
          isLoaded: true,
        });
      } catch (error) {
        console.error('Error loading site styles:', error);
        // Set as loaded even on error to prevent infinite loading
        setStyles(prev => ({ ...prev, isLoaded: true }));
      }
    };

    loadAllStyles();
  }, []);

  return (
    <SiteStylesContext.Provider value={styles}>
      {children}
    </SiteStylesContext.Provider>
  );
}
