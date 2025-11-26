import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ColorOption, TextColorOption } from '@/config/colorSystem';

interface ColorSystemState {
  SOLID_COLORS: ColorOption[];
  GRADIENT_COLORS: ColorOption[];
  GLASS_EFFECTS: ColorOption[];
  ALL_BACKGROUND_OPTIONS: ColorOption[];
  TEXT_COLOR_OPTIONS: TextColorOption[];
  loading: boolean;
  error: Error | null;
}

/**
 * Custom hook to load the entire color system from the database
 * Replaces hardcoded colorSystem.ts imports with dynamic CMS-managed colors
 * 
 * @returns Color system data grouped by type, with loading/error states
 */
export const useColorSystem = (): ColorSystemState => {
  const [state, setState] = useState<ColorSystemState>({
    SOLID_COLORS: [],
    GRADIENT_COLORS: [],
    GLASS_EFFECTS: [],
    ALL_BACKGROUND_OPTIONS: [],
    TEXT_COLOR_OPTIONS: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadColorSystem();
  }, []);

  const loadColorSystem = async () => {
    try {
      const { data, error } = await supabase
        .from('color_tokens')
        .select('*')
        .eq('active', true)
        .order('category, sort_order');

      if (error) throw error;

      if (data) {
        // Transform database rows into ColorOption format
        const allColors = data.map(token => ({
          value: token.preview_class || `bg-${token.css_var.replace('--', '')}`,
          label: token.label || token.css_var,
          description: token.description || '',
          preview: token.preview_class || `bg-${token.css_var.replace('--', '')}`,
          cssVar: token.css_var,
          type: token.color_type as 'solid' | 'gradient' | 'glass',
          category: token.category as ColorOption['category'],
          optimalTextColor: token.optimal_text_color as 'white' | 'dark' | 'auto',
        }));

        // Separate backgrounds from text colors using the database category field
        const backgrounds = allColors.filter(c => c.category !== 'text');
        const textColors = allColors
          .filter(c => c.category === 'text')
          .map(c => {
            // Get the original database record to extract HSL value
            const dbRecord = data.find(d => d.css_var === c.cssVar);
            return {
              value: c.preview || `text-${c.cssVar.replace('--', '')}`,
              label: c.label,
              description: c.description,
              preview: c.preview || `text-${c.cssVar.replace('--', '')}`,
              className: c.preview || `text-${c.cssVar.replace('--', '')}`,
              hslValue: dbRecord?.value, // Include actual HSL value for luminance calculation
              cssVar: c.cssVar,          // Include CSS variable name
            };
          });

        // Add white text color if not present
        if (!textColors.some(t => t.value === 'text-white')) {
          textColors.unshift({
            value: 'text-white',
            label: 'White',
            description: 'Pure white text for dark backgrounds',
            preview: 'text-white',
            className: 'text-white',
            hslValue: '0 0% 100%',  // Pure white HSL value
            cssVar: '--white',       // Logical CSS var name (even if not in CSS)
          });
        }

        setState({
          SOLID_COLORS: backgrounds.filter(c => c.type === 'solid'),
          GRADIENT_COLORS: backgrounds.filter(c => c.type === 'gradient'),
          GLASS_EFFECTS: backgrounds.filter(c => c.type === 'glass'),
          ALL_BACKGROUND_OPTIONS: backgrounds,
          TEXT_COLOR_OPTIONS: textColors,
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error('Error loading color system:', err);
      setState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err : new Error('Failed to load color system'),
      }));
    }
  };

  return state;
};
