import React, { useState } from 'react';
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

// Helper to extract text from React children
const extractTextFromChildren = (children: React.ReactNode): string => {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  if (React.isValidElement(children) && children.props.children) {
    return extractTextFromChildren(children.props.children);
  }
  return '';
};

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

  // Extract actual text content from children
  const textContent = extractTextFromChildren(children);
  const isEmpty = !textContent || textContent.trim().length === 0;

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`relative block group min-h-[60px] w-full ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isEmpty ? (
          <div className="text-muted-foreground/50 italic p-4 border-2 border-dashed border-muted-foreground/20 rounded-lg">
            Click to add {field === 'heading' ? 'heading' : 'description'}
          </div>
        ) : (
          children
        )}
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
