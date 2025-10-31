import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { TranslationEditModal } from './TranslationEditModal';

interface EditableTextProps {
  children: React.ReactNode;
  contentId: string;
  translationKey?: string;
  className?: string;
}

export function EditableText({
  children,
  contentId,
  translationKey,
  className = '',
}: EditableTextProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <button
            className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <TranslationEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        contentId={contentId}
        contentTable="text_content"
        translationKey={translationKey}
      />
    </>
  );
}
