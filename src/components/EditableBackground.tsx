import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useBackgroundStyle } from '@/hooks/useBackgroundStyle';
import { BackgroundEditModal } from './BackgroundEditModal';

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
  const { background, textColor, updateBackground, isLoading } = useBackgroundStyle(elementId, defaultBackground);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = async (newBackground: string, newTextColor?: string) => {
    await updateBackground(newBackground, newTextColor);
  };

  if (isLoading) {
    return <>{children}</>;
  }

  // Clone the child and merge the background and text color className
  const childWithBackground = React.cloneElement(children as React.ReactElement, {
    className: `${(children as React.ReactElement).props.className || ''} ${background} ${textColor}`.trim()
  });

  return (
    <div
      className={`relative inline-block w-full ${className}`}
      onMouseEnter={() => editMode && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {childWithBackground}

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
