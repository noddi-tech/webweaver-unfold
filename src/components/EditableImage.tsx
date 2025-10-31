import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { ImageEditModal } from './ImageEditModal';

interface EditableImageProps {
  children: React.ReactNode;
  imageUrl: string;
  onSave: (newUrl: string) => void;
  altText?: string;
}

export function EditableImage({
  children,
  imageUrl,
  onSave,
  altText,
}: EditableImageProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className="relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity">
            <button
              className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
              onClick={() => setModalOpen(true)}
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <ImageEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentUrl={imageUrl}
        onSave={onSave}
        altText={altText}
      />
    </>
  );
}
