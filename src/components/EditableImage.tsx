import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { ImageEditModal } from './ImageEditModal';

interface EditableImageProps {
  children?: React.ReactNode;
  imageUrl: string | null;
  onSave: (newUrl: string) => void;
  altText?: string;
  placeholder?: string;
  aspectRatio?: string;
}

export function EditableImage({
  children,
  imageUrl,
  onSave,
  altText,
  placeholder = 'Click to add image',
  aspectRatio = 'auto',
}: EditableImageProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // If not in edit mode and no image, don't render anything
  if (!editMode && !imageUrl) {
    return null;
  }

  // If in edit mode but no image, show placeholder
  if (editMode && !imageUrl) {
    return (
      <>
        <div
          className="relative group cursor-pointer border-2 border-dashed border-muted-foreground/50 rounded-2xl overflow-hidden hover:border-primary transition-colors"
          style={{ aspectRatio }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setModalOpen(true)}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30">
            <Pencil className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{placeholder}</p>
          </div>
        </div>

        <ImageEditModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          currentUrl={''}
          onSave={onSave}
          altText={altText}
        />
      </>
    );
  }

  // If not in edit mode, just render children
  if (!editMode) {
    return <>{children}</>;
  }

  // In edit mode with image, show editable version
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
