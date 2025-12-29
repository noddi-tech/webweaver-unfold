import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { BackgroundTextColorProvider } from '@/contexts/BackgroundTextColorContext';
import { UnifiedStyleModal } from './UnifiedStyleModal';
import { useSiteStyles } from '@/contexts/SiteStylesContext';
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
 * - Uses preloaded SiteStylesContext to prevent flash
 */
export function EditableCard({
  children,
  elementIdPrefix,
  defaultBackground = 'glass-card',
  defaultTextColor = 'foreground',
  className,
}: EditableCardProps) {
  const { editMode } = useEditMode();
  const { backgroundStyles, iconStyles, isLoaded } = useSiteStyles();
  
  // Get preloaded values from context (no flash!)
  const preloadedBg = backgroundStyles[`${elementIdPrefix}-background`];
  const preloadedIconBg = backgroundStyles[`${elementIdPrefix}-icon-card`];
  const preloadedIconStyle = iconStyles[`${elementIdPrefix}-icon`];
  
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Initialize from preloaded context or fall back to defaults
  const [background, setBackground] = useState(
    preloadedBg?.background_class || defaultBackground
  );
  const [textColor, setTextColor] = useState(
    preloadedBg?.text_color_class || defaultTextColor
  );
  const [cardShadow, setCardShadow] = useState('shadow-none');
  const [iconColor, setIconColor] = useState(
    preloadedIconStyle?.icon_color_token || 'primary'
  );
  const [iconBackground, setIconBackground] = useState(
    preloadedIconBg?.background_class || 'bg-primary/10'
  );
  const [iconSize, setIconSize] = useState(
    preloadedIconStyle?.size || 'default'
  );

  // Sync state when context loads (for cases where component mounted before context)
  useEffect(() => {
    if (isLoaded) {
      const bg = backgroundStyles[`${elementIdPrefix}-background`];
      const iconBg = backgroundStyles[`${elementIdPrefix}-icon-card`];
      const iconStyle = iconStyles[`${elementIdPrefix}-icon`];
      
      if (bg?.background_class) setBackground(bg.background_class);
      if (bg?.text_color_class) setTextColor(bg.text_color_class);
      if (iconBg?.background_class) setIconBackground(iconBg.background_class);
      if (iconStyle?.icon_color_token) setIconColor(iconStyle.icon_color_token);
      if (iconStyle?.size) setIconSize(iconStyle.size);
    }
  }, [isLoaded, elementIdPrefix, backgroundStyles, iconStyles]);

  // Use centralized utility for background styles
  const backgroundStyle = getBackgroundStyleFromToken(background);

  // Non-blocking: content renders immediately with defaults, DB styles apply when loaded

  const handleSave = (data: any) => {
    if (data.background) setBackground(data.background);
    if (data.iconColor) setIconColor(data.iconColor);
    if (data.iconCardBg) setIconBackground(data.iconCardBg);
    if (data.iconSize) setIconSize(data.iconSize);
    if (data.cardShadow) setCardShadow(data.cardShadow);
    // Update text color from title color (main text color for the card)
    if (data.titleColor) setTextColor(data.titleColor);
  };

  // Create context value for children
  const contextValue = {
    textColor,
    iconColor,
    iconBackground,
    iconSize,
  };

  // Apply background to wrapper div instead of cloning children
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden transition-opacity duration-300',
        cardShadow,
        className
      )}
      style={backgroundStyle}
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
          {children}
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
  iconSize: string;
}

const EditableCardContext = React.createContext<EditableCardContextValue>({
  textColor: 'foreground',
  iconColor: 'primary',
  iconBackground: 'bg-primary/10',
  iconSize: 'default',
});

export function useEditableCardContext() {
  return React.useContext(EditableCardContext);
}
