import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { FAQEditModal } from './FAQEditModal';

interface EditableFAQProps {
  faqId: string;
  question: string;
  answer: string;
  onUpdate?: () => void;
  children: React.ReactNode;
}

export function EditableFAQ({ faqId, question, answer, onUpdate, children }: EditableFAQProps) {
  const { editMode } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

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
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg z-10 hover:bg-primary/90 transition-colors"
            aria-label="Edit FAQ"
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <FAQEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        faqId={faqId}
        currentQuestion={question}
        currentAnswer={answer}
        onUpdate={onUpdate}
      />
    </>
  );
}
