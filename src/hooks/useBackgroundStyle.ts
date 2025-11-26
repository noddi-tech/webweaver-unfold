import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getOptimalTextColorForBackground } from '@/config/colorSystem';

export function useBackgroundStyle(
  elementId: string,
  defaultBackground: string = 'bg-card',
  defaultTextColor?: string
) {
  const [background, setBackground] = useState(defaultBackground);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const [textColor, setTextColor] = useState(
    defaultTextColor || getOptimalTextColorForBackground(defaultBackground)
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchColorToken = async (backgroundClass: string) => {
      try {
        const baseClass = backgroundClass.split('/')[0];
        if (!baseClass.startsWith('bg-')) return null;

        const cssVar = `--${baseClass.replace('bg-', '')}`;
        const { data: colorToken } = await supabase
          .from('color_tokens')
          .select('css_var, color_type, value')
          .eq('css_var', cssVar)
          .maybeSingle();

        return colorToken;
      } catch (error) {
        console.error('Error fetching color token for background:', error);
        return null;
      }
    };

    const fetchBackgroundStyle = async () => {
      try {
        const { data, error } = await supabase
          .from('background_styles')
          .select('background_class, text_color_class')
          .eq('element_id', elementId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching background style:', error);
        }

        if (data) {
          setBackground(data.background_class);

          const colorToken = await fetchColorToken(data.background_class);

          if (colorToken) {
            if (colorToken.color_type === 'gradient' || colorToken.color_type === 'glass') {
              setBackgroundStyle({ backgroundImage: `var(${colorToken.css_var})` });
            } else if (colorToken.color_type === 'solid' && colorToken.value) {
              setBackgroundStyle({ backgroundColor: `hsl(${colorToken.value})` });
            }
          } else {
            // Fallback: no matching token, rely on Tailwind class
            setBackgroundStyle({});
          }

          if (data.text_color_class) {
            setTextColor(data.text_color_class);
          } else {
            // Auto-set optimal text color if not stored
            const optimal = getOptimalTextColorForBackground(data.background_class);
            setTextColor(optimal);
          }
        }
      } catch (error) {
        console.error('Error in fetchBackgroundStyle:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackgroundStyle();
  }, [elementId, defaultBackground]);

  const updateBackgroundAndTextColor = async (
    newBackground: string,
    newTextColor?: string
  ) => {
    const optimalTextColor = newTextColor || getOptimalTextColorForBackground(newBackground);
    
    // Update local state immediately for responsive UI
    setBackground(newBackground);
    setTextColor(optimalTextColor);

    // Fetch color token data for inline style
    const colorToken = await (async () => {
      try {
        const baseClass = newBackground.split('/')[0];
        if (!baseClass.startsWith('bg-')) return null;

        const cssVar = `--${baseClass.replace('bg-', '')}`;
        const { data } = await supabase
          .from('color_tokens')
          .select('css_var, color_type, value')
          .eq('css_var', cssVar)
          .maybeSingle();

        return data;
      } catch (error) {
        console.error('Error fetching color token for new background:', error);
        return null;
      }
    })();

    if (colorToken) {
      if (colorToken.color_type === 'gradient' || colorToken.color_type === 'glass') {
        setBackgroundStyle({ backgroundImage: `var(${colorToken.css_var})` });
      } else if (colorToken.color_type === 'solid' && colorToken.value) {
        setBackgroundStyle({ backgroundColor: `hsl(${colorToken.value})` });
      }
    } else {
      setBackgroundStyle({});
    }

    try {
      const { error } = await supabase
        .from('background_styles')
        .upsert(
          { 
            element_id: elementId, 
            background_class: newBackground,
            text_color_class: optimalTextColor
          },
          { onConflict: 'element_id' }
        );

      if (error) {
        console.error('Error updating background and text color:', error);
        // Revert on error
        setBackground(defaultBackground);
        setTextColor(defaultTextColor || getOptimalTextColorForBackground(defaultBackground));
      }
    } catch (error) {
      console.error('Error in updateBackgroundAndTextColor:', error);
      // Revert on error
      setBackground(defaultBackground);
      setTextColor(defaultTextColor || getOptimalTextColorForBackground(defaultBackground));
    }
  };

  return { 
    background, 
    backgroundStyle,
    textColor,
    isLoading,
    updateBackground: updateBackgroundAndTextColor, // Keep same method name for backward compat
    updateBackgroundAndTextColor,
  };
}
