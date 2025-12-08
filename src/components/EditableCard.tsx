import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { BackgroundTextColorProvider } from '@/contexts/BackgroundTextColorContext';
import { UnifiedStyleModal } from './UnifiedStyleModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getBackgroundStyleFromToken } from '@/lib/backgroundUtils';

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

  // Use centralized utility for background styles
  const backgroundStyle = getBackgroundStyleFromToken(background);

  const handleSave = (data: any) => {
    if (data.background) setBackground(data.background);
    if (data.iconColor) setIconColor(data.iconColor);
    if (data.iconCardBg) setIconBackground(data.iconCardBg);
    // Update text color from title color (main text color for the card)
    if (data.titleColor) setTextColor(data.titleColor);
  };

  // Create context value for children
  const contextValue = {
    textColor,
    iconColor,
    iconBackground,
  };

  // Clone child element and apply background styles directly
  const childWithStyles = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        className: cn(
          (children as React.ReactElement<any>).props.className,
          'rounded-xl overflow-hidden'
        ),
        style: {
          ...((children as React.ReactElement<any>).props.style || {}),
          ...backgroundStyle,
        },
      })
    : children;

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
          {childWithStyles}
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
