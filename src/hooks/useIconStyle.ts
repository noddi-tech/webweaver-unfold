import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface IconStyle {
  background_token: string;
  icon_name?: string;
  icon_color_token: string;
  size: string;
  shape: string;
}

export const useIconStyle = (elementId: string, defaultBackground = 'gradient-primary') => {
  const [iconStyle, setIconStyle] = useState<IconStyle>({
    background_token: defaultBackground,
    icon_color_token: 'primary-foreground',
    size: 'default',
    shape: 'rounded-xl'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadIconStyle();
  }, [elementId]);

  const loadIconStyle = async () => {
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
    } finally {
      setIsLoading(false);
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
    isLoading
  };
};
