import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Settings, Palette, Type, Image as ImageIcon, MousePointer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getColorTokenOptions, calculateContrastRatio, getContrastLevel } from '@/lib/colorUtils';
import { cn } from '@/lib/utils';

interface SubElement {
  id: string;
  label: string;
  type: 'text' | 'color' | 'background' | 'image' | 'url';
  value: string;
}

interface UnifiedStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  elementIdPrefix: string;
  initialData?: {
    background?: string;
    number?: string;
    numberColor?: string;
    title?: string;
    titleColor?: string;
    description?: string;
    descriptionColor?: string;
    ctaText?: string;
    ctaUrl?: string;
    ctaBgColor?: string;
    ctaTextColor?: string;
  };
  onSave?: (data: any) => void;
}

export function UnifiedStyleModal({
  isOpen,
  onClose,
  elementIdPrefix,
  initialData = {},
  onSave,
}: UnifiedStyleModalProps) {
  const [activeTab, setActiveTab] = useState('background');
  const [saving, setSaving] = useState(false);
  
  // State for all editable elements
  const [background, setBackground] = useState(initialData.background || 'bg-card');
  const [number, setNumber] = useState(initialData.number || '');
  const [numberColor, setNumberColor] = useState(initialData.numberColor || 'foreground');
  const [title, setTitle] = useState(initialData.title || '');
  const [titleColor, setTitleColor] = useState(initialData.titleColor || 'foreground');
  const [description, setDescription] = useState(initialData.description || '');
  const [descriptionColor, setDescriptionColor] = useState(initialData.descriptionColor || 'muted-foreground');
  const [ctaText, setCtaText] = useState(initialData.ctaText || '');
  const [ctaUrl, setCtaUrl] = useState(initialData.ctaUrl || '');
  const [ctaBgColor, setCtaBgColor] = useState(initialData.ctaBgColor || 'primary');
  const [ctaTextColor, setCtaTextColor] = useState(initialData.ctaTextColor || 'primary-foreground');

  const colorOptions = getColorTokenOptions();

  const backgroundOptions = [
    { value: 'bg-card', label: 'Card' },
    { value: 'bg-card/50', label: 'Card (50%)' },
    { value: 'bg-gradient-primary', label: 'Primary Gradient' },
    { value: 'bg-gradient-secondary', label: 'Secondary Gradient' },
    { value: 'bg-glass', label: 'Glass Effect' },
    { value: 'bg-glass-dark', label: 'Dark Glass' },
    { value: 'bg-primary/10', label: 'Primary Tint' },
    { value: 'bg-secondary/10', label: 'Secondary Tint' },
  ];

  const calculateAccessibilityScores = () => {
    const scores = [];
    
    try {
      const bgValue = getComputedStyle(document.documentElement).getPropertyValue(`--card`).trim();
      
      // Number vs Background
      if (number && bgValue) {
        const numValue = getComputedStyle(document.documentElement).getPropertyValue(`--${numberColor}`).trim();
        if (numValue) {
          const ratio = calculateContrastRatio(`hsl(${bgValue})`, `hsl(${numValue})`);
          scores.push({
            label: 'Card Number',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }

      // Title vs Background
      if (title && bgValue) {
        const titleValue = getComputedStyle(document.documentElement).getPropertyValue(`--${titleColor}`).trim();
        if (titleValue) {
          const ratio = calculateContrastRatio(`hsl(${bgValue})`, `hsl(${titleValue})`);
          scores.push({
            label: 'Title Text',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }

      // Description vs Background
      if (description && bgValue) {
        const descValue = getComputedStyle(document.documentElement).getPropertyValue(`--${descriptionColor}`).trim();
        if (descValue) {
          const ratio = calculateContrastRatio(`hsl(${bgValue})`, `hsl(${descValue})`);
          scores.push({
            label: 'Description Text',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }

      // CTA Button contrast
      if (ctaText) {
        const ctaBgValue = getComputedStyle(document.documentElement).getPropertyValue(`--${ctaBgColor}`).trim();
        const ctaTxtValue = getComputedStyle(document.documentElement).getPropertyValue(`--${ctaTextColor}`).trim();
        if (ctaBgValue && ctaTxtValue) {
          const ratio = calculateContrastRatio(`hsl(${ctaBgValue})`, `hsl(${ctaTxtValue})`);
          scores.push({
            label: 'Button Text',
            ratio,
            level: getContrastLevel(ratio),
            pass: ratio >= 4.5,
          });
        }
      }
    } catch (error) {
      console.error('Error calculating accessibility scores:', error);
    }

    return scores;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { element_id: `${elementIdPrefix}-background`, background_class: background },
        { element_id: `${elementIdPrefix}-number`, content: number, color_token: numberColor },
        { element_id: `${elementIdPrefix}-title`, content: title, color_token: titleColor },
        { element_id: `${elementIdPrefix}-description`, content: description, color_token: descriptionColor },
        { element_id: `${elementIdPrefix}-cta`, content: ctaText, color_token: ctaTextColor },
      ];

      // Save background
      const bgData = updates[0];
      // @ts-ignore
      const { data: existingBg } = await supabase
        .from('background_styles')
        .select('id')
        .eq('element_id', bgData.element_id)
        .maybeSingle();

      if (existingBg) {
        // @ts-ignore
        await supabase
          .from('background_styles')
          .update({ background_class: bgData.background_class })
          .eq('element_id', bgData.element_id);
      } else {
        // @ts-ignore
        await supabase
          .from('background_styles')
          .insert([{
            element_id: bgData.element_id,
            background_class: bgData.background_class,
          }]);
      }

      // Save text elements
      for (const update of updates.slice(1)) {
        // @ts-ignore
        const { data: existing } = await supabase
          .from('text_content')
          .select('id')
          .eq('element_id', update.element_id)
          .maybeSingle();

        if (existing) {
          // @ts-ignore
          await supabase
            .from('text_content')
            .update({ content: update.content, color_token: update.color_token })
            .eq('element_id', update.element_id);
        } else {
          // @ts-ignore
          await supabase
            .from('text_content')
            .insert([{
              element_id: update.element_id,
              content: update.content,
              color_token: update.color_token,
              element_type: 'text',
              page_location: 'unknown',
              section: 'unknown',
            }]);
        }
      }

      toast.success('All changes saved successfully');
      onSave?.({
        background,
        number,
        numberColor,
        title,
        titleColor,
        description,
        descriptionColor,
        ctaText,
        ctaUrl,
        ctaBgColor,
        ctaTextColor,
      });
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const accessibilityScores = calculateAccessibilityScores();
  const hasIssues = accessibilityScores.some(s => !s.pass);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Component Styles</DialogTitle>
          <DialogDescription>
            Customize all aspects of this component including background, text, and colors
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Live Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Live Preview</label>
            <div className={cn('p-6 rounded-xl border', background)}>
              {number && (
                <div className="mb-4">
                  <span className={cn('text-2xl font-bold', `text-${numberColor}`)}>{number}</span>
                </div>
              )}
              {title && (
                <h3 className={cn('text-xl font-bold mb-2', `text-${titleColor}`)}>{title}</h3>
              )}
              {description && (
                <p className={cn('mb-4', `text-${descriptionColor}`)}>{description}</p>
              )}
              {ctaText && (
                <button className={cn('px-4 py-2 rounded-lg', `bg-${ctaBgColor}`, `text-${ctaTextColor}`)}>
                  {ctaText}
                </button>
              )}
            </div>

            {/* Accessibility Report */}
            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium">Accessibility Report</label>
              <div className="border rounded-lg p-4 space-y-2">
                {accessibilityScores.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add content to see accessibility scores</p>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      {hasIssues ? (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                      <span className="font-medium">
                        {hasIssues ? 'Some Issues Found' : 'All Checks Passed'}
                      </span>
                    </div>
                    {accessibilityScores.map((score, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{score.label}</span>
                        <span className={score.pass ? 'text-green-400' : 'text-red-400'}>
                          {score.ratio.toFixed(1)}:1 ({score.level})
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Edit Tabs */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="background">
                  <Palette className="w-4 h-4 mr-1" />
                  Background
                </TabsTrigger>
                <TabsTrigger value="text">
                  <Type className="w-4 h-4 mr-1" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="cta">
                  <MousePointer className="w-4 h-4 mr-1" />
                  CTA
                </TabsTrigger>
              </TabsList>

              <TabsContent value="background" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Background Style</label>
                  <Select value={background} onValueChange={setBackground}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {backgroundOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Card Number</label>
                  <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="01" />
                  <Select value={numberColor} onValueChange={setNumberColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card Title" />
                  <Select value={titleColor} onValueChange={setTitleColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Description text..." 
                  />
                  <Select value={descriptionColor} onValueChange={setDescriptionColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="cta" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text</label>
                  <Input value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Learn More" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button URL</label>
                  <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="/link" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Background Color</label>
                  <Select value={ctaBgColor} onValueChange={setCtaBgColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Button Text Color</label>
                  <Select value={ctaTextColor} onValueChange={setCtaTextColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
