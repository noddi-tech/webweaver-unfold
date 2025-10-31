import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { FeatureEditModal } from './FeatureEditModal';

interface EditableFeatureProps {
  children: React.ReactNode;
  featureId: string;
  field: 'title' | 'description';
  className?: string;
  onSave?: () => void;
}

export function EditableFeature({
  children,
  featureId,
  field,
  className = '',
  onSave,
}: EditableFeatureProps) {
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
              e.stopPropagation();
              setModalOpen(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <FeatureEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        featureId={featureId}
        field={field}
        onSave={onSave}
      />
    </>
  );
}
