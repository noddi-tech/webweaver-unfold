import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { ButtonEditModal } from './ButtonEditModal';

interface EditableButtonProps {
  children: React.ReactNode;
  buttonText: string | null;
  buttonUrl: string | null;
  buttonBgColor?: string;
  buttonIcon?: string;
  buttonTextColor?: string;
  onSave: (text: string, url: string) => void;
  onBgColorChange?: (color: string) => void;
  onIconChange?: (icon: string) => void;
  onTextColorChange?: (color: string) => void;
  className?: string;
}

export function EditableButton({
  children,
  buttonText,
  buttonUrl,
  buttonBgColor = 'primary',
  buttonIcon = '',
  buttonTextColor = 'white',
  onSave,
  onBgColorChange,
  onIconChange,
  onTextColorChange,
  className = '',
}: EditableButtonProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`relative inline-block group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <button
            className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <ButtonEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        buttonText={buttonText || ''}
        buttonUrl={buttonUrl || ''}
        buttonBgColor={buttonBgColor}
        buttonIcon={buttonIcon}
        buttonTextColor={buttonTextColor}
        onSave={(text, url, bgColor, icon, textColor) => {
          onSave(text, url);
          if (onBgColorChange) {
            onBgColorChange(bgColor);
          }
          if (onIconChange) {
            onIconChange(icon);
          }
          if (onTextColorChange) {
            onTextColorChange(textColor);
          }
        }}
      />
    </>
  );
}
