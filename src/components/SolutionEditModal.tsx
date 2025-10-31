import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pencil, Save } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SolutionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutionId: string;
  field: string;
  onSave?: () => void;
}

const fieldLabels: Record<string, string> = {
  hero_title: 'Hero Title',
  hero_subtitle: 'Hero Subtitle',
  hero_description: 'Hero Description',
  hero_cta_text: 'Hero CTA Text',
  description_heading: 'Description Heading',
  description_text: 'Description Text',
  footer_heading: 'Footer Heading',
  footer_text: 'Footer Text',
  footer_cta_text: 'Footer CTA Text',
};

export function SolutionEditModal({
  open,
  onOpenChange,
  solutionId,
  field,
  onSave,
}: SolutionEditModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadContent();
    }
  }, [open, solutionId, field]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select(field)
        .eq('id', solutionId)
        .single();

      if (error) throw error;
      setContent(data?.[field] || '');
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('solutions')
        .update({ [field]: content })
        .eq('id', solutionId);

      if (error) throw error;

      toast.success('Content updated successfully');
      onOpenChange(false);
      
      // Trigger content refresh without page reload
      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const isMultiline = field.includes('description') || field.includes('text');
  const InputComponent = isMultiline ? Textarea : Input;
  const inputProps = isMultiline ? { rows: 6, className: 'resize-none' } : {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit {fieldLabels[field] || field}
          </DialogTitle>
          <DialogDescription>
            Update the content below and click save
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <InputComponent
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                {...inputProps}
              />
            </div>
            <Button onClick={saveContent} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Content'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
