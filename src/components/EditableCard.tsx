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
  const { backgroundStyles, iconStyles, refreshBackgroundStyles } = useSiteStyles();
  
  // Read saved values directly from context on every render (fixes navigation persistence)
  const savedBg = backgroundStyles[`${elementIdPrefix}-background`];
  const savedIconBg = backgroundStyles[`${elementIdPrefix}-icon-card`];
  const savedIconStyle = iconStyles[`${elementIdPrefix}-icon`];
  
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Local state only for unsaved edits during editing session
  const [localBackground, setLocalBackground] = useState<string | null>(null);
  const [localTextColor, setLocalTextColor] = useState<string | null>(null);
  const [localCardShadow, setLocalCardShadow] = useState<string | null>(null);
  const [localIconColor, setLocalIconColor] = useState<string | null>(null);
  const [localIconBackground, setLocalIconBackground] = useState<string | null>(null);
  const [localIconSize, setLocalIconSize] = useState<string | null>(null);

  // Derive current values: local override ?? saved from context ?? default
  const background = localBackground ?? savedBg?.background_class ?? defaultBackground;
  const textColor = localTextColor ?? savedBg?.text_color_class ?? defaultTextColor;
  const cardShadow = localCardShadow ?? 'shadow-none';
  const iconColor = localIconColor ?? savedIconStyle?.icon_color_token ?? 'primary';
  const iconBackground = localIconBackground ?? savedIconBg?.background_class ?? 'bg-primary/10';
  const iconSize = localIconSize ?? savedIconStyle?.size ?? 'default';

  // Use centralized utility for background styles
  const backgroundStyle = getBackgroundStyleFromToken(background);

  const handleSave = async (data: any) => {
    // Reset local overrides after save - context will have the new values after refresh
    setLocalBackground(null);
    setLocalTextColor(null);
    setLocalCardShadow(null);
    setLocalIconColor(null);
    setLocalIconBackground(null);
    setLocalIconSize(null);
    
    // Refresh context to pick up newly saved values from database
    await refreshBackgroundStyles();
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
