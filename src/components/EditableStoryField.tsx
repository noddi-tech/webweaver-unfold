import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface EditableStoryFieldProps {
  children: React.ReactNode;
  storyId: string;
  field: string;
  value: string | null;
  multiline?: boolean;
  className?: string;
}

export function EditableStoryField({
  children,
  storyId,
  field,
  value,
  multiline = false,
  className = '',
}: EditableStoryFieldProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!editMode) {
    return <>{children}</>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customer_stories')
        .update({ [field]: editValue })
        .eq('id', storyId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['customer-story'] });
      toast.success('Updated successfully');
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <button
            className="absolute -top-2 -right-2 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setEditValue(value || '');
              setModalOpen(true);
            }}
          >
            <Pencil className="h-3 w-3" />
          </button>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {field.replace(/_/g, ' ')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-field">Content</Label>
              {multiline ? (
                <Textarea
                  id="edit-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={8}
                  className="mt-1"
                />
              ) : (
                <Input
                  id="edit-field"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="mt-1"
                />
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EditableStoryImageProps {
  children: React.ReactNode;
  storyId: string;
  field: string;
  value: string | null;
  className?: string;
}

export function EditableStoryImage({
  children,
  storyId,
  field,
  value,
  className = '',
}: EditableStoryImageProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!editMode) {
    return <>{children}</>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customer_stories')
        .update({ [field]: editValue })
        .eq('id', storyId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['customer-story'] });
      toast.success('Image updated');
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating image:', error);
      toast.error('Failed to update image');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <button
            className="absolute top-2 right-2 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setEditValue(value || '');
              setModalOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editValue && (
              <img
                src={editValue}
                alt="Preview"
                className="w-full h-40 object-cover rounded-lg"
              />
            )}
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface EditableStoryResultsProps {
  children: React.ReactNode;
  storyId: string;
  results: Array<{ icon: string; metric: string; description: string }>;
  className?: string;
}

export function EditableStoryResults({
  children,
  storyId,
  results,
  className = '',
}: EditableStoryResultsProps) {
  const { editMode } = useEditMode();
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editResults, setEditResults] = useState(results);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  if (!editMode) {
    return <>{children}</>;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('customer_stories')
        .update({ results: editResults })
        .eq('id', storyId);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['customer-story'] });
      toast.success('Results updated');
      setModalOpen(false);
    } catch (error) {
      console.error('Error updating results:', error);
      toast.error('Failed to update results');
    } finally {
      setSaving(false);
    }
  };

  const updateResult = (index: number, field: string, value: string) => {
    setEditResults(prev => 
      prev.map((r, i) => i === index ? { ...r, [field]: value } : r)
    );
  };

  const iconOptions = ['Smile', 'Users', 'Calendar', 'Clock', 'TrendingUp', 'Star', 'Zap', 'Target', 'Award'];

  return (
    <>
      <div
        className={`relative group ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
        {isHovered && (
          <button
            className="absolute -top-2 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              setEditResults(results);
              setModalOpen(true);
            }}
          >
            <Pencil className="h-4 h-4" />
          </button>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Results Cards</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {editResults.map((result, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <h4 className="font-medium">Card {index + 1}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Icon</Label>
                    <select
                      value={result.icon}
                      onChange={(e) => updateResult(index, 'icon', e.target.value)}
                      className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Metric</Label>
                    <Input
                      value={result.metric}
                      onChange={(e) => updateResult(index, 'metric', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={result.description}
                    onChange={(e) => updateResult(index, 'description', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
