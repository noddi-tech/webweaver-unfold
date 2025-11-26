import { useState, useEffect } from 'react';
import { Pencil, Palette } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { EnhancedTextEditModal } from './EnhancedTextEditModal';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface EditableTextWithColorProps {
  children: React.ReactNode;
  elementId: string;
  translationKey?: string;
  className?: string;
  currentBackgroundClass?: string;
  onSave?: () => void;
}

export function EditableTextWithColor({
  children,
  elementId,
  translationKey,
  className = '',
  currentBackgroundClass = 'bg-background',
  onSave,
}: EditableTextWithColorProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [colorToken, setColorToken] = useState<string>('foreground');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (editMode) {
      loadColorToken();
    }
  }, [editMode, elementId, refreshKey]);

  const loadColorToken = async () => {
    try {
      // @ts-ignore
      const { data } = await supabase
        .from('text_content')
        .select('color_token')
        .eq('element_id', elementId)
        .maybeSingle();

      if (data?.color_token) {
        setColorToken(data.color_token);
      }
    } catch (error) {
      console.error('Error loading color token:', error);
    }
  };

  const handleSave = () => {
    setRefreshKey(prev => prev + 1);
    loadColorToken();
    onSave?.();
  };

  if (!editMode) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={cn('relative group', className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <div className="absolute -top-2 -right-2 flex gap-1 z-10">
            <button
              className="p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              title="Edit text and color"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 border-primary shadow-lg',
                `bg-${colorToken}`
              )}
              style={{
                backgroundColor: `hsl(var(--${colorToken}))`,
              }}
              title={`Current color: ${colorToken}`}
            />
          </div>
        )}
      </div>

      <EnhancedTextEditModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        elementId={elementId}
        translationKey={translationKey}
        currentBackgroundClass={currentBackgroundClass}
        onSave={handleSave}
      />
    </>
  );
}
