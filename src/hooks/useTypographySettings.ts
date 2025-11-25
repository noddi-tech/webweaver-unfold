import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface TypographySettings {
  id: string;
  font_family_name: string;
  font_source: string;
  font_google_url: string | null;
  fallback_fonts: string[];
  mono_font_family_name: string;
  mono_font_source: string;
  mono_font_google_url: string | null;
  mono_fallback_fonts: string[];
  typography_scale: Json;
}

export const useTypographySettings = () => {
  const [settings, setSettings] = useState<TypographySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('typography_settings')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      
      if (data) {
        setSettings(data);
        applyTypographySettings(data);
      }
    } catch (error) {
      console.error('Error loading typography settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTypographySettings = (data: TypographySettings) => {
    // Set CSS variables for fonts
    const root = document.documentElement;
    
    const primaryFont = `${data.font_family_name}, ${data.fallback_fonts.join(', ')}`;
    const monoFont = `${data.mono_font_family_name}, ${data.mono_fallback_fonts.join(', ')}`;
    
    root.style.setProperty('--font-primary', primaryFont);
    root.style.setProperty('--font-mono', monoFont);

    // Inject Google Fonts link if source is 'google'
    if (data.font_source === 'google' && data.font_google_url) {
      injectGoogleFont(data.font_google_url);
    }
    if (data.mono_font_source === 'google' && data.mono_font_google_url) {
      injectGoogleFont(data.mono_font_google_url);
    }
  };

  const injectGoogleFont = (url: string) => {
    const existingLink = document.querySelector(`link[href="${url}"]`);
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  };

  return { settings, loading, loadSettings };
};
