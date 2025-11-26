import { useState, useEffect } from 'react';
import * as React from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { RichTextEditModal } from './RichTextEditModal';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { supabase } from '@/integrations/supabase/client';

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
}

export function EditableTranslation({
  children,
  translationKey,
  className = '',
  onSave,
  fallbackText,
}: EditableTranslationProps) {
  const { editMode } = useEditMode();
  const { currentLanguage } = useAppTranslation();
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
        .select('id, translated_text, color_token, font_size, font_weight, is_italic, is_underline')
        .eq('translation_key', translationKey)
        .eq('language_code', currentLanguage)
        .maybeSingle();
      
      if (data) {
        setContentId(data.id);
        setDisplayText(data.translated_text);
        setStyleSettings({
          colorToken: data.color_token,
          fontSize: data.font_size,
          fontWeight: data.font_weight,
          isItalic: data.is_italic,
          isUnderline: data.is_underline,
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
    
    // Apply styling if available
    const styledContent = styleSettings ? (
      <span
        style={{
          color: styleSettings.colorToken ? `hsl(var(--${styleSettings.colorToken}))` : undefined,
          fontSize: styleSettings.fontSize ? `var(--font-size-${styleSettings.fontSize})` : undefined,
          fontWeight: styleSettings.fontWeight ? styleSettings.fontWeight : undefined,
          fontStyle: styleSettings.isItalic ? 'italic' : 'normal',
          textDecoration: styleSettings.isUnderline ? 'underline' : 'none',
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
          className={`relative inline-block group ${className}`}
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
