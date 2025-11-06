import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getColorTokenOptions, calculateContrastRatio, getContrastLevel } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';

interface EnhancedTextEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementId: string;
  translationKey?: string;
  currentBackgroundClass?: string;
  onSave?: () => void;
}

export function EnhancedTextEditModal({
  open,
  onOpenChange,
  elementId,
  translationKey,
  currentBackgroundClass = 'bg-background',
  onSave,
}: EnhancedTextEditModalProps) {
  const [content, setContent] = useState('');
  const [colorToken, setColorToken] = useState('foreground');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contrastRatio, setContrastRatio] = useState<number | null>(null);

  const colorOptions = getColorTokenOptions();

  useEffect(() => {
    if (open) {
      loadContent();
    }
  }, [open, elementId]);

  useEffect(() => {
    if (colorToken && currentBackgroundClass) {
      calculateContrast();
    }
  }, [colorToken, currentBackgroundClass]);

  const loadContent = async () => {
    setLoading(true);
    try {
      // @ts-ignore - TypeScript has issues with complex Supabase generic types
      const { data, error } = await supabase
        .from('text_content')
        .select('content, color_token')
        .eq('element_id', elementId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setContent(data.content || '');
        setColorToken(data.color_token || 'foreground');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const calculateContrast = () => {
    try {
      // Extract background color from CSS variable
      const bgMatch = currentBackgroundClass.match(/bg-(\w+(?:-\w+)*)/);
      const fgColor = colorToken;
      
      if (bgMatch) {
        const bgColor = bgMatch[1];
        // Get CSS variable values
        const bgValue = getComputedStyle(document.documentElement).getPropertyValue(`--${bgColor}`).trim();
        const fgValue = getComputedStyle(document.documentElement).getPropertyValue(`--${fgColor}`).trim();
        
        if (bgValue && fgValue) {
          const ratio = calculateContrastRatio(
            `hsl(${bgValue})`,
            `hsl(${fgValue})`
          );
          setContrastRatio(ratio);
        }
      }
    } catch (error) {
      console.error('Error calculating contrast:', error);
      setContrastRatio(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if record exists
      // @ts-ignore
      const { data: existing } = await supabase
        .from('text_content')
        .select('id')
        .eq('element_id', elementId)
        .maybeSingle();

      if (existing) {
        // @ts-ignore
        const { error } = await supabase
          .from('text_content')
          .update({ content, color_token: colorToken })
          .eq('element_id', elementId);
        if (error) throw error;
      } else {
        // @ts-ignore
        const { error } = await supabase
          .from('text_content')
          .insert({
            element_id: elementId,
            content,
            color_token: colorToken,
            element_type: 'text',
            page_location: 'unknown',
            section: 'unknown',
          });
        if (error) throw error;
      }

      toast.success('Content saved successfully');
      onSave?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const getAccessibilityBadge = () => {
    if (contrastRatio === null) return null;
    
    const level = getContrastLevel(contrastRatio);
    const badgeConfig = {
      'AAA': { icon: CheckCircle, className: 'bg-green-500/20 text-green-300 border-green-500/50' },
      'AA': { icon: CheckCircle, className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
      'AA Large': { icon: Info, className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
      'Fail': { icon: AlertCircle, className: 'bg-red-500/20 text-red-300 border-red-500/50' },
    };

    const config = badgeConfig[level as keyof typeof badgeConfig];
    const Icon = config.icon;

    return (
      <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg border', config.className)}>
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">
          {contrastRatio.toFixed(1)}:1 ({level})
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Text Content & Styling</DialogTitle>
          <DialogDescription>
            Edit the text content and choose the color. See real-time accessibility scores.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="styling">Styling & Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter your text content..."
                className="min-h-[150px]"
                disabled={loading}
              />
            </div>
          </TabsContent>

          <TabsContent value="styling" className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Text Color</label>
              <Select value={colorToken} onValueChange={setColorToken}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-4 h-4 rounded border', `text-${option.value}`)} 
                             style={{ backgroundColor: 'currentColor' }} />
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Live Preview</label>
              <div className={cn('p-6 rounded-lg border', currentBackgroundClass)}>
                <p className={cn('text-lg', `text-${colorToken}`)}>
                  {content || 'Your text will appear here...'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Accessibility Score</label>
              {getAccessibilityBadge()}
              {contrastRatio && contrastRatio < 4.5 && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-300">
                    <p className="font-medium">Poor Contrast</p>
                    <p className="text-red-300/80">
                      This color combination does not meet WCAG AA standards (requires 4.5:1 for normal text).
                      Consider choosing a different color for better readability.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
