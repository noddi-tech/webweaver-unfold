import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSiteStyles } from '@/contexts/SiteStylesContext';

interface IconStyle {
  background_token: string;
  icon_name?: string;
  icon_color_token: string;
  size: string;
  shape: string;
}

export const useIconStyle = (elementId: string, defaultBackground = 'gradient-primary') => {
  const { iconStyles, isLoaded } = useSiteStyles();
  
  // Get saved style from preloaded context
  const savedStyle = iconStyles[elementId];
  const initialStyle: IconStyle = savedStyle || {
    background_token: defaultBackground,
    icon_color_token: 'primary-foreground',
    size: 'default',
    shape: 'rounded-xl'
  };
  
  const [iconStyle, setIconStyle] = useState<IconStyle>(initialStyle);

  // Update local state when context loads
  useEffect(() => {
    if (!isLoaded) return;
    
    const savedStyle = iconStyles[elementId];
    if (savedStyle) {
      setIconStyle({
        background_token: savedStyle.background_token,
        icon_name: savedStyle.icon_name,
        icon_color_token: savedStyle.icon_color_token,
        size: savedStyle.size,
        shape: savedStyle.shape
      });
    }
  }, [elementId, iconStyles, isLoaded]);

  const loadIconStyle = async () => {
    // This is now only called after updates to refresh data
    try {
      const { data } = await supabase
        .from('icon_styles')
        .select('*')
        .eq('element_id', elementId)
        .maybeSingle();

      if (data) {
        setIconStyle({
          background_token: data.background_token,
          icon_name: data.icon_name || undefined,
          icon_color_token: data.icon_color_token,
          size: data.size,
          shape: data.shape
        });
      }
    } catch (error) {
      console.error('Error loading icon style:', error);
    }
  };

  const updateIconStyle = async (updates: Partial<IconStyle>) => {
    try {
      const { error } = await supabase
        .from('icon_styles')
        .upsert({
          element_id: elementId,
          ...updates
        }, {
          onConflict: 'element_id'
        });

      if (error) throw error;
      
      await loadIconStyle();
    } catch (error) {
      console.error('Error updating icon style:', error);
      throw error;
    }
  };

  return {
    iconStyle,
    updateIconStyle,
    isLoading: !isLoaded
  };
};
