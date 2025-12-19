import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteStyles, type ColorToken } from '@/contexts/SiteStylesContext';

/**
 * Gets the optimal text color from preloaded colorTokens (CMS-driven)
 * Falls back to 'text-foreground' only if color is truly unknown
 */
const getOptimalTextColorFromTokens = (
  backgroundValue: string,
  colorTokens: ColorToken[]
): string => {
  const baseBackground = backgroundValue.split('/')[0];
  // Convert bg-gradient-mesh-velvet → --gradient-mesh-velvet
  const cssVar = `--${baseBackground.replace('bg-', '')}`;
  
  const token = colorTokens.find(t => t.css_var === cssVar);
  
  if (token?.optimal_text_color === 'white') {
    return 'text-white';
  } else if (token?.optimal_text_color === 'dark') {
    return 'text-foreground';
  }
  
  // For backgrounds not in color_tokens, default to foreground (safe for light backgrounds)
  return 'text-foreground';
};

export function useBackgroundStyle(
  elementId: string,
  defaultBackground: string = 'bg-card',
  defaultTextColor?: string
) {
  const { backgroundStyles, colorTokens, isLoaded, refreshBackgroundStyles } = useSiteStyles();
  
  // Get saved style from preloaded context
  const savedStyle = backgroundStyles[elementId];
  const initialBackground = savedStyle?.background_class || defaultBackground;
  const initialTextColor = savedStyle?.text_color_class || defaultTextColor || 
    (isLoaded ? getOptimalTextColorFromTokens(initialBackground, colorTokens) : 'text-foreground');
  
  const [background, setBackground] = useState(initialBackground);
  const [backgroundStyle, setBackgroundStyle] = useState<React.CSSProperties>({});
  const [textColor, setTextColor] = useState(initialTextColor);

  // Update local state when context loads or refreshes
  useEffect(() => {
    if (!isLoaded) return;
    
    const savedStyle = backgroundStyles[elementId];
    if (savedStyle) {
      const newBackground = savedStyle.background_class;
      setBackground(newBackground);
      
      // Fetch color token for styling
      const fetchColorToken = async () => {
        try {
          const baseClass = newBackground.split('/')[0];
          if (!baseClass.startsWith('bg-')) return null;

          const cssVar = `--${baseClass.replace('bg-', '')}`;
          const colorToken = colorTokens.find(token => token.css_var === cssVar);

          if (colorToken) {
            if (colorToken.color_type === 'gradient' || colorToken.color_type === 'glass') {
              setBackgroundStyle({ backgroundImage: `var(${colorToken.css_var})` });
            } else if (colorToken.color_type === 'solid' && colorToken.value) {
              setBackgroundStyle({ backgroundColor: `hsl(${colorToken.value})` });
            }
          } else {
            setBackgroundStyle({});
          }
        } catch (error) {
          console.error('Error fetching color token:', error);
        }
      };
      
      fetchColorToken();
      
      if (savedStyle.text_color_class) {
        setTextColor(savedStyle.text_color_class);
      } else {
        setTextColor(getOptimalTextColorFromTokens(newBackground, colorTokens));
      }
    }
  }, [elementId, backgroundStyles, colorTokens, isLoaded]);

  const updateBackgroundAndTextColor = async (
    newBackground: string,
    newTextColor?: string
  ) => {
    const optimalTextColor = newTextColor || getOptimalTextColorFromTokens(newBackground, colorTokens);
    
    // Step 1: Fetch color token FIRST (before any state updates)
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

    // Step 2: Prepare background style
    let newBackgroundStyle: React.CSSProperties = {};
    if (colorToken) {
      if (colorToken.color_type === 'gradient' || colorToken.color_type === 'glass') {
        newBackgroundStyle = { backgroundImage: `var(${colorToken.css_var})` };
      } else if (colorToken.color_type === 'solid' && colorToken.value) {
        newBackgroundStyle = { backgroundColor: `hsl(${colorToken.value})` };
      }
    }

    // Step 3: Set ALL state together (prevents intermediate renders)
    setBackground(newBackground);
    setTextColor(optimalTextColor);
    setBackgroundStyle(newBackgroundStyle);

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
        setTextColor(defaultTextColor || getOptimalTextColorFromTokens(defaultBackground, colorTokens));
      } else {
        // Refresh the context so other components get the updated data
        await refreshBackgroundStyles();
      }
    } catch (error) {
      console.error('Error in updateBackgroundAndTextColor:', error);
      // Revert on error
      setBackground(defaultBackground);
      setTextColor(defaultTextColor || getOptimalTextColorFromTokens(defaultBackground, colorTokens));
    }
  };

  return { 
    background, 
    backgroundStyle,
    textColor,
    isLoading: !isLoaded,
    updateBackground: updateBackgroundAndTextColor, // Keep same method name for backward compat
    updateBackgroundAndTextColor,
  };
}
