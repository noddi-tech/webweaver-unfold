import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Star, Plus, Trash2, Check } from 'lucide-react';
import { getBackgroundStyleFromToken } from '@/lib/backgroundUtils';
import { resolveTextColor } from '@/lib/textColorUtils';

interface CardStylePreset {
  id: string;
  name: string;
  description: string | null;
  background_class: string;
  text_color_class: string;
  icon_color_token: string | null;
  icon_size: string | null;
  shadow_class: string | null;
  border_radius: string | null;
  is_system_preset: boolean;
}

interface CardStylePresetPickerProps {
  onApply: (preset: CardStylePreset) => void;
  currentBackground?: string;
  currentTextColor?: string;
  currentShadow?: string;
}

export function CardStylePresetPicker({
  onApply,
  currentBackground,
  currentTextColor,
  currentShadow,
}: CardStylePresetPickerProps) {
  const [presets, setPresets] = useState<CardStylePreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('card_style_presets')
        .select('*')
        .order('is_system_preset', { ascending: false })
        .order('name');

      if (error) throw error;
      setPresets(data || []);
    } catch (error) {
      console.error('Error loading presets:', error);
      toast.error('Failed to load presets');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreset = async () => {
    if (!newPresetName.trim()) {
      toast.error('Please enter a preset name');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('card_style_presets')
        .insert({
          name: newPresetName.trim(),
          description: newPresetDescription.trim() || null,
          background_class: currentBackground || 'bg-card',
          text_color_class: currentTextColor || 'foreground',
          shadow_class: currentShadow || 'shadow-none',
          is_system_preset: false,
        });

      if (error) throw error;

      toast.success('Preset saved successfully');
      setSaveDialogOpen(false);
      setNewPresetName('');
      setNewPresetDescription('');
      loadPresets();
    } catch (error) {
      console.error('Error saving preset:', error);
      toast.error('Failed to save preset');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePreset = async (preset: CardStylePreset) => {
    if (preset.is_system_preset) {
      toast.error('Cannot delete system presets');
      return;
    }

    try {
      const { error } = await supabase
        .from('card_style_presets')
        .delete()
        .eq('id', preset.id);

      if (error) throw error;
      toast.success('Preset deleted');
      loadPresets();
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Failed to delete preset');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Style Presets</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSaveDialogOpen(true)}
          className="gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Save Current
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
        {presets.map((preset) => {
          const bgStyle = getBackgroundStyleFromToken(preset.background_class);
          const textStyle = { color: resolveTextColor(preset.text_color_class) };
          
          return (
            <Card
              key={preset.id}
              className={cn(
                'p-2 cursor-pointer transition-all hover:shadow-md group relative',
                'hover:ring-1 hover:ring-border'
              )}
              onClick={() => onApply(preset)}
            >
              {/* Preview */}
              <div
                className={cn(
                  'h-16 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden',
                  preset.shadow_class,
                  preset.border_radius
                )}
                style={bgStyle}
              >
                <span 
                  className="text-xs font-medium"
                  style={textStyle}
                >
                  Aa
                </span>
                
                {/* System preset badge */}
                {preset.is_system_preset && (
                  <Star className="absolute top-1 left-1 w-3 h-3 text-amber-400 fill-amber-400" />
                )}
                
                {/* Delete button for custom presets */}
                {!preset.is_system_preset && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              <h4 className="font-medium text-xs truncate">{preset.name}</h4>
              {preset.description && (
                <p className="text-xs text-muted-foreground truncate">{preset.description}</p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Style Preset</DialogTitle>
            <DialogDescription>
              Save the current card styling as a reusable preset
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Preset Name</Label>
              <Input
                placeholder="e.g., Purple Gradient Card"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                placeholder="e.g., Dark purple gradient with white text"
                value={newPresetDescription}
                onChange={(e) => setNewPresetDescription(e.target.value)}
              />
            </div>

            {/* Preview of what will be saved */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div
                className={cn(
                  'h-20 rounded-lg flex items-center justify-center',
                  currentShadow
                )}
                style={getBackgroundStyleFromToken(currentBackground || 'bg-card')}
              >
                <span 
                  className="font-medium"
                  style={{ color: resolveTextColor(currentTextColor || 'foreground') }}
                >
                  Sample Text
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePreset} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preset'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}