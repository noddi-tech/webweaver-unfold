import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Save, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import i18n from '@/i18n/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { useColorSystem } from '@/hooks/useColorSystem';
import { getContrastRatio, getLuminanceFromHSL, getContrastBadge } from '@/lib/contrastUtils';
import { needsDarkSwatchBackground, resolveTextColor } from '@/lib/textColorUtils';
import { cn } from '@/lib/utils';

interface RichTextEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;
  contentTable: 'text_content' | 'translations';
  translationKey?: string;
  onSave?: () => void;
  fallbackText?: string;
  useElementId?: boolean;
  currentBackgroundClass?: string;
}

interface Translation {
  language_code: string;
  translated_text: string;
  language_name?: string;
}

interface StyleSettings {
  colorToken: string;
  fontSize: string;
  fontSizeMobile: string;
  fontSizeTablet: string;
  fontSizeDesktop: string;
  fontWeight: string;
  isItalic: boolean;
  isUnderline: boolean;
}

// Font size and weight mapping to actual CSS values
const FONT_SIZE_MAP: Record<string, string> = {
  'xs': '0.75rem',     // 12px
  'sm': '0.875rem',    // 14px
  'base': '1rem',      // 16px
  'lg': '1.125rem',    // 18px
  'xl': '1.25rem',     // 20px
  '2xl': '1.5rem',     // 24px
  '3xl': '1.875rem',   // 30px
  '4xl': '2.25rem',    // 36px
  '5xl': '3rem',       // 48px
  '6xl': '3.75rem',    // 60px
  '7xl': '4.5rem',     // 72px
  '8xl': '6rem',       // 96px
};

const FONT_WEIGHT_MAP: Record<string, number> = {
  'light': 300,
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
  'extrabold': 800,
};

const FONT_SIZES = [
  { value: 'xs', label: 'XS', className: 'text-xs' },
  { value: 'sm', label: 'SM', className: 'text-sm' },
  { value: 'base', label: 'Base', className: 'text-base' },
  { value: 'lg', label: 'LG', className: 'text-lg' },
  { value: 'xl', label: 'XL', className: 'text-xl' },
  { value: '2xl', label: '2XL', className: 'text-2xl' },
  { value: '3xl', label: '3XL', className: 'text-3xl' },
  { value: '4xl', label: '4XL', className: 'text-4xl' },
  { value: '5xl', label: '5XL', className: 'text-5xl' },
  { value: '6xl', label: '6XL', className: 'text-6xl' },
  { value: '7xl', label: '7XL', className: 'text-7xl' },
  { value: '8xl', label: '8XL', className: 'text-8xl' },
];

// Responsive font sizes include "Inherit" option
const RESPONSIVE_FONT_SIZES = [
  { value: 'inherit', label: 'Inherit', className: '' },
  ...FONT_SIZES
];

const FONT_WEIGHTS = [
  { value: 'light', label: 'Light', className: 'font-light' },
  { value: 'normal', label: 'Normal', className: 'font-normal' },
  { value: 'medium', label: 'Medium', className: 'font-medium' },
  { value: 'semibold', label: 'Semibold', className: 'font-semibold' },
  { value: 'bold', label: 'Bold', className: 'font-bold' },
  { value: 'extrabold', label: 'Extrabold', className: 'font-extrabold' },
];

export function RichTextEditModal({
  open,
  onOpenChange,
  contentId,
  contentTable,
  translationKey,
  onSave,
  fallbackText,
  useElementId = false,
  currentBackgroundClass = 'bg-background',
}: RichTextEditModalProps) {
  const [content, setContent] = useState('');
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoTranslateEnabled, setAutoTranslateEnabled] = useState(false);
  const { currentLanguage } = useAppTranslation();
  const { TEXT_COLOR_OPTIONS } = useColorSystem();

  // Style settings
  const [styleSettings, setStyleSettings] = useState<StyleSettings>({
    colorToken: 'foreground',
    fontSize: 'base',
    fontSizeMobile: 'inherit',
    fontSizeTablet: 'inherit',
    fontSizeDesktop: 'inherit',
    fontWeight: 'normal',
    isItalic: false,
    isUnderline: false,
  });

  useEffect(() => {
    if (open) {
      loadContent();
      loadAutoTranslateSetting();
    }
  }, [open, contentId]);

  const loadAutoTranslateSetting = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('setting_value')
      .eq('setting_key', 'auto_translate_on_edit')
      .single();
    
    const settingValue = data?.setting_value as { enabled?: boolean } | null;
    setAutoTranslateEnabled(settingValue?.enabled === true);
  };

  const loadContent = async () => {
    setLoading(true);
    try {
      if (contentTable === 'text_content') {
        let data: any;
        let error: any;
        
        if (useElementId) {
          const res = await supabase
            .from('text_content')
            .select('content, color_token')
            .eq('element_id', contentId)
            .maybeSingle();
          data = res.data;
          error = res.error;
        } else {
          const res = await supabase
            .from('text_content')
            .select('content, color_token')
            .eq('id', contentId)
            .maybeSingle();
          data = res.data;
          error = res.error;
        }
        
        if (error) throw error;
        setContent(data?.content || '');
        
        // Load style settings from text_content
        if (data) {
          setStyleSettings(prev => ({
            ...prev,
            colorToken: data.color_token || 'foreground',
          }));
        }

        if (translationKey) {
          const { data: langData } = await supabase
            .from('languages')
            .select('code, name')
            .eq('enabled', true)
            .order('sort_order');

          const { data: transData } = await supabase
            .from('translations')
            .select('language_code, translated_text')
            .eq('translation_key', translationKey);

          const translationsMap = new Map(
            transData?.map(t => [t.language_code, t.translated_text]) || []
          );

          setTranslations(
            langData?.map(lang => ({
              language_code: lang.code,
              language_name: lang.name,
              translated_text: translationsMap.get(lang.code) || '',
            })) || []
          );
        }
      } else if (contentTable === 'translations' && translationKey) {
        const { data: langData } = await supabase
          .from('languages')
          .select('code, name')
          .eq('enabled', true)
          .order('sort_order');

        const { data: transData } = await supabase
          .from('translations')
          .select('language_code, translated_text, color_token, font_size, font_size_mobile, font_size_tablet, font_size_desktop, font_weight, is_italic, is_underline')
          .eq('translation_key', translationKey);

        const translationsMap = new Map(
          transData?.map(t => [t.language_code, t.translated_text]) || []
        );

        const englishContent = translationsMap.get('en') || fallbackText || '';
        setContent(englishContent);

        // Load style settings from English translation
        const englishData = transData?.find(t => t.language_code === 'en');
        if (englishData) {
          setStyleSettings({
            colorToken: englishData.color_token || 'foreground',
            fontSize: englishData.font_size || 'base',
            fontSizeMobile: englishData.font_size_mobile || 'inherit',
            fontSizeTablet: englishData.font_size_tablet || 'inherit',
            fontSizeDesktop: englishData.font_size_desktop || 'inherit',
            fontWeight: englishData.font_weight || 'normal',
            isItalic: englishData.is_italic || false,
            isUnderline: englishData.is_underline || false,
          });
        }

        setTranslations(
          langData?.map(lang => ({
            language_code: lang.code,
            language_name: lang.name,
            translated_text: translationsMap.get(lang.code) || '',
          })) || []
        );
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      if (contentTable === 'text_content') {
        let error: any;
        
        if (useElementId) {
          const res = await supabase
            .from('text_content')
            .update({ 
              content,
              color_token: styleSettings.colorToken,
            })
            .eq('element_id', contentId);
          error = res.error;
        } else {
          const res = await supabase
            .from('text_content')
            .update({ 
              content,
              color_token: styleSettings.colorToken,
            })
            .eq('id', contentId);
          error = res.error;
        }
        
        if (error) throw error;
      } else if (contentTable === 'translations' && translationKey) {
        const { data: existing } = await supabase
          .from('translations')
          .select('id')
          .eq('translation_key', translationKey)
          .eq('language_code', currentLanguage)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from('translations')
            .update({
              translated_text: content,
              color_token: styleSettings.colorToken,
              font_size: styleSettings.fontSize,
              font_size_mobile: styleSettings.fontSizeMobile,
              font_size_tablet: styleSettings.fontSizeTablet,
              font_size_desktop: styleSettings.fontSizeDesktop,
              font_weight: styleSettings.fontWeight,
              is_italic: styleSettings.isItalic,
              is_underline: styleSettings.isUnderline,
              approved: currentLanguage === 'en',
              review_status: currentLanguage === 'en' ? 'approved' : 'pending',
            })
            .eq('translation_key', translationKey)
            .eq('language_code', currentLanguage);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('translations')
            .insert({
              translation_key: translationKey,
              language_code: currentLanguage,
              translated_text: content,
              color_token: styleSettings.colorToken,
              font_size: styleSettings.fontSize,
              font_size_mobile: styleSettings.fontSizeMobile,
              font_size_tablet: styleSettings.fontSizeTablet,
              font_size_desktop: styleSettings.fontSizeDesktop,
              font_weight: styleSettings.fontWeight,
              is_italic: styleSettings.isItalic,
              is_underline: styleSettings.isUnderline,
              approved: currentLanguage === 'en',
              review_status: currentLanguage === 'en' ? 'approved' : 'pending',
            });

          if (error) throw error;
        }
      }

      toast.success('Content updated successfully');
      
      // Auto-translate if enabled and this is English
      if (currentLanguage === 'en' && autoTranslateEnabled && translationKey) {
        await triggerAutoTranslate();
      }
      
      onOpenChange(false);
      
      await i18n.reloadResources(currentLanguage);
      await i18n.changeLanguage(currentLanguage);
      
      window.dispatchEvent(new CustomEvent('translation-updated', { 
        detail: { key: translationKey, language: currentLanguage } 
      }));
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const triggerAutoTranslate = async () => {
    try {
      const { data: enabledLanguages } = await supabase
        .from('languages')
        .select('code')
        .eq('enabled', true)
        .neq('code', 'en');

      if (!enabledLanguages || enabledLanguages.length === 0) return;

      toast.info(`Auto-translating to ${enabledLanguages.length} languages...`);

      const translatePromises = enabledLanguages.map(lang =>
        supabase.functions.invoke('translate-single-key', {
          body: {
            translationKey,
            targetLanguage: lang.code,
          }
        })
      );

      await Promise.allSettled(translatePromises);
      toast.success('Auto-translation completed!');
    } catch (error) {
      console.error('Auto-translate error:', error);
      toast.error('Auto-translation failed');
    }
  };

  const saveTranslation = async (languageCode: string, text: string) => {
    if (!translationKey) return;

    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from('translations')
        .select('id')
        .eq('translation_key', translationKey)
        .eq('language_code', languageCode)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('translations')
          .update({
            translated_text: text,
            approved: languageCode === 'en',
            review_status: languageCode === 'en' ? 'approved' : 'pending',
          })
          .eq('translation_key', translationKey)
          .eq('language_code', languageCode);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('translations')
          .insert({
            translation_key: translationKey,
            language_code: languageCode,
            translated_text: text,
            approved: languageCode === 'en',
            review_status: languageCode === 'en' ? 'approved' : 'pending',
          });

        if (error) throw error;
      }

      toast.success(`Translation ${existing ? 'updated' : 'created'} for ${languageCode}`);
      
      await i18n.reloadResources(currentLanguage);
      await i18n.changeLanguage(currentLanguage);
      
      window.dispatchEvent(new CustomEvent('translation-updated', { 
        detail: { key: translationKey, language: languageCode } 
      }));
      
      await loadContent();
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving translation:', error);
      toast.error('Failed to save translation');
    } finally {
      setSaving(false);
    }
  };

  // Calculate contrast for accessibility check
  const calculateContrast = () => {
    const bgClass = currentBackgroundClass.replace('bg-', '');
    // For now, assume light background - this could be enhanced with actual background color detection
    const bgLuminance = 1.0; // Light background
    const textColor = `hsl(var(--${styleSettings.colorToken}))`;
    const textLuminance = getLuminanceFromHSL(textColor);
    const ratio = getContrastRatio(textColor, 'hsl(0 0% 100%)');
    const badge = getContrastBadge(ratio);
    
    return { ratio, badge, passAAA: ratio >= 7.0, passAA: ratio >= 4.5 };
  };

  const contrast = calculateContrast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-background text-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Text Content
          </DialogTitle>
          <DialogDescription>
            Edit content, styling, and translations
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <Tabs defaultValue="main" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="main">Main Content</TabsTrigger>
              <TabsTrigger value="styling">Styling</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="translations" disabled={!translationKey}>
                Translations {translationKey ? `(${translations.length})` : ''}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="main" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button onClick={saveContent} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Content'}
              </Button>
            </TabsContent>

            <TabsContent value="styling" className="space-y-6">
              {/* Text Color */}
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {TEXT_COLOR_OPTIONS.map((colorOption) => {
                    const tokenName = colorOption.value.replace('text-', '');
                    const needsDarkBg = needsDarkSwatchBackground(tokenName, colorOption.hslValue);
                    
                    return (
                      <button
                        key={colorOption.value}
                        onClick={() => setStyleSettings(prev => ({
                          ...prev,
                          colorToken: tokenName,
                        }))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105',
                          styleSettings.colorToken === tokenName
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-border',
                          needsDarkBg ? 'bg-slate-800' : 'bg-background'
                        )}
                        title={colorOption.description}
                      >
                        <div 
                          className="text-center font-bold text-xl"
                          style={{ color: resolveTextColor(tokenName, colorOption.hslValue) }}
                        >
                          Aa
                        </div>
                        <div className={cn(
                          "text-xs mt-1 truncate",
                          needsDarkBg ? "text-slate-300" : "text-muted-foreground"
                        )}>
                          {colorOption.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label>Font Size (All Screens)</Label>
                <div className="grid grid-cols-6 gap-2">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setStyleSettings(prev => ({ ...prev, fontSize: size.value }))}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all hover:scale-105',
                        styleSettings.fontSize === size.value
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-border',
                        'bg-background text-foreground'
                      )}
                    >
                      <div className={cn('text-center font-semibold', size.className)}>Aa</div>
                      <div className="text-xs text-muted-foreground mt-1">{size.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsive Font Sizes */}
              <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
                <Label className="text-base font-semibold">Responsive Font Sizes (Optional)</Label>
                <p className="text-sm text-muted-foreground">Set different sizes for specific screen sizes. Leave at "Inherit" to use the main font size.</p>
                
                <div className="space-y-3">
                  {/* Mobile */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-32">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                      </svg>
                      <span className="text-sm font-medium">Mobile</span>
                    </div>
                    <select
                      value={styleSettings.fontSizeMobile}
                      onChange={(e) => setStyleSettings(prev => ({ ...prev, fontSizeMobile: e.target.value }))}
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="inherit">
                        Inherit ({FONT_SIZES.find(s => s.value === styleSettings.fontSize)?.label || 'Base'})
                      </option>
                      {FONT_SIZES.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tablet */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-32">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                      </svg>
                      <span className="text-sm font-medium">Tablet</span>
                    </div>
                    <select
                      value={styleSettings.fontSizeTablet}
                      onChange={(e) => setStyleSettings(prev => ({ ...prev, fontSizeTablet: e.target.value }))}
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="inherit">
                        Inherit ({FONT_SIZES.find(s => s.value === styleSettings.fontSize)?.label || 'Base'})
                      </option>
                      {FONT_SIZES.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Desktop */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 w-32">
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                      </svg>
                      <span className="text-sm font-medium">Desktop</span>
                    </div>
                    <select
                      value={styleSettings.fontSizeDesktop}
                      onChange={(e) => setStyleSettings(prev => ({ ...prev, fontSizeDesktop: e.target.value }))}
                      className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="inherit">
                        Inherit ({FONT_SIZES.find(s => s.value === styleSettings.fontSize)?.label || 'Base'})
                      </option>
                      {FONT_SIZES.map(size => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Font Weight */}
              <div className="space-y-2">
                <Label>Font Weight</Label>
                <div className="grid grid-cols-6 gap-2">
                  {FONT_WEIGHTS.map((weight) => (
                    <button
                      key={weight.value}
                      onClick={() => setStyleSettings(prev => ({ ...prev, fontWeight: weight.value }))}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all hover:scale-105',
                        styleSettings.fontWeight === weight.value
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-transparent hover:border-border',
                        'bg-background text-foreground'
                      )}
                    >
                      <div className={cn('text-center text-base', weight.className)}>Aa</div>
                      <div className="text-xs text-muted-foreground mt-1">{weight.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Style */}
              <div className="space-y-2">
                <Label>Text Style</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setStyleSettings(prev => ({ ...prev, isItalic: !prev.isItalic }))}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-all hover:scale-105',
                      styleSettings.isItalic
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-border',
                      'bg-background text-foreground'
                    )}
                  >
                    <div className="text-center text-base italic">Italic</div>
                  </button>
                  <button
                    onClick={() => setStyleSettings(prev => ({ ...prev, isUnderline: !prev.isUnderline }))}
                    className={cn(
                      'flex-1 p-3 rounded-lg border-2 transition-all hover:scale-105',
                      styleSettings.isUnderline
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-transparent hover:border-border',
                      'bg-background text-foreground'
                    )}
                  >
                    <div className="text-center text-base underline">Underline</div>
                  </button>
                </div>
              </div>

              {/* Accessibility Preview */}
              <div className="space-y-2 p-4 rounded-lg border bg-card">
                <Label>Accessibility</Label>
                <div className="space-y-3">
                  <div 
                    className="p-6 rounded-lg"
                    style={{
                      backgroundColor: 'hsl(var(--background))',
                    }}
                  >
                    <p
                      style={{
                        color: styleSettings.colorToken
                          ? resolveTextColor(styleSettings.colorToken)
                          : undefined,
                        fontSize: styleSettings.fontSize && styleSettings.fontSize !== 'base' 
                          ? FONT_SIZE_MAP[styleSettings.fontSize] 
                          : undefined,
                        fontWeight: styleSettings.fontWeight && styleSettings.fontWeight !== 'normal' 
                          ? FONT_WEIGHT_MAP[styleSettings.fontWeight] 
                          : undefined,
                        fontStyle: styleSettings.isItalic ? 'italic' : 'normal',
                        textDecoration: styleSettings.isUnderline ? 'underline' : 'none',
                      }}
                    >
                      {content || 'Preview text'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Contrast Ratio:</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          contrast.badge.label === 'AAA' ? 'bg-green-100 text-green-700' :
                          contrast.badge.label === 'AA' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        )}
                      >
                        {contrast.badge.label}
                      </span>
                      <span className="text-sm font-medium">{contrast.ratio.toFixed(1)}:1</span>
                    </div>
                  </div>
                  {!contrast.passAAA && (
                    <div className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400">
                      <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        This color combination may not meet AAA accessibility standards. Consider choosing a higher contrast color.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Button onClick={saveContent} disabled={saving} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Styling'}
              </Button>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-base font-semibold">Typography Preview</Label>
                <p className="text-sm text-muted-foreground">
                  See how your text will appear across different device sizes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Mobile Preview */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    </svg>
                    Mobile <span className="text-muted-foreground">(&lt;640px)</span>
                  </Label>
                  <div 
                    className="border rounded-lg p-4 bg-background overflow-hidden min-h-[120px] flex items-center justify-center"
                    style={{ maxWidth: '200px', margin: '0 auto' }}
                  >
                    <p
                      className="text-center"
                      data-responsive-font
                      style={{
                        color: styleSettings.colorToken
                          ? resolveTextColor(styleSettings.colorToken)
                          : undefined,
                        fontSize: styleSettings.fontSizeMobile && styleSettings.fontSizeMobile !== 'inherit' && styleSettings.fontSizeMobile !== 'base'
                          ? FONT_SIZE_MAP[styleSettings.fontSizeMobile]
                          : FONT_SIZE_MAP[styleSettings.fontSize] || FONT_SIZE_MAP['base'],
                        fontWeight: styleSettings.fontWeight && styleSettings.fontWeight !== 'normal' 
                          ? FONT_WEIGHT_MAP[styleSettings.fontWeight] 
                          : undefined,
                        fontStyle: styleSettings.isItalic ? 'italic' : 'normal',
                        textDecoration: styleSettings.isUnderline ? 'underline' : 'none',
                      }}
                    >
                      {content || 'Preview text'}
                    </p>
                  </div>
                </div>

                {/* Tablet Preview */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                    </svg>
                    Tablet <span className="text-muted-foreground">(640px-1024px)</span>
                  </Label>
                  <div 
                    className="border rounded-lg p-4 bg-background overflow-hidden min-h-[120px] flex items-center justify-center"
                    style={{ maxWidth: '280px', margin: '0 auto' }}
                  >
                    <p
                      className="text-center"
                      data-responsive-font
                      style={{
                        color: styleSettings.colorToken
                          ? resolveTextColor(styleSettings.colorToken)
                          : undefined,
                        fontSize: styleSettings.fontSizeTablet && styleSettings.fontSizeTablet !== 'inherit' && styleSettings.fontSizeTablet !== 'base'
                          ? FONT_SIZE_MAP[styleSettings.fontSizeTablet]
                          : FONT_SIZE_MAP[styleSettings.fontSize] || FONT_SIZE_MAP['base'],
                        fontWeight: styleSettings.fontWeight && styleSettings.fontWeight !== 'normal' 
                          ? FONT_WEIGHT_MAP[styleSettings.fontWeight] 
                          : undefined,
                        fontStyle: styleSettings.isItalic ? 'italic' : 'normal',
                        textDecoration: styleSettings.isUnderline ? 'underline' : 'none',
                      }}
                    >
                      {content || 'Preview text'}
                    </p>
                  </div>
                </div>

                {/* Desktop Preview */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                      <line x1="8" y1="21" x2="16" y2="21" />
                      <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Desktop <span className="text-muted-foreground">(&gt;1024px)</span>
                  </Label>
                  <div 
                    className="border rounded-lg p-4 bg-background overflow-hidden min-h-[120px] flex items-center justify-center"
                  >
                    <p
                      className="text-center"
                      data-responsive-font
                      style={{
                        color: styleSettings.colorToken
                          ? resolveTextColor(styleSettings.colorToken)
                          : undefined,
                        fontSize: styleSettings.fontSizeDesktop && styleSettings.fontSizeDesktop !== 'inherit' && styleSettings.fontSizeDesktop !== 'base'
                          ? FONT_SIZE_MAP[styleSettings.fontSizeDesktop]
                          : FONT_SIZE_MAP[styleSettings.fontSize] || FONT_SIZE_MAP['base'],
                        fontWeight: styleSettings.fontWeight && styleSettings.fontWeight !== 'normal' 
                          ? FONT_WEIGHT_MAP[styleSettings.fontWeight] 
                          : undefined,
                        fontStyle: styleSettings.isItalic ? 'italic' : 'normal',
                        textDecoration: styleSettings.isUnderline ? 'underline' : 'none',
                      }}
                    >
                      {content || 'Preview text'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                💡 Tip: Use responsive sizing to make headings smaller on mobile and larger on desktop for better readability.
              </div>
            </TabsContent>

            <TabsContent value="translations" className="space-y-4">
              {translations.map((trans) => (
                <div key={trans.language_code} className="space-y-2">
                  <Label htmlFor={`trans-${trans.language_code}`}>
                    {trans.language_name} ({trans.language_code})
                  </Label>
                  <div className="flex gap-2">
                    <Textarea
                      id={`trans-${trans.language_code}`}
                      value={trans.translated_text}
                      onChange={(e) => {
                        setTranslations(prev =>
                          prev.map(t =>
                            t.language_code === trans.language_code
                              ? { ...t, translated_text: e.target.value }
                              : t
                          )
                        );
                      }}
                      rows={3}
                      className="resize-none flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={() =>
                        saveTranslation(trans.language_code, trans.translated_text)
                      }
                      disabled={saving}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
