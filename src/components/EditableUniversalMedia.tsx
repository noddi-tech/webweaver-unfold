import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { UniversalImageCarouselModal } from './UniversalImageCarouselModal';

interface EditableUniversalMediaProps {
  children?: React.ReactNode;
  locationId: string;
  onSave: () => void;
  placeholder?: string;
  aspectRatio?: string;
}

export function EditableUniversalMedia({
  children,
  locationId,
  onSave,
  placeholder = 'Click to configure image/carousel',
  aspectRatio = 'auto',
}: EditableUniversalMediaProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // If not in edit mode, just render children
  if (!editMode) {
    return <>{children}</>;
  }

  // If no children provided, show placeholder
  if (!children) {
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

        <UniversalImageCarouselModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          locationId={locationId}
          onSave={onSave}
        />
      </>
    );
  }

  // In edit mode with content, show editable version
  return (
    <>
      <div
        className="relative group w-full h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity">
            <button
              className="p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
              onClick={() => setModalOpen(true)}
            >
              <Pencil className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <UniversalImageCarouselModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        locationId={locationId}
        onSave={onSave}
      />
    </>
  );
}
