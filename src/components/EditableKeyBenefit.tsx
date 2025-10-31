import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { KeyBenefitEditModal } from './KeyBenefitEditModal';

interface EditableKeyBenefitProps {
  children: React.ReactNode;
  solutionId: string;
  benefitIndex: number;
  field: 'heading' | 'description';
  className?: string;
  onSave?: () => void;
}

export function EditableKeyBenefit({
  children,
  solutionId,
  benefitIndex,
  field,
  className = '',
  onSave,
}: EditableKeyBenefitProps) {
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
        onClick={() => setModalOpen(true)}
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

      <KeyBenefitEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        solutionId={solutionId}
        benefitIndex={benefitIndex}
        field={field}
        onSave={onSave}
      />
    </>
  );
}
