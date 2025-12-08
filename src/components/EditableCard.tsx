import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { BackgroundTextColorProvider } from '@/contexts/BackgroundTextColorContext';
import { UnifiedStyleModal } from './UnifiedStyleModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { resolveTextColor } from '@/lib/textColorUtils';

interface EditableCardProps {
  children: React.ReactNode;
  elementIdPrefix: string;
  defaultBackground?: string;
  defaultTextColor?: string;
  className?: string;
}

/**
 * EditableCard - A unified wrapper for editable cards
 * 
 * Provides:
 * - Single edit button per card (opens UnifiedStyleModal)
 * - BackgroundTextColorContext for child text color inheritance
 * - Inline styles for backgrounds (gradients, glass, solids)
 * - Database as single source of truth
 */
export function EditableCard({
  children,
  elementIdPrefix,
  defaultBackground = 'glass-card',
  defaultTextColor = 'foreground',
  className,
}: EditableCardProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [background, setBackground] = useState(defaultBackground);
  const [textColor, setTextColor] = useState(defaultTextColor);
  const [iconColor, setIconColor] = useState('primary');
  const [iconBackground, setIconBackground] = useState('bg-primary/10');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved styles from database
  useEffect(() => {
    const loadStyles = async () => {
      setIsLoading(true);
      try {
        // Load background style
        const { data: bgData } = await supabase
          .from('background_styles')
          .select('background_class, text_color_class')
          .eq('element_id', `${elementIdPrefix}-background`)
          .maybeSingle();

        if (bgData?.background_class) {
          setBackground(bgData.background_class);
        }
        if (bgData?.text_color_class) {
          setTextColor(bgData.text_color_class);
        }

        // Load icon color
        const { data: iconColorData } = await supabase
          .from('text_content')
          .select('color_token')
          .eq('element_id', `${elementIdPrefix}-icon-color`)
          .maybeSingle();

        if (iconColorData?.color_token) {
          setIconColor(iconColorData.color_token);
        }

        // Load icon background
        const { data: iconBgData } = await supabase
          .from('background_styles')
          .select('background_class')
          .eq('element_id', `${elementIdPrefix}-icon-card`)
          .maybeSingle();

        if (iconBgData?.background_class) {
          setIconBackground(iconBgData.background_class);
        }
      } catch (error) {
        console.error('Error loading card styles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStyles();
  }, [elementIdPrefix]);

  // Build background style object for inline rendering
  const getBackgroundStyle = (): React.CSSProperties => {
    if (!background) return {};
    
    // Gradients
    if (background.includes('gradient')) {
      const cssVar = `--${background}`;
      return { backgroundImage: `var(${cssVar})` };
    }
    
    // Glass effects
    if (background.includes('glass') || background.includes('liquid')) {
      const cssVar = `--${background}`;
      return { 
        backgroundImage: `var(${cssVar})`,
        backdropFilter: 'blur(12px)',
      };
    }
    
    // Solid colors (bg-* classes)
    if (background.startsWith('bg-')) {
      const colorToken = background.replace('bg-', '').split('/')[0];
      return { backgroundColor: `hsl(var(--${colorToken}))` };
    }

    // Direct color tokens
    return { backgroundColor: `hsl(var(--${background}))` };
  };

  const handleSave = (data: any) => {
    if (data.background) setBackground(data.background);
    if (data.iconColor) setIconColor(data.iconColor);
    if (data.iconCardBg) setIconBackground(data.iconCardBg);
  };

  // Create context value for children
  const contextValue = {
    textColor,
    iconColor,
    iconBackground,
  };

  return (
    <div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Edit Button */}
      {editMode && isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="absolute top-2 right-2 z-50 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform"
          title="Edit card styles"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {/* Card Content with inherited styles */}
      <BackgroundTextColorProvider textColor={textColor}>
        <EditableCardContext.Provider value={contextValue}>
          <div style={getBackgroundStyle()} className="rounded-xl">
            {children}
          </div>
        </EditableCardContext.Provider>
      </BackgroundTextColorProvider>

      {/* Unified Style Modal */}
      <UnifiedStyleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        elementIdPrefix={elementIdPrefix}
        initialData={{
          background,
          iconColor,
        }}
        onSave={handleSave}
      />
    </div>
  );
}

// Context for card children to access styling
interface EditableCardContextValue {
  textColor: string;
  iconColor: string;
  iconBackground: string;
}

const EditableCardContext = React.createContext<EditableCardContextValue>({
  textColor: 'foreground',
  iconColor: 'primary',
  iconBackground: 'bg-primary/10',
});

export function useEditableCardContext() {
  return React.useContext(EditableCardContext);
}
