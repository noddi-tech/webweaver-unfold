import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useBackgroundStyle } from '@/hooks/useBackgroundStyle';
import { BackgroundEditModal } from './BackgroundEditModal';
import { BackgroundTextColorProvider } from '@/contexts/BackgroundTextColorContext';

interface EditableBackgroundProps {
  children: React.ReactNode;
  elementId: string;
  defaultBackground?: string;
  allowedBackgrounds?: string[];
  className?: string;
}

export function EditableBackground({
  children,
  elementId,
  defaultBackground = 'bg-card',
  allowedBackgrounds,
  className = ''
}: EditableBackgroundProps) {
  const { editMode } = useEditMode();
  const { background, backgroundStyle, textColor, updateBackground, isLoading } = useBackgroundStyle(elementId, defaultBackground);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = async (newBackground: string, newTextColor?: string) => {
    await updateBackground(newBackground, newTextColor);
  };

  if (isLoading) {
    // Apply defaultBackground during loading to prevent flash
    const childWithDefault = React.cloneElement(children as React.ReactElement, {
      className: `${(children as React.ReactElement).props.className || ''} ${defaultBackground}`.trim(),
    });
    return (
      <div className={`relative block h-full w-full ${className}`}>
        {childWithDefault}
      </div>
    );
  }

  // Clone the child and apply background via inline style, plus background class for fallback
  const childWithBackground = React.cloneElement(children as React.ReactElement, {
    className: `${(children as React.ReactElement).props.className || ''} ${background} ${textColor}`.trim(),
    style: {
      ...((children as React.ReactElement).props.style || {}),
      ...backgroundStyle,
    },
  });

  // Wrap children with text color context for inheritance
  const wrappedChildren = (
    <BackgroundTextColorProvider textColor={textColor}>
      {childWithBackground}
    </BackgroundTextColorProvider>
  );

  return (
    <div
      className={`relative block h-full w-full ${className}`}
      onMouseEnter={() => editMode && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {wrappedChildren}

      {editMode && isHovered && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform z-50"
          title="Change background color"
        >
          <Palette className="w-5 h-5" />
        </button>
      )}

      <BackgroundEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentBackground={background}
        onSave={handleSave}
        allowedBackgrounds={allowedBackgrounds}
      />
    </div>
  );
}
