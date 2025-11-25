import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface FontFile {
  weight: number;
  style: string;
  url: string;
  format: string;
}

interface TypographyToken {
  name: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
  letterSpacing: number;
}

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
  font_files: Json;
  mono_font_files: Json;
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

    // Handle font loading based on source
    if (data.font_source === 'google' && data.font_google_url) {
      injectGoogleFont(data.font_google_url);
    } else if (data.font_source === 'self-hosted' && data.font_files) {
      injectSelfHostedFonts(data.font_family_name, data.font_files as unknown as FontFile[]);
    }

    if (data.mono_font_source === 'google' && data.mono_font_google_url) {
      injectGoogleFont(data.mono_font_google_url);
    } else if (data.mono_font_source === 'self-hosted' && data.mono_font_files) {
      injectSelfHostedFonts(data.mono_font_family_name, data.mono_font_files as unknown as FontFile[]);
    }

    // Apply typography scale if available
    if (data.typography_scale && Array.isArray(data.typography_scale)) {
      applyTypographyScale(data.typography_scale as unknown as TypographyToken[]);
    }
  };

  const injectSelfHostedFonts = (fontName: string, fontFiles: FontFile[]) => {
    if (!fontFiles || fontFiles.length === 0) return;

    const styleId = `self-hosted-font-${fontName.replace(/\s+/g, '-')}`;
    if (document.getElementById(styleId)) return;

    const fontFaceRules = fontFiles.map(file => `
      @font-face {
        font-family: '${fontName}';
        src: url('${file.url}') format('${file.format}');
        font-weight: ${file.weight};
        font-style: ${file.style};
        font-display: swap;
      }
    `).join('\n');

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = fontFaceRules;
    document.head.appendChild(style);
  };

  const applyTypographyScale = (scale: TypographyToken[]) => {
    const root = document.documentElement;
    scale.forEach((typo) => {
      const varPrefix = `--typography-${typo.name.toLowerCase().replace(/\s+/g, '-')}`;
      root.style.setProperty(`${varPrefix}-size`, `${typo.fontSize}px`);
      root.style.setProperty(`${varPrefix}-line-height`, typo.lineHeight.toString());
      root.style.setProperty(`${varPrefix}-weight`, typo.fontWeight.toString());
      root.style.setProperty(`${varPrefix}-spacing`, `${typo.letterSpacing}em`);
    });
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
