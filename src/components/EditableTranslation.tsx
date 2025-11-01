import { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { TranslationEditModal } from './TranslationEditModal';
import { useAppTranslation } from '@/hooks/useAppTranslation';
import { supabase } from '@/integrations/supabase/client';

interface EditableTranslationProps {
  children: React.ReactNode;
  translationKey: string;
  className?: string;
  onSave?: () => void;
}

export function EditableTranslation({
  children,
  translationKey,
  className = '',
  onSave,
}: EditableTranslationProps) {
  const { editMode } = useEditMode();
  const { currentLanguage } = useAppTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [contentId, setContentId] = useState<string | null>(null);

  useEffect(() => {
    // Get the content ID for this translation key
    const fetchContentId = async () => {
      const { data } = await supabase
        .from('translations')
        .select('id')
        .eq('translation_key', translationKey)
        .eq('language_code', currentLanguage)
        .maybeSingle();
      
      if (data) {
        setContentId(data.id);
      }
    };

    if (editMode) {
      fetchContentId();
    }
  }, [editMode, translationKey, currentLanguage]);

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <span
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
              e.preventDefault();
              setModalOpen(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </span>

      <TranslationEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        contentId={contentId || ''}
        contentTable="translations"
        translationKey={translationKey}
        onSave={onSave}
      />
    </>
  );
}
