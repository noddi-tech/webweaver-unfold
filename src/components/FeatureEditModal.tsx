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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FeatureEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureId: string;
  field: 'title' | 'description';
  onSave?: () => void;
}

export function FeatureEditModal({
  open,
  onOpenChange,
  featureId,
  field,
  onSave,
}: FeatureEditModalProps) {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadFeature();
    }
  }, [open, featureId, field]);

  const loadFeature = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('features')
        .select(field)
        .eq('id', featureId)
        .single();

      if (error) throw error;
      setValue(data[field] || '');
    } catch (error) {
      console.error('Error loading feature:', error);
      toast.error('Failed to load feature');
    } finally {
      setLoading(false);
    }
  };

  const saveFeature = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('features')
        .update({ [field]: value })
        .eq('id', featureId);

      if (error) throw error;

      toast.success('Feature updated successfully');
      onSave?.();
      onOpenChange(false);
      window.location.reload();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast.error('Failed to save feature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edit Feature {field === 'title' ? 'Title' : 'Description'}
          </DialogTitle>
          <DialogDescription>
            Update the feature {field} below
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                {field === 'title' ? 'Title' : 'Description'}
              </Label>
              {field === 'title' ? (
                <Input
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              ) : (
                <Textarea
                  id="value"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              )}
            </div>
            <Button onClick={saveFeature} disabled={saving} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
