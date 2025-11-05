import { useState } from 'react';
import { Paintbrush } from 'lucide-react';
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
  const { background, updateBackground, isLoading } = useBackgroundStyle(elementId, defaultBackground);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSave = async (newBackground: string) => {
    await updateBackground(newBackground);
  };

  if (isLoading) {
    return <div className={`${defaultBackground} ${className}`}>{children}</div>;
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => editMode && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={background}>
        {children}
      </div>

      {editMode && isHovered && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute top-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform z-10"
          title="Change background"
        >
          <Paintbrush className="w-4 h-4" />
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
