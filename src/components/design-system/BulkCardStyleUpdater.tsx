import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Layers, Paintbrush, AlertTriangle } from 'lucide-react';
import { useColorSystem } from '@/hooks/useColorSystem';
import { getBackgroundStyleFromToken } from '@/lib/backgroundUtils';
import { resolveTextColor } from '@/lib/textColorUtils';
import { cn } from '@/lib/utils';

const SHADOW_OPTIONS = [
  { value: 'shadow-none', label: 'None' },
  { value: 'shadow-sm', label: 'Subtle' },
  { value: 'shadow-md', label: 'Medium' },
  { value: 'shadow-lg', label: 'Large' },
  { value: 'shadow-xl', label: 'X-Large' },
  { value: 'shadow-2xl', label: '2X-Large' },
];

const CARD_TYPE_PATTERNS = [
  { value: 'all', label: 'All Cards', pattern: '%' },
  { value: 'solution', label: 'Solution Cards', pattern: 'solution-card-%' },
  { value: 'metric', label: 'Metric Cards', pattern: '%metric%' },
  { value: 'feature', label: 'Feature Cards', pattern: '%feature%' },
  { value: 'function', label: 'Function Cards', pattern: 'function-%' },
  { value: 'architecture', label: 'Architecture Cards', pattern: 'architecture-%' },
  { value: 'trust', label: 'Trust/Proof Cards', pattern: '%trust%|%proof%' },
  { value: 'team', label: 'Team Cards', pattern: 'team-%' },
  { value: 'custom', label: 'Custom Pattern', pattern: '' },
];

export default function BulkCardStyleUpdater() {
  const [selectedType, setSelectedType] = useState('solution');
  const [customPattern, setCustomPattern] = useState('');
  const [matchingCount, setMatchingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Style selections
  const [newBackground, setNewBackground] = useState('bg-gradient-mesh-velvet');
  const [newTextColor, setNewTextColor] = useState('foreground');
  const [newShadow, setNewShadow] = useState('shadow-none');

  const { ALL_BACKGROUND_OPTIONS, TEXT_COLOR_OPTIONS, loading: colorLoading } = useColorSystem();

  // Count matching cards when pattern changes
  useEffect(() => {
    countMatchingCards();
  }, [selectedType, customPattern]);

  const getPattern = () => {
    const typeConfig = CARD_TYPE_PATTERNS.find(t => t.value === selectedType);
    if (selectedType === 'custom') {
      return customPattern || '%';
    }
    return typeConfig?.pattern || '%';
  };

  const countMatchingCards = async () => {
    setLoading(true);
    try {
      const pattern = getPattern();
      
      // Handle OR patterns (like '%trust%|%proof%')
      if (pattern.includes('|')) {
        const patterns = pattern.split('|');
        let total = 0;
        for (const p of patterns) {
          const { count } = await supabase
            .from('background_styles')
            .select('*', { count: 'exact', head: true })
            .like('element_id', p);
          total += count || 0;
        }
        setMatchingCount(total);
      } else {
        const { count } = await supabase
          .from('background_styles')
          .select('*', { count: 'exact', head: true })
          .like('element_id', pattern);
        setMatchingCount(count || 0);
      }
    } catch (error) {
      console.error('Error counting cards:', error);
      setMatchingCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    setUpdating(true);
    try {
      const pattern = getPattern();
      const updates: { background_class?: string; text_color_class?: string; shadow_class?: string } = {};
      
      if (newBackground) updates.background_class = newBackground;
      if (newTextColor) updates.text_color_class = newTextColor;
      if (newShadow) updates.shadow_class = newShadow;

      // Handle OR patterns
      if (pattern.includes('|')) {
        const patterns = pattern.split('|');
        let totalUpdated = 0;
        for (const p of patterns) {
          const { data, error } = await supabase
            .from('background_styles')
            .update(updates)
            .like('element_id', p)
            .select();
          if (error) throw error;
          totalUpdated += data?.length || 0;
        }
        toast.success(`Updated ${totalUpdated} cards successfully`);
      } else {
        const { data, error } = await supabase
          .from('background_styles')
          .update(updates)
          .like('element_id', pattern)
          .select();

        if (error) throw error;
        toast.success(`Updated ${data?.length || 0} cards successfully`);
      }

      setConfirmOpen(false);
    } catch (error) {
      console.error('Error updating cards:', error);
      toast.error('Failed to update cards');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card className="bg-background text-foreground">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Bulk Card Style Updater
        </CardTitle>
        <CardDescription>
          Update the styling of multiple cards at once
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Card Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Select Card Type</Label>
          <RadioGroup value={selectedType} onValueChange={setSelectedType} className="grid grid-cols-2 gap-2">
            {CARD_TYPE_PATTERNS.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <RadioGroupItem value={type.value} id={type.value} />
                <Label htmlFor={type.value} className="cursor-pointer text-sm">
                  {type.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {selectedType === 'custom' && (
            <div className="space-y-2 pt-2">
              <Label>Custom Pattern (SQL LIKE syntax)</Label>
              <Input
                placeholder="e.g., my-custom-card-%"
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use % as wildcard. Example: solution-% matches solution-card-1, solution-card-2, etc.
              </p>
            </div>
          )}

          <div className="text-sm bg-muted/50 rounded-lg p-3">
            <span className="font-medium">{loading ? '...' : matchingCount}</span> cards will be updated
          </div>
        </div>

        {/* New Style Selection */}
        <div className="space-y-4 border-t pt-4">
          <Label className="text-base font-semibold flex items-center gap-2">
            <Paintbrush className="w-4 h-4" />
            New Style
          </Label>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm">Preview</Label>
            <div
              className={cn('h-24 rounded-xl flex items-center justify-center', newShadow)}
              style={getBackgroundStyleFromToken(newBackground)}
            >
              <span
                className="font-semibold text-lg"
                style={{ color: resolveTextColor(newTextColor) }}
              >
                Card Preview
              </span>
            </div>
          </div>

          {/* Background */}
          <div className="space-y-2">
            <Label>Background</Label>
            <Select value={newBackground} onValueChange={setNewBackground}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {!colorLoading && ALL_BACKGROUND_OPTIONS.map((bg) => (
                  <SelectItem key={bg.value} value={bg.value}>
                    {bg.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Text Color */}
          <div className="space-y-2">
            <Label>Text Color</Label>
            <Select value={newTextColor} onValueChange={setNewTextColor}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {!colorLoading && TEXT_COLOR_OPTIONS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    {color.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shadow */}
          <div className="space-y-2">
            <Label>Shadow</Label>
            <Select value={newShadow} onValueChange={setNewShadow}>
              <SelectTrigger className="bg-background text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SHADOW_OPTIONS.map((shadow) => (
                  <SelectItem key={shadow.value} value={shadow.value}>
                    {shadow.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => setConfirmOpen(true)}
          disabled={matchingCount === 0 || loading}
        >
          Update {matchingCount} Cards
        </Button>

        {/* Confirmation Dialog */}
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Bulk Update
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will update the styling of <strong>{matchingCount} cards</strong> to the selected style.
                This action cannot be undone. Are you sure you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleBulkUpdate} disabled={updating}>
                {updating ? 'Updating...' : `Update ${matchingCount} Cards`}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}