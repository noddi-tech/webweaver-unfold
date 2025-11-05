import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useBackgroundStyle(elementId: string, defaultBackground: string) {
  const [background, setBackground] = useState(defaultBackground);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBackgroundStyle = async () => {
      try {
        const { data, error } = await supabase
          .from('background_styles')
          .select('background_class')
          .eq('element_id', elementId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching background style:', error);
        }

        if (data) {
          setBackground(data.background_class);
        }
      } catch (error) {
        console.error('Error in fetchBackgroundStyle:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackgroundStyle();
  }, [elementId]);

  const updateBackground = async (newBackground: string) => {
    setBackground(newBackground);

    try {
      const { error } = await supabase
        .from('background_styles')
        .upsert(
          { 
            element_id: elementId, 
            background_class: newBackground 
          },
          { onConflict: 'element_id' }
        );

      if (error) {
        console.error('Error updating background style:', error);
        setBackground(defaultBackground);
      }
    } catch (error) {
      console.error('Error in updateBackground:', error);
      setBackground(defaultBackground);
    }
  };

  return { background, updateBackground, isLoading };
}
