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
import { useColorSystem } from '@/hooks/useColorSystem';
import type { ColorOption } from '@/config/colorSystem';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  
  // State for all editable elements
  const [background, setBackground] = useState(initialData.background || 'bg-card');
  const [iconCardBg, setIconCardBg] = useState('bg-white/10');
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

  // Load actual saved data from database when modal opens
  useEffect(() => {
    if (!isOpen || !elementIdPrefix) return;
    
    const loadSavedData = async () => {
      setLoading(true);
      try {
        // Load background
        const { data: bgData } = await supabase
          .from('background_styles')
          .select('background_class')
          .eq('element_id', `${elementIdPrefix}-background`)
          .maybeSingle();
        
        if (bgData?.background_class) {
          setBackground(bgData.background_class);
        }

        // Load icon card background
        const { data: iconBgData } = await supabase
          .from('background_styles')
          .select('background_class')
          .eq('element_id', `${elementIdPrefix}-icon-card`)
          .maybeSingle();
        
        if (iconBgData?.background_class) {
          setIconCardBg(iconBgData.background_class);
        }
        
        // Load text elements
        const elements = ['number', 'title', 'description', 'cta'];
        for (const elem of elements) {
          const { data } = await supabase
            .from('text_content')
            .select('content, color_token')
            .eq('element_id', `${elementIdPrefix}-${elem}`)
            .maybeSingle();
          
          if (data) {
            switch(elem) {
              case 'number':
                if (data.content) setNumber(data.content);
                if (data.color_token) setNumberColor(data.color_token);
                break;
              case 'title':
                if (data.content) setTitle(data.content);
                if (data.color_token) setTitleColor(data.color_token);
                break;
              case 'description':
                if (data.content) setDescription(data.content);
                if (data.color_token) setDescriptionColor(data.color_token);
                break;
              case 'cta':
                if (data.content) setCtaText(data.content);
                if (data.color_token) setCtaTextColor(data.color_token);
                break;
            }
          }
        }
      } catch (error) {
        console.error('Error loading saved data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSavedData();
  }, [isOpen, elementIdPrefix]);

  // Load color system from database
  const {
    SOLID_COLORS,
    GRADIENT_COLORS,
    GLASS_EFFECTS,
    TEXT_COLOR_OPTIONS,
    loading: colorSystemLoading,
  } = useColorSystem();

  const colorOptions = getColorTokenOptions();

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

  // Helper to normalize color token for comparison
  const normalizeColorToken = (token: string) => {
    return token.replace('text-', '').replace('--', '').trim();
  };

  const isColorSelected = (colorValue: string, currentValue: string) => {
    const normalized1 = normalizeColorToken(colorValue);
    const normalized2 = normalizeColorToken(currentValue);
    
    // Also handle cases where white === primary-foreground, etc.
    const colorMap: Record<string, string[]> = {
      'white': ['white', 'primary-foreground'],
      'primary-foreground': ['white', 'primary-foreground'],
      'foreground': ['foreground'],
      'muted-foreground': ['muted-foreground'],
      'primary': ['primary'],
      'secondary': ['secondary'],
    };
    
    const matches = colorMap[normalized2] || [normalized2];
    return matches.includes(normalized1);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = [
        { element_id: `${elementIdPrefix}-background`, background_class: background },
        { element_id: `${elementIdPrefix}-icon-card`, background_class: iconCardBg },
        { element_id: `${elementIdPrefix}-number`, content: number, color_token: numberColor },
        { element_id: `${elementIdPrefix}-title`, content: title, color_token: titleColor },
        { element_id: `${elementIdPrefix}-description`, content: description, color_token: descriptionColor },
        { element_id: `${elementIdPrefix}-cta`, content: ctaText, color_token: ctaTextColor },
      ];

      // Save backgrounds (main and icon card)
      for (const bgUpdate of updates.slice(0, 2)) {
        // @ts-ignore
        const { data: existingBg } = await supabase
          .from('background_styles')
          .select('id')
          .eq('element_id', bgUpdate.element_id)
          .maybeSingle();

        if (existingBg) {
          // @ts-ignore
          await supabase
            .from('background_styles')
            .update({ background_class: bgUpdate.background_class })
            .eq('element_id', bgUpdate.element_id);
        } else {
          // @ts-ignore
          await supabase
            .from('background_styles')
            .insert([{
              element_id: bgUpdate.element_id,
              background_class: bgUpdate.background_class,
            }]);
        }
      }

      // Save text elements
      for (const update of updates.slice(2)) {
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
        iconCardBg,
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

        {loading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">Loading saved styles...</p>
          </div>
        )}

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

              <TabsContent value="background" className="space-y-6">
                {colorSystemLoading ? (
                  <p className="text-sm text-muted-foreground">Loading color options...</p>
                ) : (
                  <>
                    <div className="space-y-3">
                      <label className="text-sm font-medium">Main Card Background</label>
                      <Tabs defaultValue="gradients" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="gradients">Gradients ({GRADIENT_COLORS.length})</TabsTrigger>
                          <TabsTrigger value="glass">Glass ({GLASS_EFFECTS.length})</TabsTrigger>
                          <TabsTrigger value="solids">Solids ({SOLID_COLORS.length})</TabsTrigger>
                        </TabsList>

                    <TabsContent value="gradients" className="mt-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {GRADIENT_COLORS.map((bg) => (
                          <Card
                            key={bg.value}
                            className={cn(
                              'p-3 cursor-pointer transition-all hover:shadow-md',
                              background === bg.value ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-border'
                            )}
                            onClick={() => setBackground(bg.value)}
                          >
                            <div className={cn('h-20 rounded-lg mb-2 relative flex items-center justify-center', bg.preview)}>
                              {background === bg.value && (
                                <Check className="absolute top-1 right-1 w-5 h-5 text-white bg-primary rounded-full p-0.5" />
                              )}
                              <span className="text-xs font-medium text-white opacity-70">Preview</span>
                            </div>
                            <h4 className="font-semibold text-xs truncate">{bg.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{bg.description}</p>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="glass" className="mt-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {GLASS_EFFECTS.map((bg) => (
                          <Card
                            key={bg.value}
                            className={cn(
                              'p-3 cursor-pointer transition-all hover:shadow-md',
                              background === bg.value ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-border'
                            )}
                            onClick={() => setBackground(bg.value)}
                          >
                            <div className="relative h-20 rounded-lg mb-2 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-hero" />
                              <div className={cn('absolute inset-0 flex items-center justify-center', bg.preview)}>
                                {background === bg.value && (
                                  <Check className="absolute top-1 right-1 w-5 h-5 text-white bg-primary rounded-full p-0.5" />
                                )}
                                <span className="text-xs font-medium text-white opacity-70">Glass</span>
                              </div>
                            </div>
                            <h4 className="font-semibold text-xs truncate">{bg.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{bg.description}</p>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="solids" className="mt-4">
                      <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {SOLID_COLORS.map((bg) => (
                          <Card
                            key={bg.value}
                            className={cn(
                              'p-3 cursor-pointer transition-all hover:shadow-md',
                              background === bg.value ? 'ring-2 ring-primary shadow-lg' : 'hover:ring-1 hover:ring-border'
                            )}
                            onClick={() => setBackground(bg.value)}
                          >
                            <div className={cn('h-20 rounded-lg mb-2 relative flex items-center justify-center border', bg.preview)}>
                              {background === bg.value && (
                                <Check className="absolute top-1 right-1 w-5 h-5 text-primary bg-white rounded-full p-0.5" />
                              )}
                              <span className={cn('text-xs font-medium', bg.optimalTextColor === 'white' ? 'text-white' : 'text-foreground')}>
                                Solid
                              </span>
                            </div>
                            <h4 className="font-semibold text-xs truncate">{bg.label}</h4>
                            <p className="text-xs text-muted-foreground truncate">{bg.description}</p>
                          </Card>
                        ))}
                      </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-medium">Inner Card Background (Icon Area)</label>
                      <p className="text-xs text-muted-foreground">Controls the background of the card containing icons/images</p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: 'bg-white/10', label: 'White/10' },
                          { value: 'bg-white/20', label: 'White/20' },
                          { value: 'bg-card', label: 'Card' },
                          { value: 'bg-background', label: 'Background' },
                          { value: 'bg-muted', label: 'Muted' },
                          { value: 'bg-primary/10', label: 'Primary/10' },
                          { value: 'bg-white', label: 'White' },
                          { value: 'bg-transparent', label: 'Transparent' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            className={cn(
                              'h-16 rounded-lg border-2 transition-all hover:scale-105 relative overflow-hidden',
                              iconCardBg === opt.value 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            )}
                            onClick={() => setIconCardBg(opt.value)}
                          >
                            <div className={cn('absolute inset-0', opt.value)} />
                            {iconCardBg === opt.value && (
                              <Check className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full p-0.5" />
                            )}
                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-foreground bg-white/90 px-1.5 py-0.5 rounded">
                              {opt.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Card Number</label>
                  <Input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="01" />
                  <label className="text-sm font-medium mt-2">Number Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setNumberColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105',
                          isColorSelected(colorOption.value, numberColor)
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-border',
                          background
                        )}
                        title={colorOption.description}
                      >
                        <div className={cn('text-center font-bold text-xl', colorOption.className)}>Aa</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Card Title" />
                  <label className="text-sm font-medium mt-2">Title Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setTitleColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105',
                          isColorSelected(colorOption.value, titleColor)
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-border',
                          background
                        )}
                        title={colorOption.description}
                      >
                        <div className={cn('text-center font-bold text-xl', colorOption.className)}>Aa</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Description text..." 
                  />
                  <label className="text-sm font-medium mt-2">Description Color</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TEXT_COLOR_OPTIONS.map((colorOption) => (
                      <button
                        key={colorOption.value}
                        onClick={() => setDescriptionColor(colorOption.value.replace('text-', ''))}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all hover:scale-105',
                          isColorSelected(colorOption.value, descriptionColor)
                            ? 'border-primary ring-2 ring-primary/20'
                            : 'border-transparent hover:border-border',
                          background
                        )}
                        title={colorOption.description}
                      >
                        <div className={cn('text-center font-bold text-xl', colorOption.className)}>Aa</div>
                      </button>
                    ))}
                  </div>
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
