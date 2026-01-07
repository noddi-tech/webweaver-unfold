import { useState, useEffect } from 'react';
import * as React from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { RichTextEditModal } from './RichTextEditModal';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { supabase } from '@/integrations/supabase/client';
import { resolveTextColor } from '@/lib/textColorUtils';
import { useBackgroundTextColor } from '@/contexts/BackgroundTextColorContext';

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

// Helper function to recursively extract text from React children
const extractTextFromChildren = (children: React.ReactNode): string => {
  let text = '';
  
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      text += child;
    } else if (React.isValidElement(child) && child.props.children) {
      text += extractTextFromChildren(child.props.children);
    }
  });
  
  return text.trim();
};

interface EditableTranslationProps {
  children: React.ReactNode;
  translationKey: string;
  className?: string;
  onSave?: () => void;
  fallbackText?: string;
  /**
   * When true, EditableTranslation will NOT inject inline color/typography styles.
   * It will render the translated text using the parent element's classes.
   */
  disableStyling?: boolean;
}

export function EditableTranslation({
  children,
  translationKey,
  className = '',
  onSave,
  fallbackText,
  disableStyling = false,
}: EditableTranslationProps) {
  const { editMode } = useEditMode();
  const { currentLanguage } = useAppTranslation();
  const { inheritedTextColor } = useBackgroundTextColor();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [displayText, setDisplayText] = useState<string | null>(null);
  const [styleSettings, setStyleSettings] = useState<any>(null);

  useEffect(() => {
    // Fetch the actual translation from the database
    const fetchTranslation = async () => {
      const { data } = await supabase
        .from('translations')
        .select('id, translated_text, color_token, font_size, font_size_mobile, font_size_tablet, font_size_desktop, font_weight, is_italic, is_underline')
        .eq('translation_key', translationKey)
        .eq('language_code', currentLanguage)
        .maybeSingle();
      
      if (data) {
        setContentId(data.id);
        setDisplayText(data.translated_text);
        
        // If styling is NULL for current language, fetch from English as fallback
        let stylingSource = data;
        if (!data.color_token && currentLanguage !== 'en') {
          const { data: englishData } = await supabase
            .from('translations')
            .select('color_token, font_size, font_size_mobile, font_size_tablet, font_size_desktop, font_weight, is_italic, is_underline')
            .eq('translation_key', translationKey)
            .eq('language_code', 'en')
            .maybeSingle();
          
          if (englishData) {
            stylingSource = { ...data, ...englishData };
          }
        }
        
        setStyleSettings({
          colorToken: stylingSource.color_token || 'foreground',
          fontSize: stylingSource.font_size || 'base',
          fontSizeMobile: stylingSource.font_size_mobile || 'inherit',
          fontSizeTablet: stylingSource.font_size_tablet || 'inherit',
          fontSizeDesktop: stylingSource.font_size_desktop || 'inherit',
          fontWeight: stylingSource.font_weight || 'normal',
          isItalic: stylingSource.is_italic || false,
          isUnderline: stylingSource.is_underline || false,
        });
      } else {
        setDisplayText(null);
        setStyleSettings(null);
      }
    };

    // Always fetch translation, regardless of edit mode
    fetchTranslation();
  }, [translationKey, currentLanguage, refreshKey]);

  const handleSave = () => {
    setRefreshKey(prev => prev + 1);
    onSave?.();
  };

  // Preserve element structure (h1, p, etc.) while injecting translated text with styling
  const renderContent = () => {
    // If no displayText, render children as-is
    if (!displayText) {
      return children;
    }

    // For contexts where parent classes should control presentation (e.g. cards), skip inline styles.
    if (disableStyling) {
      if (React.isValidElement(children)) {
        return React.cloneElement(children, {}, displayText);
      }
      return displayText;
    }

    // Apply styling if available
    // Only apply fontSize/fontWeight if they're NOT the default values
    // 'base' and 'normal' mean "inherit from element" not "override"

    // Determine effective color: use inherited from background if default, otherwise use explicit setting
    const effectiveColorToken = (styleSettings?.colorToken === 'foreground' || !styleSettings?.colorToken)
      ? (inheritedTextColor ? inheritedTextColor.replace('text-', '') : 'foreground')
      : styleSettings?.colorToken;

    const isEffectiveGradient = effectiveColorToken?.includes('gradient');

    const styledContent = styleSettings ? (
      <span
        data-responsive-font
        style={{
          // Apply gradient text styling if gradient token, otherwise solid color
          ...(isEffectiveGradient ? {
            background: `var(--${effectiveColorToken})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
          } : {
            color: effectiveColorToken
              ? resolveTextColor(effectiveColorToken)
              : undefined,
            // Override any inherited gradient-text effect for solid colors
            WebkitTextFillColor: effectiveColorToken
              ? resolveTextColor(effectiveColorToken)
              : undefined,
            background: 'none',
            WebkitBackgroundClip: 'unset',
            backgroundClip: 'unset',
          }),
          fontSize: styleSettings.fontSize && styleSettings.fontSize !== 'base'
            ? FONT_SIZE_MAP[styleSettings.fontSize]
            : undefined,
          fontWeight: styleSettings.fontWeight && styleSettings.fontWeight !== 'normal'
            ? FONT_WEIGHT_MAP[styleSettings.fontWeight]
            : undefined,
          fontStyle: styleSettings.isItalic ? 'italic' : 'normal',
          textDecoration: styleSettings.isUnderline ? 'underline' : 'none',
          '--font-size-mobile': styleSettings.fontSizeMobile && styleSettings.fontSizeMobile !== 'inherit' && styleSettings.fontSizeMobile !== 'base'
            ? FONT_SIZE_MAP[styleSettings.fontSizeMobile]
            : undefined,
          '--font-size-tablet': styleSettings.fontSizeTablet && styleSettings.fontSizeTablet !== 'inherit' && styleSettings.fontSizeTablet !== 'base'
            ? FONT_SIZE_MAP[styleSettings.fontSizeTablet]
            : undefined,
          '--font-size-desktop': styleSettings.fontSizeDesktop && styleSettings.fontSizeDesktop !== 'inherit' && styleSettings.fontSizeDesktop !== 'base'
            ? FONT_SIZE_MAP[styleSettings.fontSizeDesktop]
            : undefined,
        } as React.CSSProperties & {
          '--font-size-mobile'?: string;
          '--font-size-tablet'?: string;
          '--font-size-desktop'?: string;
        }}
      >
        {displayText}
      </span>
    ) : displayText;

    // If displayText exists and children is a valid element, clone it with styled text
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {}, styledContent);
    }

    // Fallback: just return styled text
    return styledContent;
  };

  return (
    <>
      {editMode ? (
        <span
          key={refreshKey}
          className={`relative inline-flex items-baseline group pr-4 pt-3 -mr-4 -mt-3 ${className}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {renderContent()}
          {isHovered && (
            <button
              className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setModalOpen(true);
              }}
            >
              <Pencil className="h-3 w-3" />
            </button>
          )}
        </span>
      ) : (
        renderContent()
      )}

      {editMode && (
        <RichTextEditModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          contentId={contentId || ''}
          contentTable="translations"
          translationKey={translationKey}
          onSave={handleSave}
          fallbackText={fallbackText || extractTextFromChildren(children)}
        />
      )}
    </>
  );
}
