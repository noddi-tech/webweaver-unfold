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

interface KeyBenefitEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutionId: string;
  benefitIndex: number;
  field: 'heading' | 'description';
  onSave?: () => void;
}

export function KeyBenefitEditModal({
  open,
  onOpenChange,
  solutionId,
  benefitIndex,
  field,
  onSave,
}: KeyBenefitEditModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadContent();
    }
  }, [open, solutionId, benefitIndex, field]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solutions')
        .select('key_benefits')
        .eq('id', solutionId)
        .single();

      if (error) throw error;
      
      const benefits = data?.key_benefits;
      if (Array.isArray(benefits) && benefits[benefitIndex]) {
        const benefit = benefits[benefitIndex] as any;
        // Handle both 'text' and 'description' field names
        const value = field === 'description' 
          ? (benefit.description || benefit.text || '')
          : (benefit[field] || '');
        setContent(value);
      }
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
      // First, get current benefits
      const { data: currentData, error: fetchError } = await supabase
        .from('solutions')
        .select('key_benefits')
        .eq('id', solutionId)
        .single();

      if (fetchError) throw fetchError;

      const currentBenefits = currentData?.key_benefits;
      if (!Array.isArray(currentBenefits)) {
        throw new Error('Invalid benefits data');
      }

      const benefits = [...currentBenefits] as any[];
      
      if (benefits[benefitIndex]) {
        // Update the specific field
        if (field === 'description') {
          benefits[benefitIndex].description = content;
          // Also update 'text' field if it exists for backward compatibility
          if ('text' in benefits[benefitIndex]) {
            benefits[benefitIndex].text = content;
          }
        } else {
          benefits[benefitIndex][field] = content;
        }

        // Save back to database
        const { error: updateError } = await supabase
          .from('solutions')
          .update({ key_benefits: benefits })
          .eq('id', solutionId);

        if (updateError) throw updateError;

        toast.success('Content updated successfully');
        onOpenChange(false);
        
        if (onSave) {
          onSave();
        }
      }
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const isMultiline = field === 'description';
  const InputComponent = isMultiline ? Textarea : Input;
  const inputProps = isMultiline ? { rows: 6, className: 'resize-none' } : {};
  const fieldLabel = field === 'heading' ? 'Heading' : 'Description';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Key Benefit {fieldLabel}
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
              <Label htmlFor="content">{fieldLabel}</Label>
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
